import { supabaseAdmin } from "@/lib/supabaseAdmin";
import crypto from "crypto";
import { generateStatementPDF } from "@/lib/generateStatementPDF";

const MONTH_LABELS = {
  jan: "January",
  january: "January",
  feb: "February",
  february: "February",
  mar: "March",
  march: "March",
  apr: "April",
  april: "April",
  may: "May",
  jun: "June",
  june: "June",
  jul: "July",
  july: "July",
  aug: "Aug",
  august: "Aug",
  sep: "September",
  sept: "September",
  september: "September",
  oct: "October",
  october: "October",
  nov: "November",
  november: "November",
  dec: "December",
  december: "December",
};

function generateFingerprint(date, description, debit, credit) {
  const raw = `${date}${description.toLowerCase().trim()}${debit ?? 0}${credit ?? 0}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function recalculateBalances(transactions, openingBalance) {
  let running = openingBalance ?? 0;
  return transactions.map((t) => {
    running += t.amount;
    return { ...t, balance_after: Number(running.toFixed(2)) };
  });
}

function normalizeMonthLabel(rawValue) {
  if (!rawValue) return "";
  const token = String(rawValue).replace(/[^a-z]/gi, "").toLowerCase();
  return MONTH_LABELS[token] || "";
}

function normalizeYearValue(rawValue) {
  if (!rawValue) return "";
  const match = String(rawValue).match(/\b(20\d{2})\b/);
  return match?.[1] || "";
}

function getStatementMonthYear(sheetName, startDate, endDate) {
  const tokens = String(sheetName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const monthFromName = normalizeMonthLabel(tokens[0]);
  const yearFromName = normalizeYearValue(tokens[1]);
  const monthFromStartDate = startDate
    ? normalizeMonthLabel(
        new Date(`${startDate}T00:00:00`).toLocaleDateString("en-US", {
          month: "long",
        }),
      )
    : "";
  const yearFromEndDate = endDate
    ? String(new Date(`${endDate}T00:00:00`).getFullYear())
    : "";

  return {
    month: monthFromName || monthFromStartDate,
    year: yearFromName || yearFromEndDate,
  };
}

export async function POST(req) {
  try {
    const body = await req.json();
    // 1. Destructure the new is_manual flag
    const { account_id, sheets, is_manual } = body;

    console.log(
      `[1] Payload received — account_id: ${account_id} | sheets count: ${sheets?.length} | is_manual: ${!!is_manual}`
    );

    if (!account_id) {
      return Response.json({ error: "Missing account_id" }, { status: 400 });
    }

    if (!sheets || !Array.isArray(sheets) || sheets.length === 0) {
      return Response.json({ error: "No sheets provided" }, { status: 400 });
    }

    const { data: accountData, error: accountError } = await supabaseAdmin
      .from("accounts")
      .select("id, user_id, account_name, account_number, address, balance") // Fetched balance just in case
      .eq("id", account_id)
      .single();

    if (accountError || !accountData) {
      return Response.json({ error: "Account not found" }, { status: 404 });
    }

    const user_id = accountData.user_id;
    const rawAccountNumber = accountData.account_number || "";
    const digitsOnly = rawAccountNumber.replace(/\D/g, "");
    const last4 = digitsOnly.slice(-4);

    let totalInserted = 0;
    let totalStatements = 0;
    let latestEndDate = null;
    let latestClosingBalance = null;

    for (const sheet of sheets) {
      const { sheet_name, opening_balance, transactions } = sheet;

      if (!transactions || transactions.length === 0) continue;

      const withFingerprints = transactions.map((t) => ({
        ...t,
        fingerprint: generateFingerprint(t.date, t.description, t.debit, t.credit),
      }));

      const fingerprints = withFingerprints.map((t) => t.fingerprint);

      const { data: existingRows } = await supabaseAdmin
        .from("transactions")
        .select("fingerprint")
        .eq("account_id", account_id)
        .in("fingerprint", fingerprints);

      const existingFingerprints = new Set((existingRows || []).map((r) => r.fingerprint));
      const newTransactions = withFingerprints.filter(
        (t) => !existingFingerprints.has(t.fingerprint)
      );

      if (newTransactions.length === 0) continue;

      const sorted = newTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));
      const withBalances = recalculateBalances(sorted, opening_balance);

      const start_date = withBalances[0].date;
      const end_date = withBalances[withBalances.length - 1].date;
      const closing_bal = withBalances[withBalances.length - 1].balance_after;

      let statement_id = null;

      // 2. Bypass Statement Creation if Manual
      if (!is_manual) {
        const { month: statementMonth, year: statementYear } = getStatementMonthYear(
          sheet_name,
          start_date,
          end_date
        );

        const { data: statementData, error: statementError } = await supabaseAdmin
          .from("statements")
          .insert({
            account_id,
            sheet_name,
            month: statementMonth,
            year: statementYear,
            start_date,
            end_date,
            opening_bal: opening_balance,
            closing_bal,
            file_url: "",
          })
          .select("id")
          .single();

        if (statementError) {
          console.error(`[9a] Statement insert failed:`, statementError);
          continue;
        }
        statement_id = statementData.id;
      }

      // 3. Insert Transactions (statement_id will safely be null for manual entries)
      const records = withBalances.map((t) => ({
        user_id,
        account_id,
        statement_id, // Null if is_manual
        date: t.date,
        description: t.description,
        debit: t.debit ?? null,
        credit: t.credit ?? null,
        amount: t.amount,
        type: t.type,
        balance_after: is_manual ? null : t.balance_after, // Don't save inaccurate running balances for single entries
        fingerprint: t.fingerprint,
        source: is_manual ? "manual_entry" : "excel_import", // Hardcoded source override
      }));

      const { error: insertError } = await supabaseAdmin.from("transactions").insert(records);

      if (insertError) {
        console.error(`[11a] Transaction insert failed:`, insertError);
        if (!is_manual && statement_id) {
          await supabaseAdmin.from("statements").delete().eq("id", statement_id);
        }
        continue;
      }

      totalInserted += records.length;

      // 4. Bypass PDF Generation & Upload if Manual
      if (!is_manual) {
        totalStatements += 1;
        const totalDeposits = withBalances.reduce((sum, t) => sum + (t.credit ?? 0), 0);
        const totalDebits = withBalances.reduce((sum, t) => sum + (t.debit ?? 0), 0);
        const totalDepositCount = withBalances.filter((t) => (t.credit ?? 0) > 0).length;
        const totalDebitCount = withBalances.filter((t) => (t.debit ?? 0) > 0).length;

        try {
          const pdfBuffer = await generateStatementPDF({
            account: accountData,
            statement: { start_date, end_date, opening_bal: opening_balance, closing_bal, total_deposits: totalDeposits, total_debits: totalDebits, total_deposit_count: totalDepositCount, total_debit_count: totalDebitCount },
            transactions: withBalances,
          });

          const fileName = `Business Account Statement-${last4} ${end_date}`;
          const filePath = `${account_id}/${fileName.replace(/\s+/g, "_")}.pdf`;

          const { error: uploadError } = await supabaseAdmin.storage
            .from("statements")
            .upload(filePath, pdfBuffer, { contentType: "application/pdf", upsert: true });

          if (!uploadError) {
            const { data: urlData } = supabaseAdmin.storage.from("statements").getPublicUrl(filePath);
            await supabaseAdmin.from("statements").update({ file_url: urlData.publicUrl }).eq("id", statement_id);
          }
        } catch (pdfError) {
          console.error(`[12a] PDF generation/upload failed:`, pdfError);
        }

        // Only track latest balances for bulk statements
        if (!latestEndDate || end_date > latestEndDate) {
          latestEndDate = end_date;
          latestClosingBalance = closing_bal;
        }
      } else {
        // 5. Safely increment the account balance for manual transactions instead of overwriting it
        const totalManualAmount = sorted.reduce((sum, t) => sum + t.amount, 0);
        const newAccountBalance = (accountData.balance || 0) + totalManualAmount;
        
        await supabaseAdmin
          .from("accounts")
          .update({ balance: newAccountBalance })
          .eq("id", account_id);
        console.log(`[15] Manual entry: accounts.balance incremented to ${newAccountBalance}`);
      }
    }

    // 6. Bulk Statement Account Balance Overwrite (Unchanged)
    if (!is_manual && latestClosingBalance !== null) {
      await supabaseAdmin
        .from("accounts")
        .update({ balance: latestClosingBalance })
        .eq("id", account_id);
      console.log(`[15] Bulk entry: accounts.balance updated to ${latestClosingBalance}`);
    }

    return Response.json({
      message: is_manual ? "Manual transaction saved" : "Statement imported successfully",
      count: totalInserted,
      statements: totalStatements,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

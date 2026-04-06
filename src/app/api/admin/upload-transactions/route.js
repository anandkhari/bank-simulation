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
  let running = Number((openingBalance ?? 0).toFixed(2));
  return transactions.map((t) => {
    running = Number((running + Number(t.amount)).toFixed(2));
    return { ...t, balance_after: running };
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

// Validate and correct amount signs before processing
const validatedTransactions = newTransactions.map((t) => {
  const credit = Number(t.credit ?? 0);
  const debit = Number(t.debit ?? 0);
  let amount = Number(t.amount);

  // If amount is missing or NaN, derive it from debit/credit
  if (!amount || isNaN(amount)) {
    amount = credit > 0 ? credit : -debit;
  }

  // Ensure sign is consistent with debit/credit
  if (credit > 0 && amount < 0) {
    console.warn(`[sign-fix] Credit had negative amount — corrected: ${t.description}`);
    amount = Math.abs(amount);
  }

  if (debit > 0 && amount > 0) {
    console.warn(`[sign-fix] Debit had positive amount — corrected: ${t.description}`);
    amount = -Math.abs(amount);
  }

  return { ...t, amount: Number(amount.toFixed(2)) };
});

const sorted = validatedTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));

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

      // 3. Fetch true previous balance for Manual Entries
      let manualBalanceAfter = null;

      let manualSortOrder = 1; // default

if (is_manual) {
  // Fetch true previous balance using correct ordering
  const { data: lastTxs } = await supabaseAdmin
    .from("transactions")
    .select("balance_after")
    .eq("account_id", account_id)
    .order("date", { ascending: false })
    .order("sort_order", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(1);

  const { data: accountMeta } = await supabaseAdmin
  .from("accounts")
  .select("opening_balance")
  .eq("id", account_id)
  .single();

const previousBalance = (lastTxs && lastTxs.length > 0)
  ? Number(lastTxs[0].balance_after)
  : Number(accountMeta?.opening_balance ?? 0);

  manualBalanceAfter = Number((previousBalance + sorted[0].amount).toFixed(2));

  // Find the next sort_order for this account + date
  const transactionDate = sorted[0].date;
  const { data: sameDayTxs } = await supabaseAdmin
    .from("transactions")
    .select("sort_order")
    .eq("account_id", account_id)
    .eq("date", transactionDate)
    .order("sort_order", { ascending: false, nullsFirst: false })
    .limit(1);

  manualSortOrder = sameDayTxs && sameDayTxs.length > 0
    ? (sameDayTxs[0].sort_order ?? 0) + 1
    : 1;
}

     // For bulk: pre-fetch existing sort_order counts per date
const existingSortOrders = {};
if (!is_manual) {
  const uniqueDates = [...new Set(withBalances.map((t) => t.date))];
  const { data: existingCounts } = await supabaseAdmin
    .from("transactions")
    .select("date, sort_order")
    .eq("account_id", account_id)
    .in("date", uniqueDates)
    .order("sort_order", { ascending: false, nullsFirst: false });

  // Track the highest sort_order already in DB per date
  for (const row of existingCounts || []) {
    if (!existingSortOrders[row.date] || row.sort_order > existingSortOrders[row.date]) {
      existingSortOrders[row.date] = row.sort_order ?? 0;
    }
  }
}

// Track incrementing sort_order per date for bulk
const bulkSortCounters = {};

const records = withBalances.map((t) => {
  let sort_order;

  if (is_manual) {
    sort_order = manualSortOrder;
  } else {
    // Start from after the highest existing sort_order for that date
    if (bulkSortCounters[t.date] === undefined) {
      bulkSortCounters[t.date] = (existingSortOrders[t.date] ?? 0) + 1;
    } else {
      bulkSortCounters[t.date] += 1;
    }
    sort_order = bulkSortCounters[t.date];
  }

  return {
    user_id,
    account_id,
    statement_id,
    date: t.date,
    description: t.description,
    debit: t.debit ?? null,
    credit: t.credit ?? null,
    amount: t.amount,
    type: t.type,
    balance_after: is_manual ? manualBalanceAfter : t.balance_after,
    fingerprint: t.fingerprint,
    source: is_manual ? "manual_entry" : "excel_import",
    sort_order, // ✅ now always assigned
  };
});

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
            .upload(filePath, pdfBuffer, {
              contentType: "application/pdf",
              upsert: true,
              cacheControl: "0",
            });

          if (!uploadError) {
            const { data: urlData } = supabaseAdmin.storage.from("statements").getPublicUrl(filePath);
            const versionedUrl = `${urlData.publicUrl}?v=${Date.now()}`;
            await supabaseAdmin
              .from("statements")
              .update({ file_url: versionedUrl })
              .eq("id", statement_id);
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
        // 5. Update the master account balance using our new, accurate manual balance
        await supabaseAdmin
          .from("accounts")
          .update({ balance: manualBalanceAfter })
          .eq("id", account_id);
        console.log(`[15] Manual entry: accounts.balance synced to ${manualBalanceAfter}`);
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

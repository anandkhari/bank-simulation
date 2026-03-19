import { supabaseAdmin } from "@/lib/supabaseAdmin";
import crypto from "crypto";
import { generateStatementPDF } from "@/lib/generateStatementPDF";

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

export async function POST(req) {
  try {
    const body = await req.json();
    const { account_id, sheets } = body;

    console.log(
      "[1] Payload received — account_id:",
      account_id,
      "sheets count:",
      sheets?.length,
    );

    if (!account_id) {
      return Response.json({ error: "Missing account_id" }, { status: 400 });
    }

    if (!sheets || !Array.isArray(sheets) || sheets.length === 0) {
      return Response.json({ error: "No sheets provided" }, { status: 400 });
    }

    const { data: accountData, error: accountError } = await supabaseAdmin
      .from("accounts")
      .select("id, user_id, account_name, account_number, address")
      .eq("id", account_id)
      .single();

    console.log(
      "[2] Account fetch — error:",
      accountError,
      "data:",
      accountData,
    );

    if (accountError || !accountData) {
      return Response.json({ error: "Account not found" }, { status: 404 });
    }

    const user_id = accountData.user_id;

    let totalInserted = 0;
    let totalStatements = 0;
    let latestEndDate = null;
    let latestClosingBalance = null;

    for (const sheet of sheets) {
      const { sheet_name, opening_balance, transactions } = sheet;

      console.log(
        `[3] Processing sheet: ${sheet_name} — transactions: ${transactions?.length} — opening_balance: ${opening_balance}`,
      );

      if (!transactions || transactions.length === 0) {
        console.log(`[3a] Skipping ${sheet_name} — no transactions`);
        continue;
      }

      const withFingerprints = transactions.map((t) => ({
        ...t,
        fingerprint: generateFingerprint(
          t.date,
          t.description,
          t.debit,
          t.credit,
        ),
      }));

      console.log(
        `[4] Fingerprints generated for ${sheet_name} — count: ${withFingerprints.length}`,
      );

      const fingerprints = withFingerprints.map((t) => t.fingerprint);

      const { data: existingRows, error: fingerprintError } =
        await supabaseAdmin
          .from("transactions")
          .select("fingerprint")
          .eq("account_id", account_id)
          .in("fingerprint", fingerprints);

      console.log(
        `[5] Duplicate check for ${sheet_name} — existing: ${existingRows?.length} — error: ${fingerprintError?.message}`,
      );

      const existingFingerprints = new Set(
        (existingRows || []).map((r) => r.fingerprint),
      );

      const newTransactions = withFingerprints.filter(
        (t) => !existingFingerprints.has(t.fingerprint),
      );

      console.log(
        `[6] New transactions after dedup for ${sheet_name}: ${newTransactions.length}`,
      );

      if (newTransactions.length === 0) {
        console.log(
          `[6a] All transactions already exist for ${sheet_name}, skipping.`,
        );
        continue;
      }

      const sorted = newTransactions.sort(
        (a, b) => new Date(a.date) - new Date(b.date),
      );

      const withBalances = recalculateBalances(sorted, opening_balance);

      console.log(`[7] Balances recalculated for ${sheet_name}`);

      const start_date = withBalances[0].date;
      const end_date = withBalances[withBalances.length - 1].date;
      const closing_bal = withBalances[withBalances.length - 1].balance_after;

      console.log(
        `[8] Statement details — start: ${start_date} end: ${end_date} closing: ${closing_bal}`,
      );

      const { data: statementData, error: statementError } = await supabaseAdmin
        .from("statements")
        .insert({
          account_id,
          sheet_name,
          month: sheet_name.trim().split(" ")[0],
          year: sheet_name.trim().split(" ")[1],
          start_date,
          end_date,
          opening_bal: opening_balance,
          closing_bal,
          file_url: "",
        })
        .select("id")
        .single();

      console.log(
        `[9] Statement insert for ${sheet_name} — error: ${statementError?.message} — id: ${statementData?.id}`,
      );

      if (statementError) {
        console.error(
          `[9a] Statement insert failed for ${sheet_name}:`,
          statementError,
        );
        continue;
      }

      const statement_id = statementData.id;

      const records = withBalances.map((t) => ({
        user_id,
        account_id,
        statement_id,
        date: t.date,
        description: t.description,
        debit: t.debit ?? null,
        credit: t.credit ?? null,
        amount: t.amount,
        type: t.type,
        balance_after: t.balance_after,
        fingerprint: t.fingerprint,
        source: "excel_import",
      }));

      console.log(
        `[10] Inserting ${records.length} transactions for ${sheet_name}`,
      );

      const { error: insertError } = await supabaseAdmin
        .from("transactions")
        .insert(records);

      console.log(
        `[11] Transaction insert for ${sheet_name} — error: ${insertError?.message}`,
      );

      if (insertError) {
        console.error(
          `[11a] Transaction insert failed for ${sheet_name}:`,
          insertError,
        );
        await supabaseAdmin.from("statements").delete().eq("id", statement_id);
        continue;
      }

      let pdfBuffer;
      try {
        pdfBuffer = await generateStatementPDF({
          account: accountData,
          statement: {
            start_date,
            end_date,
            opening_bal: opening_balance,
            closing_bal,
          },
          transactions: withBalances,
        });
        console.log(`[12] PDF generated for ${sheet_name}`);
      } catch (pdfError) {
        console.error(
          `[12a] PDF generation failed for ${sheet_name}:`,
          pdfError,
        );
        totalInserted += records.length;
        totalStatements += 1;
        continue;
      }

      const filePath = `${account_id}/${sheet_name}.pdf`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("statements")
        .upload(filePath, pdfBuffer, {
          contentType: "application/pdf",
          upsert: true,
        });

      console.log(
        `[13] PDF upload for ${sheet_name} — error: ${uploadError?.message}`,
      );

      if (uploadError) {
        console.error(
          `[13a] PDF upload failed for ${sheet_name}:`,
          uploadError,
        );
        totalInserted += records.length;
        totalStatements += 1;
        continue;
      }

      const { data: urlData } = supabaseAdmin.storage
        .from("statements")
        .getPublicUrl(filePath);

      await supabaseAdmin
        .from("statements")
        .update({ file_url: urlData.publicUrl })
        .eq("id", statement_id);

      console.log(
        `[14] file_url updated for ${sheet_name}: ${urlData.publicUrl}`,
      );

      totalInserted += records.length;
      totalStatements += 1;

      if (!latestEndDate || end_date > latestEndDate) {
        latestEndDate = end_date;
        latestClosingBalance = closing_bal;
      }
    }

    if (latestClosingBalance !== null) {
      await supabaseAdmin
        .from("accounts")
        .update({ balance: latestClosingBalance })
        .eq("id", account_id);
      console.log(`[15] accounts.balance updated to ${latestClosingBalance}`);
    }

    console.log(
      `[16] Done — totalInserted: ${totalInserted} totalStatements: ${totalStatements}`,
    );

    return Response.json({
      message: "Statement imported successfully",
      count: totalInserted,
      statements: totalStatements,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

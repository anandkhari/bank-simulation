import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  try {
    const { account_id } = await req.json();

    if (!account_id) {
      return Response.json({ error: "Missing account_id" }, { status: 400 });
    }

    // 1. Fetch all transactions for this account in chronological order
    // 1. Fetch all transactions for this account in chronological order
    const { data: transactions, error: fetchError } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("account_id", account_id)
      .order("date", { ascending: true })
      .order("created_at", { ascending: true }); // <-- FIXED: Now uses exact time for same-day entries // Secondary sort prevents same-day overlap bugs

    if (fetchError) throw fetchError;

    // If all transactions were deleted, reset the master balance to 0
    if (!transactions || transactions.length === 0) {
      await supabaseAdmin
        .from("accounts")
        .update({ balance: 0 })
        .eq("id", account_id);
      return Response.json({ success: true, message: "Account reset to 0" });
    }

    // 2. Fetch the starting point from the earliest statement
    const { data: firstStatement } = await supabaseAdmin
      .from("statements")
      .select("opening_bal")
      .eq("account_id", account_id)
      .order("start_date", { ascending: true })
      .limit(1)
      .single();

    // 3. Set the initial balance to the first statement's opening balance (fallback to 0)
    let runningBalance = firstStatement?.opening_bal
      ? Number(firstStatement.opening_bal)
      : 0;

    // 4. Recalculate running balances accurately from that starting point
    const updatedRecords = transactions.map((tx) => {
      runningBalance += Number(tx.amount);
      return {
        ...tx,
        balance_after: Number(runningBalance.toFixed(2)),
      };
    });

    // 5. Update all transaction rows in the database with the fixed math
    const { error: upsertError } = await supabaseAdmin
      .from("transactions")
      .upsert(updatedRecords);

    if (upsertError) throw upsertError;

    // 6. Update the master account balance with the final, mathematically proven number
    const finalBalance =
      updatedRecords[updatedRecords.length - 1].balance_after;
    const { error: accountError } = await supabaseAdmin
      .from("accounts")
      .update({ balance: finalBalance })
      .eq("id", account_id);

    if (accountError) throw accountError;

    return Response.json({ success: true, finalBalance });
  } catch (error) {
    console.error("Recalculate Error:", error);
    return Response.json(
      { error: "Failed to recalculate balances" },
      { status: 500 },
    );
  }
}

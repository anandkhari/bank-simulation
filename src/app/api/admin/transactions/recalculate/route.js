import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  try {
    const { account_id } = await req.json();

    if (!account_id) {
      return Response.json({ error: "Missing account_id" }, { status: 400 });
    }

    // 1. Fetch only required columns for recalculation
    const { data: transactions, error: fetchError } = await supabaseAdmin
      .from("transactions")
      .select("id, amount, date, sort_order, created_at")
      .eq("account_id", account_id)
      .order("date", { ascending: true })
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true }); // last resort tiebreaker only

    if (fetchError) throw fetchError;

    // 2. If all transactions were deleted, reset balance to opening balance
    if (!transactions || transactions.length === 0) {
      const { data: resetAccount } = await supabaseAdmin
        .from("accounts")
        .select("opening_balance")
        .eq("id", account_id)
        .single();

      const resetBalance = resetAccount?.opening_balance
        ? Number(resetAccount.opening_balance)
        : 0;

      await supabaseAdmin
        .from("accounts")
        .update({ balance: resetBalance })
        .eq("id", account_id);

      return Response.json({
        success: true,
        message: `Account reset to opening balance: ${resetBalance}`,
      });
    }

    // 3. Fetch the starting point from the earliest statement
    const { data: firstStatement } = await supabaseAdmin
      .from("statements")
      .select("opening_bal")
      .eq("account_id", account_id)
      .order("start_date", { ascending: true })
      .limit(1)
      .maybeSingle();

    // 4. Get account's opening balance as fallback
    const { data: accountData } = await supabaseAdmin
      .from("accounts")
      .select("opening_balance")
      .eq("id", account_id)
      .single();

    // 5. Set the initial running balance — statement opening takes priority,
    //    falls back to account opening balance, then 0 as last resort
    let runningBalance = firstStatement?.opening_bal
      ? Number(firstStatement.opening_bal)
      : accountData?.opening_balance
        ? Number(accountData.opening_balance)
        : 0;

    // 6. Recalculate running balances with float-safe math
    const updatedRecords = transactions.map((tx) => {
      runningBalance = Number((runningBalance + Number(tx.amount)).toFixed(2));
      return {
        ...tx,
        balance_after: runningBalance,
      };
    });

  
   // 7. Atomically update all transaction balances AND master account balance in batches
const finalBalance = updatedRecords[updatedRecords.length - 1].balance_after;
const BATCH_SIZE = 500;

for (let i = 0; i < updatedRecords.length; i += BATCH_SIZE) {
  const batch = updatedRecords.slice(i, i + BATCH_SIZE);
  const isLastBatch = i + BATCH_SIZE >= updatedRecords.length;

  const { error: rpcError } = await supabaseAdmin.rpc("recalculate_balances", {
    p_account_id: account_id,
    p_records: batch,
    p_final_balance: isLastBatch ? finalBalance : null,
  });

  if (rpcError) throw rpcError;
}

    return Response.json({ success: true, finalBalance });
  } catch (error) {
    console.error("Recalculate Error:", error);
    return Response.json(
      { error: "Failed to recalculate balances" },
      { status: 500 },
    );
  }
}

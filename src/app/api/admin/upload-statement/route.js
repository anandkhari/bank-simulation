import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  try {

    const body = await req.json();

    const { account_id, transactions } = body;

    if (!account_id) {
      return Response.json(
        { error: "Missing account id" },
        { status: 400 }
      );
    }

    if (!transactions || !transactions.length) {
      return Response.json(
        { error: "No transactions provided" },
        { status: 400 }
      );
    }

    // Attach account_id to each transaction
    const records = transactions.map(t => ({
      account_id,
      date: t.date || null,
      description: t.description,
      debit: t.debit || null,
      credit: t.credit || null,
      balance_after: t.balance_after || null
    }));

const { error: insertError } = await supabaseAdmin
  .from("transactions")
  .upsert(records, {
    onConflict: "account_id,date,description,debit,credit",
    ignoreDuplicates: true
  });

    if (insertError) {
      return Response.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    // Update account balance
    const lastBalance = records
      .filter(t => t.balance_after !== null)
      .slice(-1)[0]?.balance_after;

    if (lastBalance !== undefined) {

      await supabaseAdmin
        .from("accounts")
        .update({ balance: lastBalance })
        .eq("id", account_id);

    }

    return Response.json({
      message: "Transactions imported successfully",
      count: records.length
    });

  } catch (err) {

    console.error("Upload error:", err);

    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );

  }
}
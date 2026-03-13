import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req, { params }) {
  try {

    // Next.js 15 requires awaiting params
    const { id } = await params;

    // Fetch account details
    const { data: account, error: accountError } =
      await supabaseAdmin
        .from("accounts")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (accountError) {
      return Response.json(
        { error: accountError.message },
        { status: 500 }
      );
    }

    // Fetch transactions for this account
    const { data: transactions, error: txError } =
      await supabaseAdmin
        .from("transactions")
        .select("*")
        .eq("account_id", id)
        .order("date", { ascending: false });

    if (txError) {
      return Response.json(
        { error: txError.message },
        { status: 500 }
      );
    }

    return Response.json({
      account,
      transactions
    });

  } catch (err) {

    console.error("Account API error:", err);

    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );

  }
}
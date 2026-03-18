import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  try {
    const { account_id } = await req.json();

    if (!account_id) {
      return Response.json(
        { error: "Missing account_id" },
        { status: 400 }
      );
    }

    // 🔥 DELETE ALL TRANSACTIONS FOR ACCOUNT
    const { error } = await supabaseAdmin
      .from("transactions")
      .delete()
      .eq("account_id", account_id);

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // 🔥 RESET ACCOUNT BALANCE
    await supabaseAdmin
      .from("accounts")
      .update({ balance: 0 })
      .eq("id", account_id);

    return Response.json({
      success: true,
      message: "All transactions deleted",
    });

  } catch (err) {
    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
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

export async function DELETE(req, { params }) {
  try {
    // Next.js 15 params
    const { id } = await params;

    // ✅ 1. Validate
    if (!id) {
      return Response.json(
        { success: false, error: "Account ID is required" },
        { status: 400 }
      );
    }

    // ✅ 2. Check if account exists
    const { data: account, error: fetchError } =
      await supabaseAdmin
        .from("accounts")
        .select("id")
        .eq("id", id)
        .maybeSingle();

    if (fetchError) {
      return Response.json(
        { success: false, error: fetchError.message },
        { status: 500 }
      );
    }

    if (!account) {
      return Response.json(
        { success: false, error: "Account not found" },
        { status: 404 }
      );
    }

    // ✅ 3. Delete transactions FIRST
    const { error: txError } = await supabaseAdmin
      .from("transactions")
      .delete()
      .eq("account_id", id);

    if (txError) {
      return Response.json(
        { success: false, error: txError.message },
        { status: 500 }
      );
    }

    // ✅ 4. Delete account
    const { error: accError } = await supabaseAdmin
      .from("accounts")
      .delete()
      .eq("id", id);

    if (accError) {
      return Response.json(
        { success: false, error: accError.message },
        { status: 500 }
      );
    }

    // ✅ 5. Success
    return Response.json({
      success: true,
      message: "Account deleted successfully",
    });

  } catch (err) {

    console.error("DELETE ACCOUNT ERROR:", err);

    return Response.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );

  }
}
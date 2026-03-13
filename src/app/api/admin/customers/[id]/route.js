import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req, { params }) {
  try {

    const { id } = await params;

    // Get customer profile
    const { data: customer, error: customerError } =
      await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

    if (customerError) {
      return Response.json(
        { error: customerError.message },
        { status: 500 }
      );
    }

    // Get accounts belonging to this customer
    const { data: accounts, error: accountError } =
      await supabaseAdmin
        .from("accounts")
        .select("*")
        .eq("user_id", id);

    if (accountError) {
      return Response.json(
        { error: accountError.message },
        { status: 500 }
      );
    }

    return Response.json({
      customer,
      accounts
    });

  } catch (err) {

    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );

  }
}
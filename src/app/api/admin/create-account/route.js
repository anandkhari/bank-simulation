import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  try {

    const body = await req.json();

    const {
      user_id,
      account_name,
      account_type,
      currency,
      balance,
      transit_number,
      account_number
    } = body;

    /* ----------------------------- */
    /* VALIDATION                    */
    /* ----------------------------- */

    if (!transit_number || !account_number) {
      return Response.json(
        { error: "Transit number and account number are required" },
        { status: 400 }
      );
    }

    /* ----------------------------- */
    /* CREATE FULL ACCOUNT NUMBER    */
    /* ----------------------------- */

    const full_account_number = `${transit_number}-${account_number}`;

    /* ----------------------------- */
    /* DUPLICATE CHECK               */
    /* ----------------------------- */

    const { data: existing } = await supabaseAdmin
      .from("accounts")
      .select("id")
      .eq("account_number", full_account_number)
      .maybeSingle();

    if (existing) {
      return Response.json(
        { error: "Account number already exists" },
        { status: 400 }
      );
    }

    /* ----------------------------- */
    /* CREATE ACCOUNT                */
    /* ----------------------------- */

    const { data, error } = await supabaseAdmin
      .from("accounts")
     .insert({
  user_id,
  account_name,
  account_number: full_account_number,
  account_type,
  currency,
  balance,
  opening_balance: balance  // ← preserve forever, never overwrite
})
      .select()
      .single();

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return Response.json({
      message: "Account created successfully",
      account: data
    });

  } catch (err) {

    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );

  }
}
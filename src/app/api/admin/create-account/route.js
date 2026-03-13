import { supabaseAdmin } from "@/lib/supabaseAdmin";

function generateAccountNumber() {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
}

export async function POST(req) {
  try {

    const body = await req.json();

    const {
      user_id,
      account_name,
      account_type,
      currency,
      balance,
      account_number: manualAccountNumber
    } = body;

    let account_number = manualAccountNumber;

    /* ----------------------------- */
    /* AUTO GENERATE ACCOUNT NUMBER  */
    /* ----------------------------- */

    if (!account_number) {

      let isUnique = false;

      while (!isUnique) {

        const generated = generateAccountNumber();

        const { data } = await supabaseAdmin
          .from("accounts")
          .select("id")
          .eq("account_number", generated)
          .maybeSingle();

        if (!data) {
          account_number = generated;
          isUnique = true;
        }

      }

    }

    /* ----------------------------- */
    /* MANUAL ACCOUNT NUMBER CHECK   */
    /* ----------------------------- */

    else {

      const { data: existing } = await supabaseAdmin
        .from("accounts")
        .select("id")
        .eq("account_number", account_number)
        .maybeSingle();

      if (existing) {
        return Response.json(
          { error: "Account number already exists" },
          { status: 400 }
        );
      }

    }

    /* ----------------------------- */
    /* CREATE ACCOUNT                */
    /* ----------------------------- */

    const { data, error } = await supabaseAdmin
      .from("accounts")
      .insert({
        user_id,
        account_name,
        account_number,
        account_type,
        currency,
        balance
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
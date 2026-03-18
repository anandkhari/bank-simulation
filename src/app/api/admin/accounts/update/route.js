import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      id,
      account_name,
      account_type,
      currency,
      balance,
      transit_number,
      account_number,
    } = body;

    /* ----------------------------- */
    /* VALIDATION                    */
    /* ----------------------------- */

    if (!id) {
      return Response.json(
        { error: "Account ID is required" },
        { status: 400 }
      );
    }

    if (!transit_number || !account_number) {
      return Response.json(
        { error: "Transit number and account number are required" },
        { status: 400 }
      );
    }

    /* ----------------------------- */
    /* BUILD FULL ACCOUNT NUMBER     */
    /* ----------------------------- */

    const full_account_number = `${transit_number}-${account_number}`;

    /* ----------------------------- */
    /* DUPLICATE CHECK (EXCLUDE SELF)*/
    /* ----------------------------- */

    const { data: existing } = await supabaseAdmin
      .from("accounts")
      .select("id")
      .eq("account_number", full_account_number)
      .neq("id", id) // 🔥 IMPORTANT (exclude current)
      .maybeSingle();

    if (existing) {
      return Response.json(
        { error: "Account number already exists" },
        { status: 400 }
      );
    }

    /* ----------------------------- */
    /* PREPARE UPDATE DATA           */
    /* ----------------------------- */

    const updateData = {
      account_name,
      account_type,
      account_number: full_account_number,
      currency,
      balance: balance !== "" ? Number(balance) : undefined,
    };

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    /* ----------------------------- */
    /* UPDATE ACCOUNT                */
    /* ----------------------------- */

    const { error } = await supabaseAdmin
      .from("accounts")
      .update(updateData)
      .eq("id", id);

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: "Account updated successfully",
    });

  } catch (err) {
    console.error("Update Account Error:", err);

    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
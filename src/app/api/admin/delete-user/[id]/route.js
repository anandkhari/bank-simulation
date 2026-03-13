import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function DELETE(req, context) {

  try {

    const params = await context.params;
    const user_id = params.id;

    if (!user_id) {
      return Response.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    /*
      STEP 1
      Get all accounts of the user
    */

    const { data: accounts, error: accountFetchError } =
      await supabaseAdmin
        .from("accounts")
        .select("id")
        .eq("user_id", user_id);

    if (accountFetchError) throw accountFetchError;

    const accountIds = accounts?.map((a) => a.id) || [];

    /*
      STEP 2
      Delete transactions
    */

    if (accountIds.length > 0) {

      const { error: transactionDeleteError } =
        await supabaseAdmin
          .from("transactions")
          .delete()
          .in("account_id", accountIds);

      if (transactionDeleteError) throw transactionDeleteError;

    }

    /*
      STEP 3
      Delete accounts
    */

    const { error: accountDeleteError } =
      await supabaseAdmin
        .from("accounts")
        .delete()
        .eq("user_id", user_id);

    if (accountDeleteError) throw accountDeleteError;

    /*
      STEP 4
      Delete profile
    */

    const { error: profileDeleteError } =
      await supabaseAdmin
        .from("profiles")
        .delete()
        .eq("id", user_id);

    if (profileDeleteError) throw profileDeleteError;

    /*
      STEP 5
      Delete auth user
    */

    const { error: authDeleteError } =
      await supabaseAdmin.auth.admin.deleteUser(user_id);

    if (authDeleteError) throw authDeleteError;

    return Response.json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {

    console.error("Delete user error:", error);

    return Response.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );

  }

}
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  try {
    const { account_id } = await req.json();

    if (!account_id) {
      return Response.json({ error: "Missing account_id" }, { status: 400 });
    }

    // 🔥 DELETE ALL PDF FILES FROM STORAGE BUCKET
    const { data: fileList, error: listError } = await supabaseAdmin.storage
      .from("statements")
      .list(account_id);

    if (listError) {
      return Response.json({ error: listError.message }, { status: 500 });
    }

    if (fileList && fileList.length > 0) {
      const filePaths = fileList.map((file) => `${account_id}/${file.name}`);

      const { error: deleteFilesError } = await supabaseAdmin.storage
        .from("statements")
        .remove(filePaths);

      if (deleteFilesError) {
        return Response.json({ error: deleteFilesError.message }, { status: 500 });
      }
    }

    // 🔥 DELETE ALL TRANSACTIONS
    const { error } = await supabaseAdmin
      .from("transactions")
      .delete()
      .eq("account_id", account_id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // 🔥 DELETE ALL STATEMENTS
    const { error: stmtError } = await supabaseAdmin
      .from("statements")
      .delete()
      .eq("account_id", account_id);

    if (stmtError) {
      return Response.json({ error: stmtError.message }, { status: 500 });
    }

    // 🔥 RESET ACCOUNT BALANCE
    await supabaseAdmin
      .from("accounts")
      .update({ balance: 0 })
      .eq("id", account_id);

    return Response.json({
      success: true,
      message: "All transactions, statements and files deleted",
    });
  } catch (err) {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
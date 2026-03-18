import { supabaseAdmin } from "@/lib/supabaseAdmin";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value) {
  return typeof value === "string" && UUID_REGEX.test(value);
}

function logDbError(stage, error, meta = {}) {
  console.error(`[bulk-delete] ${stage} failed`, {
    ...meta,
    message: error?.message,
    details: error?.details,
    hint: error?.hint,
    code: error?.code,
  });
}

export async function POST(req) {
  try {
    const { ids, account_id } = await req.json();

    console.log("[bulk-delete] incoming payload", {
      idsCount: Array.isArray(ids) ? ids.length : null,
      account_id,
    });

    if (!Array.isArray(ids) || ids.length === 0) {
      return Response.json(
        { error: "`ids` must be a non-empty array" },
        { status: 400 },
      );
    }

    if (!isUuid(account_id)) {
      return Response.json(
        { error: "Invalid `account_id` UUID" },
        { status: 400 },
      );
    }

    const cleanIds = [...new Set(ids)].filter(isUuid);

    if (cleanIds.length !== ids.length) {
      return Response.json(
        { error: "One or more transaction ids are invalid UUIDs" },
        { status: 400 },
      );
    }

    const { data: matchingRows, error: matchError } = await supabaseAdmin
      .from("transactions")
      .select("id")
      .eq("account_id", account_id)
      .in("id", cleanIds);

    // 🔥 ADD THIS HERE
    console.log("🧪 DEBUG BULK DELETE:");
    console.log("Sent IDs:", cleanIds.length);
    console.log("Matched IDs:", matchingRows?.length);
    
    if (matchError) {
      logDbError("match-select", matchError, { account_id, cleanIds });
      console.log("Match Error:", matchError);
      return Response.json({ error: matchError.message }, { status: 500 });
    }

    if (!matchingRows || matchingRows.length === 0) {
      return Response.json(
        { error: "No matching transactions found for this account" },
        { status: 404 },
      );
    }

    if (matchingRows.length !== cleanIds.length) {
      return Response.json(
        { error: "Some transaction ids do not belong to the provided account" },
        { status: 400 },
      );
    }

    const { error: deleteError } = await supabaseAdmin
      .from("transactions")
      .delete()
      .eq("account_id", account_id)
      .in("id", cleanIds);

    if (deleteError) {
      logDbError("delete", deleteError, { account_id, cleanIds });
      return Response.json({ error: deleteError.message }, { status: 500 });
    }

    const { data: remainingRows, error: fetchError } = await supabaseAdmin
      .from("transactions")
      .select("debit, credit")
      .eq("account_id", account_id);

    if (fetchError) {
      logDbError("fetch-remaining", fetchError, { account_id });
      return Response.json({ error: fetchError.message }, { status: 500 });
    }

    const balance = (remainingRows || []).reduce((sum, tx) => {
      const credit = Number(tx.credit ?? 0);
      const debit = Number(tx.debit ?? 0);

      if (Number.isNaN(credit) || Number.isNaN(debit)) {
        throw new Error(
          `Non-numeric transaction values detected for account ${account_id}`,
        );
      }

      return sum + credit - debit;
    }, 0);

    const { error: updateError } = await supabaseAdmin
      .from("accounts")
      .update({ balance })
      .eq("id", account_id);

    if (updateError) {
      logDbError("update-account", updateError, { account_id, balance });
      return Response.json({ error: updateError.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      deletedCount: cleanIds.length,
      balance,
    });
  } catch (err) {
    console.error("[bulk-delete] server crash", {
      message: err?.message,
      stack: err?.stack,
    });
    return Response.json(
      { error: err?.message || "Server crash" },
      { status: 500 },
    );
  }
}

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      id,
      name,
      email,
      phone,
      client_card,
      password,
    } = body;

    if (!id) {
      return Response.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // ✅ 1. UPDATE PROFILE TABLE
    const { error: profileError } = await supabaseAdmin
      .from("profiles") // ✅ FIXED
      .update({
        name,
        email,
        phone,
        client_card,
      })
      .eq("id", id);

    if (profileError) {
      return Response.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    // ✅ 2. UPDATE PASSWORD (AUTH SYSTEM)
    if (password && password.trim() !== "") {

      const loginEmail = `${client_card}@bank.local`;

      const { error: authError } =
        await supabaseAdmin.auth.admin.updateUserById(id, {
          password,
          email: loginEmail, // 🔥 update email if client_card changed
        });

      if (authError) {
        return Response.json(
          { error: authError.message },
          { status: 500 }
        );
      }
    }

    return Response.json({
      success: true,
      message: "Customer updated successfully",
    });

  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  try {

    const body = await req.json();

    const { client_card, password, name, email, phone } = body;

    // convert client card to login email for Supabase auth
    const loginEmail = `${client_card}@bank.local`;

    // STEP 1: create auth user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: loginEmail,
      password,
      email_confirm: true
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    // STEP 2: create profile
    await supabaseAdmin.from("profiles").insert({
      id: data.user.id,
      name,
      email,
      phone,
      client_card
    });

    return Response.json({
      message: "User created successfully",
      user_id: data.user.id
    });

  } catch (err) {

    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );

  }
}
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {

  const body = await req.json();
  const { email, password } = body;

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return Response.json(
      { error: "Supabase environment variables are missing." },
      { status: 500 }
    );
  }

  const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 401 });
  }

  return Response.json({
    message: "Login successful",
    session: data.session
  });
}

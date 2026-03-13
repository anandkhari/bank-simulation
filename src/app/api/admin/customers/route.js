import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("role", "client")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return Response.json(data);

}
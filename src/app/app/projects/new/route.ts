import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user!;
  const form = await req.formData();
  const title = String(form.get("title") || "").trim();

  const { data, error } = await supabase
    .from("projects")
    .insert({ owner_id: user.id, title })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.redirect(new URL(`/app/projects/${data.id}`, req.url));
}

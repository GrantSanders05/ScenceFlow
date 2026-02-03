import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request, { params }: { params: { projectId: string } }) {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user!;
  const form = await req.formData();
  const title = String(form.get("title") || "").trim();

  const { data, error } = await supabase
    .from("scripts")
    .insert({
      project_id: params.projectId,
      owner_id: user.id,
      title,
      content: "",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // create notebook row
  await supabase.from("script_notebooks").upsert({
    script_id: data.id,
    owner_id: user.id,
    notebook: "",
  });

  return NextResponse.redirect(new URL(`/app/scripts/${data.id}`, req.url));
}

import { supabaseServer } from "@/lib/supabase/server";
import ScriptEditor from "@/components/ScriptEditor";

export default async function ScriptPage({ params }: { params: { scriptId: string } }) {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user!;

  const { data: script } = await supabase
    .from("scripts")
    .select("*")
    .eq("id", params.scriptId)
    .eq("owner_id", user.id)
    .single();

  const { data: notebook } = await supabase
    .from("script_notebooks")
    .select("*")
    .eq("script_id", params.scriptId)
    .eq("owner_id", user.id)
    .single();

  return (
    <ScriptEditor
      scriptId={params.scriptId}
      initialTitle={script?.title ?? "Untitled"}
      initialContent={script?.content ?? ""}
      initialNotebook={notebook?.notebook ?? ""}
    />
  );
}

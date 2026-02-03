import { supabaseServer } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ProjectPage({ params }: { params: { projectId: string } }) {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user!;

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", params.projectId)
    .eq("owner_id", user.id)
    .single();

  const { data: scripts } = await supabase
    .from("scripts")
    .select("*")
    .eq("project_id", params.projectId)
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <main className="min-h-screen p-6">
      <header className="flex items-center justify-between">
        <div>
          <Link href="/app" className="text-sm text-zinc-400 hover:text-zinc-200">← Projects</Link>
          <h1 className="text-2xl font-semibold mt-2">{project?.title ?? "Project"}</h1>
        </div>

        <form action={`/app/projects/${params.projectId}/scripts/new`} method="post" className="flex gap-2">
          <input
            name="title"
            placeholder="New script title"
            className="rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm"
            required
          />
          <button className="rounded-xl bg-zinc-100 text-zinc-900 px-4 py-2 text-sm font-medium">
            Create
          </button>
        </form>
      </header>

      <div className="mt-6 grid gap-3">
        {scripts?.map((s) => (
          <Link
            key={s.id}
            href={`/app/scripts/${s.id}`}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 hover:bg-zinc-900/70"
          >
            <div className="font-medium">{s.title}</div>
            <div className="text-xs text-zinc-400 mt-1">
              Updated: {new Date(s.updated_at).toLocaleString()}
            </div>
          </Link>
        ))}
        {!scripts?.length && (
          <div className="text-zinc-400 text-sm mt-8">
            No scripts yet. Create one above.
          </div>
        )}
      </div>
    </main>
  );
}

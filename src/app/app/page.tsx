import { supabaseServer } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AppHome() {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user!;

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <main className="min-h-screen p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-zinc-400 text-sm">Your scripts, synced in the cloud.</p>
        </div>
        <form action="/app/projects/new" method="post" className="flex gap-2">
          <input
            name="title"
            placeholder="New project title"
            className="rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm"
            required
          />
          <button className="rounded-xl bg-zinc-100 text-zinc-900 px-4 py-2 text-sm font-medium">
            Create
          </button>
        </form>
      </header>

      <div className="mt-6 grid gap-3">
        {projects?.map((p) => (
          <Link
            key={p.id}
            href={`/app/projects/${p.id}`}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 hover:bg-zinc-900/70"
          >
            <div className="font-medium">{p.title}</div>
            <div className="text-xs text-zinc-400 mt-1">Updated: {new Date(p.updated_at).toLocaleString()}</div>
          </Link>
        ))}
        {!projects?.length && (
          <div className="text-zinc-400 text-sm mt-8">
            No projects yet. Create one above.
          </div>
        )}
      </div>
    </main>
  );
}

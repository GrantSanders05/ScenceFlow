"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function VersionsPanel({
  scriptId,
  onRestore,
}: {
  scriptId: string;
  onRestore: (snapshot: string) => void;
}) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [versions, setVersions] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("versions")
        .select("*")
        .eq("script_id", scriptId)
        .order("created_at", { ascending: false })
        .limit(20);
      setVersions(data ?? []);
    })();
  }, [supabase, scriptId]);

  return (
    <aside className="border-b border-zinc-800 p-4">
      <h2 className="font-semibold">Versions</h2>
      <p className="text-xs text-zinc-400 mt-1">Snapshots you can restore</p>

      <div className="mt-3 space-y-2">
        {versions.map((v) => (
          <button
            key={v.id}
            onClick={() => onRestore(v.snapshot_content)}
            className="w-full text-left rounded-xl border border-zinc-800 bg-zinc-900 p-3 hover:bg-zinc-800"
          >
            <div className="text-sm font-medium">{v.label ?? "Snapshot"}</div>
            <div className="text-xs text-zinc-400 mt-1">{new Date(v.created_at).toLocaleString()}</div>
          </button>
        ))}
        {!versions.length && <div className="text-sm text-zinc-400">No versions yet.</div>}
      </div>
    </aside>
  );
}

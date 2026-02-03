"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { parseFountain } from "@/lib/fountain/parse";

export default function ProofreadPanel({
  scriptId,
  title,
  content,
}: {
  scriptId: string;
  title: string;
  content: string;
}) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [comments, setComments] = useState<any[]>([]);
  const lines = useMemo(() => parseFountain(content), [content]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("comments")
        .select("*")
        .eq("script_id", scriptId)
        .order("created_at", { ascending: false });
      setComments(data ?? []);
    })();
  }, [supabase, scriptId]);

  const addComment = async () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const node = range.startContainer?.parentElement;
    if (!node) return;

    const lineIndexStr = node.getAttribute("data-line-index");
    if (lineIndexStr == null) return;

    const lineIndex = Number(lineIndexStr);

    // MVP: offsets are approximate. We anchor by selected substring length.
    const selectedText = sel.toString();
    if (!selectedText.trim()) return;

    const lineText = lines[lineIndex]?.raw ?? "";
    const start = Math.max(0, lineText.indexOf(selectedText));
    const end = start + selectedText.length;

    const comment = prompt("Comment:");
    if (!comment) return;

    const suggested = prompt("Suggested edit (optional):") || null;

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return;

    await supabase.from("comments").insert({
      script_id: scriptId,
      owner_id: user.id,
      line_index: lineIndex,
      start_offset: start,
      end_offset: end,
      comment,
      suggested_replacement: suggested,
    });

    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("script_id", scriptId)
      .order("created_at", { ascending: false });

    setComments(data ?? []);
    sel.removeAllRanges();
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-[900px]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Proofread</h2>
          <button
            onClick={addComment}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs hover:bg-zinc-800"
          >
            Add comment from highlight
          </button>
        </div>

        <div className="mt-4 grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-7 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 font-mono">
            {lines.map((l) => (
              <div key={l.lineIndex} data-line-index={l.lineIndex} className="whitespace-pre-wrap">
                {l.raw}
              </div>
            ))}
          </div>

          <div className="col-span-12 lg:col-span-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="font-semibold">Comments</div>
            <div className="mt-3 space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                  <div className="text-xs text-zinc-400">
                    Line {c.line_index} • {new Date(c.created_at).toLocaleString()}
                  </div>
                  <div className="mt-2 text-sm">{c.comment}</div>
                  {c.suggested_replacement && (
                    <div className="mt-2 text-xs text-zinc-300">
                      Suggestion: <span className="text-zinc-100">{c.suggested_replacement}</span>
                    </div>
                  )}
                </div>
              ))}
              {!comments.length && <div className="text-sm text-zinc-400">No comments yet.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

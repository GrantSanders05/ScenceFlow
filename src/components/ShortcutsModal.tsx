"use client";

import { useMemo, useState } from "react";
import { ACTION_LABELS, type EditorActionId } from "@/lib/editor/actions";
import type { ShortcutMap } from "@/lib/editor/shortcutDefaults";
import { DEFAULT_SHORTCUTS } from "@/lib/editor/shortcutDefaults";

function actionIds(): EditorActionId[] {
  return Object.keys(ACTION_LABELS) as EditorActionId[];
}

export default function ShortcutsModal({
  current,
  onClose,
  onSave,
}: {
  current: ShortcutMap;
  onClose: () => void;
  onSave: (m: ShortcutMap) => Promise<void>;
}) {
  const [draft, setDraft] = useState<ShortcutMap>({ ...current });
  const [listeningFor, setListeningFor] = useState<EditorActionId | null>(null);

  const conflicts = useMemo(() => {
    const used = new Map<string, EditorActionId[]>();
    for (const id of actionIds()) {
      const key = draft[id];
      if (!key) continue;
      used.set(key, [...(used.get(key) ?? []), id]);
    }
    return [...used.entries()].filter(([, arr]) => arr.length > 1);
  }, [draft]);

  const capture = (e: React.KeyboardEvent) => {
    if (!listeningFor) return;
    e.preventDefault();

    const parts: string[] = [];
    if (e.metaKey || e.ctrlKey) parts.push("Mod");
    if (e.shiftKey) parts.push("Shift");
    if (e.altKey) parts.push("Alt");

    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (["Meta", "Control", "Shift", "Alt"].includes(k)) return;

    parts.push(k);
    const combo = parts.join("-");

    setDraft((d) => ({ ...d, [listeningFor]: combo }));
    setListeningFor(null);
  };

  const resetDefaults = () => setDraft({ ...DEFAULT_SHORTCUTS });

  const save = async () => {
    await onSave(draft);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onKeyDown={capture}
      tabIndex={-1}
    >
      <div className="w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xl font-semibold">Keyboard Shortcuts</div>
            <div className="text-sm text-zinc-400 mt-1">
              Click a shortcut, then press a new key combo (e.g., Mod-Shift-e).
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs hover:bg-zinc-800">
            Close
          </button>
        </div>

        {conflicts.length > 0 && (
          <div className="mt-4 rounded-xl border border-amber-800 bg-amber-950/40 p-3 text-sm">
            <div className="font-medium text-amber-200">Conflicts detected</div>
            <ul className="mt-2 text-amber-100/90 text-xs space-y-1">
              {conflicts.map(([key, ids]) => (
                <li key={key}>
                  <span className="font-mono">{key}</span> used by {ids.join(", ")}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 max-h-[55vh] overflow-auto rounded-xl border border-zinc-800">
          {actionIds().map((id) => (
            <div key={id} className="flex items-center justify-between gap-3 border-b border-zinc-800 p-3">
              <div className="text-sm">{ACTION_LABELS[id]}</div>
              <button
                onClick={() => setListeningFor(id)}
                className={`min-w-[180px] rounded-xl border px-3 py-2 text-xs font-mono ${
                  listeningFor === id
                    ? "border-zinc-100 bg-zinc-100 text-zinc-900"
                    : "border-zinc-800 bg-zinc-900 hover:bg-zinc-800"
                }`}
              >
                {listeningFor === id ? "Press keys…" : (draft[id] || "Unbound")}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button onClick={resetDefaults} className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs hover:bg-zinc-800">
            Reset defaults
          </button>
          <button onClick={save} className="rounded-xl bg-zinc-100 px-4 py-2 text-xs text-zinc-900 font-medium hover:bg-white">
            Save shortcuts
          </button>
        </div>
      </div>
    </div>
  );
}

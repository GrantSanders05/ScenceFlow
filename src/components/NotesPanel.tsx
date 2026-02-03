"use client";

export default function NotesPanel({
  scriptId,
  notebook,
  setNotebook,
}: {
  scriptId: string;
  notebook: string;
  setNotebook: (v: string) => void;
}) {
  return (
    <aside className="border-b border-zinc-800 p-4">
      <h2 className="font-semibold">Notes</h2>
      <p className="text-xs text-zinc-400 mt-1">Script notebook (synced)</p>
      <textarea
        value={notebook}
        onChange={(e) => setNotebook(e.target.value)}
        className="mt-3 w-full min-h-[220px] rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm"
        placeholder="Ideas, character bios, beats, research..."
      />
      <div className="mt-2 text-xs text-zinc-500">Autosaves.</div>
    </aside>
  );
}

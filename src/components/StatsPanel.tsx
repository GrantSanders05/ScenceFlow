export default function StatsPanel({ stats }: { stats: any }) {
  return (
    <aside className="border-b border-zinc-800 p-4">
      <h2 className="font-semibold">Stats</h2>
      <div className="mt-3 text-sm text-zinc-300 space-y-1">
        <div>Estimated pages: <span className="text-zinc-100">{stats.estimatedPages}</span></div>
        <div>Words: <span className="text-zinc-100">{stats.words}</span></div>
        <div>Scenes: <span className="text-zinc-100">{stats.scenes}</span></div>
        <div>Dialogue lines: <span className="text-zinc-100">{stats.dialogueLines}</span></div>
        <div>Action lines: <span className="text-zinc-100">{stats.actionLines}</span></div>
      </div>
    </aside>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { parseFountain, computeStats } from "@/lib/fountain/parse";
import { exportPdfBlob } from "@/lib/pdf/exportPdf";
import { DEFAULT_SHORTCUTS } from "@/lib/editor/shortcutDefaults";
import type { ShortcutMap } from "@/lib/editor/shortcutDefaults";
import ShortcutsModal from "@/components/ShortcutsModal";
import ProofreadPanel from "@/components/ProofreadPanel";
import NotesPanel from "@/components/NotesPanel";
import VersionsPanel from "@/components/VersionsPanel";
import StatsPanel from "@/components/StatsPanel";
import EditorCM from "@/components/editor/EditorCM";

type Mode = "write" | "preview" | "proofread";
type PreviewMode = "flow" | "page";

export default function ScriptEditor({
  scriptId,
  initialTitle,
  initialContent,
  initialNotebook,
}: {
  scriptId: string;
  initialTitle: string;
  initialContent: string;
  initialNotebook: string;
}) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [mode, setMode] = useState<Mode>("write");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("flow");

  const [showNotes, setShowNotes] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const [notebook, setNotebook] = useState(initialNotebook);
  const [shortcuts, setShortcuts] = useState<ShortcutMap>(DEFAULT_SHORTCUTS);

  const saveTimer = useRef<number | null>(null);
  const notebookTimer = useRef<number | null>(null);

  // Load profile shortcuts
  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("shortcuts_json")
        .eq("id", user.id)
        .single();

      const merged = { ...DEFAULT_SHORTCUTS, ...(profile?.shortcuts_json ?? {}) } as ShortcutMap;
      setShortcuts(merged);
    })();
  }, [supabase]);

  // Autosave script (debounced)
  const scheduleSave = () => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      await supabase.from("scripts").update({ title, content }).eq("id", scriptId);
    }, 800);
  };

  // Autosave notebook
  const scheduleNotebookSave = () => {
    if (notebookTimer.current) window.clearTimeout(notebookTimer.current);
    notebookTimer.current = window.setTimeout(async () => {
      await supabase.from("script_notebooks").upsert({
        script_id: scriptId,
        owner_id: (await supabase.auth.getUser()).data.user?.id,
        notebook,
      });
    }, 900);
  };

  const stats = useMemo(() => computeStats(content), [content]);
  const parsed = useMemo(() => parseFountain(content), [content]);

  const exportFountain = () => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${title || "script"}.fountain`;
    a.click();
  };

  const exportPDF = async () => {
    const blob = await exportPdfBlob(title || "Untitled", content);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${title || "script"}.pdf`;
    a.click();
  };

  const createVersion = async (label?: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return;

    await supabase.from("versions").insert({
      script_id: scriptId,
      owner_id: user.id,
      label: label ?? null,
      snapshot_content: content,
    });
    setShowVersions(true);
  };

  const setAndSaveContent = (v: string) => {
    setContent(v);
    scheduleSave();
  };

  const setAndSaveTitle = (v: string) => {
    setTitle(v);
    scheduleSave();
  };

  const saveShortcuts = async (next: ShortcutMap) => {
    setShortcuts(next);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return;

    await supabase.from("profiles").update({ shortcuts_json: next }).eq("id", user.id);
  };

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="flex items-center gap-3 p-3">
          <input
            value={title}
            onChange={(e) => setAndSaveTitle(e.target.value)}
            className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm font-medium"
          />

          <div className="flex items-center gap-2">
            <button onClick={() => setMode("write")} className={tabClass(mode === "write")}>Write</button>
            <button onClick={() => setMode("preview")} className={tabClass(mode === "preview")}>Preview</button>
            <button onClick={() => setMode("proofread")} className={tabClass(mode === "proofread")}>Proofread</button>
          </div>

          {mode === "preview" && (
            <div className="flex items-center gap-2 ml-2">
              <button onClick={() => setPreviewMode("flow")} className={tabClass(previewMode === "flow")}>Flow</button>
              <button onClick={() => setPreviewMode("page")} className={tabClass(previewMode === "page")}>Page</button>
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            <button onClick={exportFountain} className={btnClass()}>Export .fountain</button>
            <button onClick={exportPDF} className={btnClass()}>Export PDF</button>
            <button onClick={() => setShowNotes((v) => !v)} className={btnClass()}>Notes</button>
            <button onClick={() => setShowStats((v) => !v)} className={btnClass()}>Stats</button>
            <button onClick={() => createVersion("Manual snapshot")} className={btnClass()}>Save Version</button>
            <button onClick={() => setShowVersions((v) => !v)} className={btnClass()}>Versions</button>
            <button onClick={() => setShowShortcuts(true)} className={btnClass()}>Shortcuts</button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-0">
        <div className="col-span-12 lg:col-span-8 border-r border-zinc-800 min-h-[calc(100vh-56px)]">
          {mode === "write" && (
            <EditorCM
              value={content}
              onChange={setAndSaveContent}
              shortcuts={shortcuts}
              onOpenShortcuts={() => setShowShortcuts(true)}
              onTogglePreview={() => setMode("preview")}
              onToggleProofread={() => setMode("proofread")}
              onToggleNotes={() => setShowNotes((v) => !v)}
              onToggleStats={() => setShowStats((v) => !v)}
              onToggleVersions={() => setShowVersions((v) => !v)}
              onExportPdf={exportPDF}
              onExportFountain={exportFountain}
            />
          )}

          {mode === "preview" && (
            <Preview content={content} previewMode={previewMode} />
          )}

          {mode === "proofread" && (
            <ProofreadPanel scriptId={scriptId} title={title} content={content} />
          )}
        </div>

        <div className="col-span-12 lg:col-span-4">
          {showNotes && (
            <NotesPanel
              scriptId={scriptId}
              notebook={notebook}
              setNotebook={(v) => {
                setNotebook(v);
                scheduleNotebookSave();
              }}
            />
          )}

          {showStats && <StatsPanel stats={stats} />}

          {showVersions && (
            <VersionsPanel
              scriptId={scriptId}
              onRestore={(snapshot) => {
                setAndSaveContent(snapshot);
              }}
            />
          )}
        </div>
      </div>

      {showShortcuts && (
        <ShortcutsModal
          current={shortcuts}
          onClose={() => setShowShortcuts(false)}
          onSave={saveShortcuts}
        />
      )}
    </main>
  );
}

function btnClass() {
  return "rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs hover:bg-zinc-800";
}
function tabClass(active: boolean) {
  return active
    ? "rounded-xl bg-zinc-100 px-3 py-2 text-xs text-zinc-900 font-medium"
    : "rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs hover:bg-zinc-800";
}

function Preview({ content, previewMode }: { content: string; previewMode: "flow" | "page" }) {
  const lines = parseFountain(content);

  if (previewMode === "page") {
    // MVP "page" view: visually paged container; exact pagination for web is complex,
    // but PDF export uses the same parse rules and is the true output.
    return (
      <div className="p-6">
        <div className="mx-auto max-w-[850px] rounded-2xl border border-zinc-800 bg-white text-black p-10 font-mono">
          {lines.map((l, idx) => <PreviewLine key={idx} line={l.raw} type={l.type} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-[850px] rounded-2xl border border-zinc-800 bg-zinc-900 p-6 font-mono">
        {lines.map((l, idx) => <PreviewLine key={idx} line={l.raw} type={l.type} />)}
      </div>
    </div>
  );
}

function PreviewLine({ line, type }: { line: string; type: string }) {
  const raw = line.trim();

  if (type === "empty") return <div className="h-4" />;
  if (type === "note") return <div className="text-zinc-500 text-sm">{raw}</div>;
  if (type === "page_break") return <div className="my-6 border-t border-zinc-700" />;

  const base = "whitespace-pre-wrap";
  if (type === "scene") return <div className={`${base} mt-3 uppercase`}>{raw}</div>;
  if (type === "action") return <div className={`${base} mt-2`}>{raw}</div>;
  if (type === "character") return <div className={`${base} mt-3 ml-[240px] uppercase`}>{raw}</div>;
  if (type === "dialogue") return <div className={`${base} ml-[180px] mr-[80px]`}>{raw}</div>;
  if (type === "parenthetical") return <div className={`${base} ml-[200px] mr-[120px]`}>{raw}</div>;
  if (type === "transition") return <div className={`${base} mt-3 text-right uppercase`}>{raw}</div>;
  if (type === "centered") return <div className={`${base} mt-3 text-center`}>{raw.replace(/^>\s?/, "")}</div>;
  return <div className={base}>{raw}</div>;
}

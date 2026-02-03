"use client";

import { useEffect, useMemo, useRef } from "react";
import { EditorView, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { searchKeymap } from "@codemirror/search";
import { markdown } from "@codemirror/lang-markdown";
import type { ShortcutMap } from "@/lib/editor/shortcutDefaults";

type Props = {
  value: string;
  onChange: (v: string) => void;
  shortcuts: ShortcutMap;

  onOpenShortcuts: () => void;
  onTogglePreview: () => void;
  onToggleProofread: () => void;
  onToggleNotes: () => void;
  onToggleStats: () => void;
  onToggleVersions: () => void;
  onExportPdf: () => void;
  onExportFountain: () => void;
};

export default function EditorCM(props: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);

  const actionKeymap = useMemo(() => {
    const s = props.shortcuts;

    // helper: set current line by transforming text (Fountain-ish)
    const setLine = (transform: (line: string) => string) => {
      return (view: EditorView) => {
        const { state } = view;
        const sel = state.selection.main;
        const line = state.doc.lineAt(sel.head);

        const from = line.from;
        const to = line.to;
        const nextText = transform(line.text);

        view.dispatch({
          changes: { from, to, insert: nextText },
        });
        return true;
      };
    };

    const insertLineBelow = (text: string) => {
      return (view: EditorView) => {
        const { state } = view;
        const sel = state.selection.main;
        const line = state.doc.lineAt(sel.head);
        const insertPos = line.to;
        const ins = "\n" + text;
        view.dispatch({ changes: { from: insertPos, to: insertPos, insert: ins } });
        return true;
      };
    };

    const map = [
      { key: s["line.scene"], run: setLine((l) => (l.trim() ? l : "INT. ")) },
      { key: s["line.action"], run: setLine((l) => l.replace(/^>\s?/, "")) },
      { key: s["line.character"], run: setLine((l) => l.toUpperCase()) },
      { key: s["line.dialogue"], run: setLine((l) => l) },
      { key: s["line.parenthetical"], run: setLine((l) => (l.trim().startsWith("(") ? l : `(${l.trim()})`)) },
      { key: s["line.transition"], run: setLine((l) => (l.toUpperCase().endsWith("TO:") ? l.toUpperCase() : "CUT TO:")) },
      { key: s["line.centered"], run: setLine((l) => (l.trim().startsWith(">") ? l : `> ${l.trim()}`)) },
      { key: s["line.note"], run: setLine((l) => (l.trim().startsWith("[[") ? l : `[[ ${l.trim()} ]]`)) },
      { key: s["insert.pagebreak"], run: insertLineBelow("===") },

      { key: s["export.pdf"], run: () => { props.onExportPdf(); return true; } },
      { key: s["export.fountain"], run: () => { props.onExportFountain(); return true; } },
      { key: s["toggle.preview"], run: () => { props.onTogglePreview(); return true; } },
      { key: s["toggle.proofread"], run: () => { props.onToggleProofread(); return true; } },
      { key: s["toggle.notes"], run: () => { props.onToggleNotes(); return true; } },
      { key: s["toggle.stats"], run: () => { props.onToggleStats(); return true; } },
      { key: s["toggle.versions"], run: () => { props.onToggleVersions(); return true; } },
      { key: s["open.settings"], run: () => { props.onOpenShortcuts(); return true; } },
    ].filter(Boolean);

    return keymap.of(
      map.map((m) => ({
        key: m.key.replace("Mod", "Ctrl").replace("Mod", "Cmd"),
        run: m.run,
      }))
    );
  }, [props]);

  useEffect(() => {
    if (!hostRef.current) return;

    const startState = EditorState.create({
      doc: props.value,
      extensions: [
        history(),
        markdown(),
        EditorView.lineWrapping,
        EditorView.updateListener.of((v) => {
          if (v.docChanged) props.onChange(v.state.doc.toString());
        }),
        keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
        actionKeymap,
        EditorView.theme({
          "&": { height: "calc(100vh - 56px)" },
          ".cm-scroller": { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" },
          ".cm-content": { padding: "16px" },
          ".cm-line": { padding: "0 2px" },
        }),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: hostRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If value changes externally (restore version), update editor doc
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === props.value) return;

    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: props.value },
    });
  }, [props.value]);

  return <div ref={hostRef} className="bg-zinc-950" />;
}

import type { EditorActionId } from "./actions";

export type ShortcutMap = Record<EditorActionId, string>;

export const DEFAULT_SHORTCUTS: ShortcutMap = {
  "line.scene": "Mod-1",
  "line.action": "Mod-2",
  "line.character": "Mod-3",
  "line.dialogue": "Mod-4",
  "line.parenthetical": "Mod-5",
  "line.transition": "Mod-6",
  "line.centered": "Mod-7",
  "line.note": "Mod-8",
  "insert.pagebreak": "Mod-9",

  "export.pdf": "Mod-Shift-e",
  "export.fountain": "Mod-e",
  "toggle.preview": "Mod-p",
  "toggle.proofread": "Mod-Shift-f",
  "toggle.notes": "Mod-n",
  "toggle.stats": "Mod-Shift-s",
  "toggle.versions": "Mod-Shift-v",
  "open.commandPalette": "Mod-k",
  "open.settings": "Mod-,",
};

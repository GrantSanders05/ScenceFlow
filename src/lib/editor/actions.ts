export type EditorActionId =
  | "line.scene"
  | "line.action"
  | "line.character"
  | "line.dialogue"
  | "line.parenthetical"
  | "line.transition"
  | "line.centered"
  | "line.note"
  | "insert.pagebreak"
  | "export.pdf"
  | "export.fountain"
  | "toggle.preview"
  | "toggle.proofread"
  | "toggle.notes"
  | "toggle.stats"
  | "toggle.versions"
  | "open.commandPalette"
  | "open.settings";

export const ACTION_LABELS: Record<EditorActionId, string> = {
  "line.scene": "Set line: Scene Heading",
  "line.action": "Set line: Action",
  "line.character": "Set line: Character",
  "line.dialogue": "Set line: Dialogue",
  "line.parenthetical": "Set line: Parenthetical",
  "line.transition": "Set line: Transition",
  "line.centered": "Set line: Centered",
  "line.note": "Set line: Note",
  "insert.pagebreak": "Insert Page Break",
  "export.pdf": "Export PDF",
  "export.fountain": "Export .fountain",
  "toggle.preview": "Toggle Preview",
  "toggle.proofread": "Toggle Proofread",
  "toggle.notes": "Toggle Notes",
  "toggle.stats": "Toggle Stats",
  "toggle.versions": "Toggle Versions",
  "open.commandPalette": "Command Palette",
  "open.settings": "Open Settings",
};

// Convert "Mod-Shift-e" to a CodeMirror key string.
export function normalizeKey(k: string) {
  return k
    .replace(/^Cmd/i, "Mod")
    .replace(/^Ctrl/i, "Mod")
    .replace(/\s+/g, "")
    .replace(/Command/i, "Mod");
}

export type BlockType =
  | "scene"
  | "action"
  | "character"
  | "dialogue"
  | "parenthetical"
  | "transition"
  | "centered"
  | "page_break"
  | "note"
  | "empty";

export type ParsedLine = {
  raw: string;
  type: BlockType;
  lineIndex: number;
};

const SCENE_RE = /^(INT\.|EXT\.|INT\.\/EXT\.|EST\.)/i;
const NOTE_RE = /^\[\[(.*)\]\]$/;
const PAGEBREAK_RE = /^(===|---)$/;
const PAREN_RE = /^\(.*\)$/;

function isMostlyCaps(s: string) {
  const letters = s.replace(/[^A-Za-z]/g, "");
  if (!letters) return false;
  const caps = letters.replace(/[^A-Z]/g, "").length;
  return caps / letters.length > 0.85;
}

export function parseFountain(content: string): ParsedLine[] {
  const lines = content.split("\n");
  const out: ParsedLine[] = [];

  let pendingDialogue = false;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i] ?? "";
    const trimmed = raw.trim();

    if (trimmed.length === 0) {
      out.push({ raw, type: "empty", lineIndex: i });
      pendingDialogue = false;
      continue;
    }

    if (PAGEBREAK_RE.test(trimmed)) {
      out.push({ raw, type: "page_break", lineIndex: i });
      pendingDialogue = false;
      continue;
    }

    const noteMatch = trimmed.match(NOTE_RE);
    if (noteMatch) {
      out.push({ raw, type: "note", lineIndex: i });
      continue;
    }

    if (trimmed.startsWith(">")) {
      out.push({ raw, type: "centered", lineIndex: i });
      pendingDialogue = false;
      continue;
    }

    if (SCENE_RE.test(trimmed)) {
      out.push({ raw, type: "scene", lineIndex: i });
      pendingDialogue = false;
      continue;
    }

    if (/TO:\s*$/i.test(trimmed) && isMostlyCaps(trimmed)) {
      out.push({ raw, type: "transition", lineIndex: i });
      pendingDialogue = false;
      continue;
    }

    if (PAREN_RE.test(trimmed)) {
      out.push({ raw, type: "parenthetical", lineIndex: i });
      pendingDialogue = true;
      continue;
    }

    // Character line heuristic
    if (trimmed.length <= 35 && isMostlyCaps(trimmed) && !trimmed.endsWith(".")) {
      out.push({ raw, type: "character", lineIndex: i });
      pendingDialogue = true;
      continue;
    }

    if (pendingDialogue) {
      out.push({ raw, type: "dialogue", lineIndex: i });
      continue;
    }

    out.push({ raw, type: "action", lineIndex: i });
    pendingDialogue = false;
  }

  return out;
}

export function computeStats(content: string) {
  const lines = parseFountain(content);
  const words = content.trim().length ? content.trim().split(/\s+/).length : 0;

  const sceneCount = lines.filter((l) => l.type === "scene").length;
  const dialogueLines = lines.filter((l) => l.type === "dialogue").length;
  const actionLines = lines.filter((l) => l.type === "action").length;

  // Page estimate: rough, but consistent for MVP
  const nonEmpty = lines.filter((l) => l.type !== "empty" && l.type !== "note").length;
  const estimatedPages = Math.max(1, Math.ceil(nonEmpty / 55));

  return {
    words,
    scenes: sceneCount,
    dialogueLines,
    actionLines,
    estimatedPages,
  };
}

import { parseList } from "./parseList";

export interface HistoryEntry {
  id: string;
  name: string;
  text: string;
  savedAt: string;
}

// ponytail: the "database" is one JSON array in localStorage, no backend needed
const KEY = "tree-visualizer:history";
const EMPTY: HistoryEntry[] = [];

function readHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return EMPTY;
  }
}

// one-off lookup (e.g. resolving a "load this entry" id) — always fresh
export const getHistory = readHistory;

// cached snapshot + listeners so the history page can read localStorage via
// useSyncExternalStore instead of setState-in-effect (avoids a hydration mismatch,
// since localStorage doesn't exist during the server render)
let cache = readHistory();
const listeners = new Set<() => void>();

export function subscribeHistory(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function getHistorySnapshot() {
  return cache;
}

export function getHistoryServerSnapshot() {
  return EMPTY;
}

export function saveToHistory(text: string): HistoryEntry {
  const { tree } = parseList(text);
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    name: tree?.name || "Untitled",
    text,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(KEY, JSON.stringify([entry, ...readHistory()]));
  cache = readHistory();
  listeners.forEach((onChange) => onChange());
  return entry;
}

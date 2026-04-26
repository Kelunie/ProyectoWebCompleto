import { GamePhase } from "../types/game";

export function normalizePhase(phase: string): GamePhase {
  const normalized = phase
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, "");
  return normalized as GamePhase;
}
import type { GamePhase } from "../types/game";

export function normalizePhase(phase: string): GamePhase {
  const normalized = phase
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, "");

  const validPhases: GamePhase[] = [
    "lobby",
    "secret_actions",
    "discussion",
    "voting",
    "resolution",
    "ended",
  ];

  return validPhases.includes(normalized as GamePhase)
    ? (normalized as GamePhase)
    : "lobby";
}
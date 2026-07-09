import { SAMPLE_PUZZLE } from "../data/samplePuzzle.js";

/**
 * Picks the puzzle assigned to a given date string — each authored puzzle's
 * `id` IS the date it's meant to run on (see docs/PUZZLES.md), so this is an
 * exact lookup, not a rotation across the list. Falls back to SAMPLE_PUZZLE
 * for any date with no authored puzzle, so the game is always playable.
 */
export function getDailyPuzzle(dateString, puzzles) {
  const match = (puzzles ?? []).find((puzzle) => puzzle.id === dateString);
  return match ?? SAMPLE_PUZZLE;
}

import { SAMPLE_PUZZLE } from "../data/samplePuzzle.js";

/**
 * Deterministically picks a puzzle for a given date string from a list — the
 * same date always maps to the same puzzle, with no server or randomness
 * involved. Falls back to SAMPLE_PUZZLE if the list is empty.
 */
export function getDailyPuzzle(dateString, puzzles) {
  if (!puzzles || puzzles.length === 0) {
    return SAMPLE_PUZZLE;
  }

  const index = hashString(dateString) % puzzles.length;
  return puzzles[index];
}

function hashString(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
}

import { elapsedMs, moveCount } from "../game/puzzle.js";
import { formatElapsed } from "./format.js";

const SYMBOLS = { onPath: "\u{1F7E9}", decoy: "\u{1F7E8}", failed: "⬛" };

/**
 * One spoiler-free symbol per move — never the move's own text/error, just
 * whether it advanced the solution, was an off-path decoy, or failed to
 * apply. Pure function of a single history entry.
 */
export function moveSymbol(move) {
  if (!move.ok) {
    return SYMBOLS.failed;
  }
  return move.onPath ? SYMBOLS.onPath : SYMBOLS.decoy;
}

/**
 * The Wordle-style result grid: one symbol per move, in order. Reproducible
 * from `history` alone — no plaintext/obfuscated text ever enters it.
 */
export function buildShareGrid(history) {
  return history.map(moveSymbol).join("");
}

/**
 * The full shareable result text for a completed (or in-progress) puzzle.
 * `now` is the caller's current timestamp, used only to compute elapsed time
 * for an unsolved puzzle — a solved puzzle's time is frozen in `state`.
 */
export function buildShareText(state, now) {
  const grid = buildShareGrid(state.history);
  const time = formatElapsed(elapsedMs(state, now));
  const count = moveCount(state);
  return `peel ${state.puzzle.id}\n${grid}\n${count} move${count === 1 ? "" : "s"} · ${time}`;
}

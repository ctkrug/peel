import { describe, expect, it } from "vitest";
import { createPuzzleState, moveCount } from "../puzzle.js";
import { attemptMove, undoLastMove } from "../validator.js";
import { SAMPLE_PUZZLE } from "../../data/samplePuzzle.js";

describe("sample puzzle", () => {
  it("solves with its own solution chain", () => {
    let state = createPuzzleState(SAMPLE_PUZZLE);

    for (const operationId of SAMPLE_PUZZLE.solutionChain) {
      state = attemptMove(state, operationId, 1000);
    }

    expect(state.complete).toBe(true);
    expect(state.currentText).toBe(SAMPLE_PUZZLE.plaintext);
    expect(moveCount(state)).toBe(SAMPLE_PUZZLE.solutionChain.length);
  });

  it("records a wrong-but-applicable move as a step, not a win", () => {
    let state = createPuzzleState(SAMPLE_PUZZLE);
    state = attemptMove(state, "rot13", 1000);

    expect(state.complete).toBe(false);
    expect(state.history).toHaveLength(1);
    expect(state.history[0].ok).toBe(true);
    expect(state.currentText).not.toBe(SAMPLE_PUZZLE.plaintext);
  });

  it("records a move that fails to apply without changing currentText", () => {
    let state = createPuzzleState(SAMPLE_PUZZLE);
    state = attemptMove(state, "hex-decode", 1000);
    const afterHexDecode = state.currentText;

    // The base64 result is not valid hex, so decoding it again should fail.
    state = attemptMove(state, "hex-decode", 1001);

    expect(state.history.at(-1).ok).toBe(false);
    expect(state.currentText).toBe(afterHexDecode);
  });

  it("undo restores the previous successful text", () => {
    let state = createPuzzleState(SAMPLE_PUZZLE);
    state = attemptMove(state, "hex-decode", 1000);
    const afterFirstMove = state.currentText;
    state = attemptMove(state, "base64-decode", 1001);

    state = undoLastMove(state);

    expect(state.currentText).toBe(afterFirstMove);
    expect(moveCount(state)).toBe(1);
  });

  it("ignores further moves once complete", () => {
    let state = createPuzzleState(SAMPLE_PUZZLE);
    for (const operationId of SAMPLE_PUZZLE.solutionChain) {
      state = attemptMove(state, operationId, 1000);
    }

    const solvedState = attemptMove(state, "rot13", 2000);

    expect(solvedState).toBe(state);
  });
});

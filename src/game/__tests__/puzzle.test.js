import { describe, expect, it } from "vitest";
import { createPuzzleState, elapsedMs, moveCount } from "../puzzle.js";
import { attemptMove } from "../validator.js";
import { SAMPLE_PUZZLE } from "../../data/samplePuzzle.js";

describe("elapsedMs", () => {
  it("is zero before the first move", () => {
    const state = createPuzzleState(SAMPLE_PUZZLE);
    expect(elapsedMs(state, 5000)).toBe(0);
  });

  it("ticks against now while unsolved", () => {
    let state = createPuzzleState(SAMPLE_PUZZLE);
    state = attemptMove(state, "hex-decode", 1000);

    expect(elapsedMs(state, 1000)).toBe(0);
    expect(elapsedMs(state, 4500)).toBe(3500);
  });

  it("freezes at the exact solve time once complete", () => {
    let state = createPuzzleState(SAMPLE_PUZZLE);
    const [first, ...rest] = SAMPLE_PUZZLE.solutionChain;
    const last = rest.pop();
    state = attemptMove(state, first, 1000);
    for (const operationId of rest) {
      state = attemptMove(state, operationId, 1000);
    }
    state = attemptMove(state, last, 6000);

    expect(state.complete).toBe(true);
    expect(elapsedMs(state, 6000)).toBe(5000);
    expect(elapsedMs(state, 60000)).toBe(5000);
  });
});

describe("moveCount", () => {
  it("is zero for a fresh puzzle", () => {
    expect(moveCount(createPuzzleState(SAMPLE_PUZZLE))).toBe(0);
  });
});

import { describe, expect, it } from "vitest";
import { buildShareGrid, buildShareText, moveSymbol } from "../shareResult.js";
import { createPuzzleState } from "../../game/puzzle.js";
import { attemptMove } from "../../game/validator.js";
import { SAMPLE_PUZZLE } from "../../data/samplePuzzle.js";

describe("moveSymbol", () => {
  it("marks a successful on-path move", () => {
    expect(moveSymbol({ ok: true, onPath: true })).toBe("\u{1F7E9}");
  });

  it("marks a successful off-path decoy differently", () => {
    expect(moveSymbol({ ok: true, onPath: false })).toBe("\u{1F7E8}");
  });

  it("marks a failed move differently again", () => {
    expect(moveSymbol({ ok: false, onPath: false })).toBe("⬛");
  });
});

describe("buildShareGrid", () => {
  it("is empty for no moves", () => {
    expect(buildShareGrid([])).toBe("");
  });

  it("is reproducible from history alone", () => {
    const history = [
      { ok: true, onPath: true },
      { ok: true, onPath: false },
      { ok: false, onPath: false },
    ];
    expect(buildShareGrid(history)).toBe(buildShareGrid(history));
    expect(buildShareGrid(history)).toBe("\u{1F7E9}\u{1F7E8}⬛");
  });

  it("never contains the move's own text or error message", () => {
    const history = [{ ok: true, onPath: true, text: SAMPLE_PUZZLE.plaintext }];
    expect(buildShareGrid(history)).not.toContain(SAMPLE_PUZZLE.plaintext);
  });
});

describe("buildShareText", () => {
  it("contains no plaintext or obfuscated text", () => {
    let state = createPuzzleState(SAMPLE_PUZZLE);
    for (const operationId of SAMPLE_PUZZLE.solutionChain) {
      state = attemptMove(state, operationId, 1000);
    }
    const text = buildShareText(state, 5000);

    expect(text).not.toContain(SAMPLE_PUZZLE.plaintext);
    expect(text).not.toContain(SAMPLE_PUZZLE.obfuscated);
    expect(text).toContain(SAMPLE_PUZZLE.id);
    expect(text).toContain("3 moves");
  });

  it("pluralizes a single move correctly", () => {
    let state = createPuzzleState(SAMPLE_PUZZLE);
    state = attemptMove(state, "reverse", 1000);
    const text = buildShareText(state, 1000);
    expect(text).toContain("1 move ·");
  });
});

import { describe, expect, it } from "vitest";
import { PUZZLES } from "../puzzles.js";
import { chainReachesTarget } from "../../engine/chain.js";
import { listOperations } from "../../engine/registry.js";

describe("PUZZLES", () => {
  it.each(PUZZLES)("$id: solutionChain resolves obfuscated to plaintext", (puzzle) => {
    expect(chainReachesTarget(puzzle.obfuscated, puzzle.solutionChain, puzzle.plaintext)).toBe(
      true,
    );
  });

  it("has at least three puzzles", () => {
    expect(PUZZLES.length).toBeGreaterThanOrEqual(3);
  });

  it("every puzzle has a distinct, non-empty plaintext", () => {
    const plaintexts = PUZZLES.map((puzzle) => puzzle.plaintext);
    expect(new Set(plaintexts).size).toBe(plaintexts.length);
    plaintexts.forEach((text) => expect(text.length).toBeGreaterThan(0));
  });

  it("at least one puzzle uses the eval-unwrap operation", () => {
    expect(PUZZLES.some((puzzle) => puzzle.solutionChain.includes("eval-unwrap"))).toBe(true);
  });

  it("every solutionChain step is a registered operation id", () => {
    const validIds = new Set(listOperations());
    for (const puzzle of PUZZLES) {
      for (const operationId of puzzle.solutionChain) {
        expect(validIds.has(operationId)).toBe(true);
      }
    }
  });
});

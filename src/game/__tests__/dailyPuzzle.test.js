import { describe, expect, it } from "vitest";
import { getDailyPuzzle } from "../dailyPuzzle.js";
import { PUZZLES } from "../../data/puzzles.js";
import { SAMPLE_PUZZLE } from "../../data/samplePuzzle.js";

describe("getDailyPuzzle", () => {
  it("returns the puzzle whose id matches the date, every time it's called", () => {
    const first = getDailyPuzzle("2026-07-09", PUZZLES);
    const second = getDailyPuzzle("2026-07-09", PUZZLES);
    expect(first).toBe(second);
    expect(first.id).toBe("2026-07-09");
  });

  it("resolves each authored puzzle by its own date", () => {
    for (const puzzle of PUZZLES) {
      expect(getDailyPuzzle(puzzle.id, PUZZLES)).toBe(puzzle);
    }
  });

  it("falls back to SAMPLE_PUZZLE for a date with no authored puzzle", () => {
    expect(getDailyPuzzle("2099-01-01", PUZZLES)).toBe(SAMPLE_PUZZLE);
  });

  it("falls back to SAMPLE_PUZZLE when the list is empty", () => {
    expect(getDailyPuzzle("2026-07-09", [])).toBe(SAMPLE_PUZZLE);
  });

  it("falls back to SAMPLE_PUZZLE when no list is given", () => {
    expect(getDailyPuzzle("2026-07-09", undefined)).toBe(SAMPLE_PUZZLE);
  });
});

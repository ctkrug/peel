import { describe, expect, it } from "vitest";
import { getDailyPuzzle } from "../dailyPuzzle.js";
import { PUZZLES } from "../../data/puzzles.js";
import { SAMPLE_PUZZLE } from "../../data/samplePuzzle.js";

describe("getDailyPuzzle", () => {
  it("returns the same puzzle for the same date on every call", () => {
    const first = getDailyPuzzle("2026-08-01", PUZZLES);
    const second = getDailyPuzzle("2026-08-01", PUZZLES);
    expect(first).toBe(second);
  });

  it("only ever returns a puzzle from the given list", () => {
    const puzzle = getDailyPuzzle("2026-08-02", PUZZLES);
    expect(PUZZLES).toContain(puzzle);
  });

  it("varies across different dates (not stuck on one puzzle)", () => {
    const picks = new Set(
      ["2026-08-01", "2026-08-02", "2026-08-03", "2026-08-04", "2026-08-05"].map((date) =>
        getDailyPuzzle(date, PUZZLES).id,
      ),
    );
    expect(picks.size).toBeGreaterThan(1);
  });

  it("falls back to SAMPLE_PUZZLE when the list is empty", () => {
    expect(getDailyPuzzle("2026-08-01", [])).toBe(SAMPLE_PUZZLE);
  });

  it("falls back to SAMPLE_PUZZLE when no list is given", () => {
    expect(getDailyPuzzle("2026-08-01", undefined)).toBe(SAMPLE_PUZZLE);
  });
});

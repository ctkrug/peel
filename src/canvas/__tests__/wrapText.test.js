import { describe, expect, it } from "vitest";
import { computeWrappedLines } from "../wrapText.js";

// A simple monospace stand-in: each char is 1 unit wide.
const monospaceMeasure = (text) => text.length;

describe("computeWrappedLines", () => {
  it("keeps short text on a single line", () => {
    expect(computeWrappedLines("hello world", 20, monospaceMeasure)).toEqual(["hello world"]);
  });

  it("wraps on spaces when a line would overflow", () => {
    const lines = computeWrappedLines("one two three four", 9, monospaceMeasure);
    expect(lines).toEqual(["one two", "three", "four"]);
  });

  it("breaks a single unbroken token that alone exceeds maxWidth", () => {
    const hex = "abcdefghijklmnopqrstuvwxyz";
    const lines = computeWrappedLines(hex, 10, monospaceMeasure);
    expect(lines.join("")).toBe(hex);
    lines.forEach((line) => expect(line.length).toBeLessThanOrEqual(10));
  });

  it("handles a long token mixed with normal words", () => {
    const lines = computeWrappedLines("start abcdefghijklmnop end", 8, monospaceMeasure);
    expect(lines).toEqual(["start", "abcdefgh", "ijklmnop", "end"]);
  });

  it("returns a single empty line for empty input", () => {
    expect(computeWrappedLines("", 20, monospaceMeasure)).toEqual([""]);
  });

  it("never produces a line wider than maxWidth when breaking mid-token", () => {
    const lines = computeWrappedLines("x".repeat(53), 6, monospaceMeasure);
    lines.forEach((line) => expect(line.length).toBeLessThanOrEqual(6));
  });
});

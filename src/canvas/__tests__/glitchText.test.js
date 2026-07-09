import { describe, expect, it } from "vitest";
import { randomGlyphs } from "../glitchText.js";

describe("randomGlyphs", () => {
  it("returns an empty string for zero length", () => {
    expect(randomGlyphs(0)).toBe("");
  });

  it("returns the requested length", () => {
    expect(randomGlyphs(12)).toHaveLength(12);
  });

  it("is deterministic given a seeded random source", () => {
    const alwaysZero = () => 0;
    expect(randomGlyphs(5, alwaysZero)).toBe("!!!!!");
  });

  it("only uses glyph characters, never letters or digits beyond 0/1", () => {
    const result = randomGlyphs(200, Math.random);
    expect(result).toMatch(/^[!@#$%^&*<>?/\\|{}[\]01]+$/);
  });
});

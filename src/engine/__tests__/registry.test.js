import { describe, expect, it } from "vitest";
import { applyOperation, listOperations, OPERATIONS } from "../registry.js";

describe("registry", () => {
  it("lists every operation id declared in OPERATIONS", () => {
    expect(listOperations().sort()).toEqual(Object.keys(OPERATIONS).sort());
  });

  it("every operation has a non-empty label", () => {
    for (const id of listOperations()) {
      expect(OPERATIONS[id].label.length).toBeGreaterThan(0);
    }
  });

  it("dispatches to the operation's apply function", () => {
    expect(applyOperation("rot13", "uryyb")).toBe("hello");
  });

  it("throws on an unknown operation id", () => {
    expect(() => applyOperation("not-a-real-op", "text")).toThrow();
  });
});

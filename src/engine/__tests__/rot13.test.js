import { describe, expect, it } from "vitest";
import { rot13 } from "../transforms/rot13.js";

describe("rot13", () => {
  it("encodes a known vector", () => {
    expect(rot13("hello")).toBe("uryyb");
  });

  it("is its own inverse", () => {
    expect(rot13(rot13("Peel the Onion"))).toBe("Peel the Onion");
  });

  it("leaves non-letters untouched", () => {
    expect(rot13("echo 42!")).toBe("rpub 42!");
  });

  it("leaves unicode characters outside a-z/A-Z untouched", () => {
    expect(rot13("café 🔥")).toBe("pnsé 🔥");
  });
});

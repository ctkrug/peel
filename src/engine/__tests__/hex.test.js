import { describe, expect, it } from "vitest";
import { hexDecode, hexEncode } from "../transforms/hex.js";

describe("hex", () => {
  it("round-trips ascii text", () => {
    expect(hexDecode(hexEncode("peel it"))).toBe("peel it");
  });

  it("encodes a known vector", () => {
    expect(hexEncode("hi")).toBe("6869");
  });

  it("rejects odd-length input", () => {
    expect(() => hexDecode("abc")).toThrow();
  });

  it("rejects non-hex characters", () => {
    expect(() => hexDecode("zz")).toThrow();
  });
});

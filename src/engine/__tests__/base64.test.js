import { describe, expect, it } from "vitest";
import { base64Decode, base64Encode } from "../transforms/base64.js";

describe("base64", () => {
  it("round-trips ascii text", () => {
    expect(base64Decode(base64Encode("hello, peel"))).toBe("hello, peel");
  });

  it("encodes a known vector", () => {
    expect(base64Encode("man")).toBe("bWFu");
  });

  it("decodes a known vector with padding", () => {
    expect(base64Decode("aGk=")).toBe("hi");
  });

  it("rejects invalid characters", () => {
    expect(() => base64Decode("not base64!!")).toThrow();
  });

  it("round-trips a single leftover byte with double padding", () => {
    // 4 bytes leaves one byte in the final group, exercising the "==" path.
    expect(base64Encode("peel")).toBe("cGVlbA==");
    expect(base64Decode("cGVlbA==")).toBe("peel");
  });

  it("round-trips multi-byte unicode text", () => {
    expect(base64Decode(base64Encode("échó 🔥"))).toBe("échó 🔥");
  });
});

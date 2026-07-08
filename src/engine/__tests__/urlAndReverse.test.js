import { describe, expect, it } from "vitest";
import { urlDecode, urlEncode } from "../transforms/urlEncoding.js";
import { reverseString } from "../transforms/reverse.js";

describe("url-encoding", () => {
  it("round-trips text with reserved characters", () => {
    const text = "curl http://x?a=1&b=2";
    expect(urlDecode(urlEncode(text))).toBe(text);
  });
});

describe("reverse", () => {
  it("reverses ascii text", () => {
    expect(reverseString("peel")).toBe("leep");
  });

  it("is its own inverse", () => {
    expect(reverseString(reverseString("obfuscated"))).toBe("obfuscated");
  });
});

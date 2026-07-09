import { describe, expect, it } from "vitest";
import { urlDecode, urlEncode } from "../transforms/urlEncoding.js";
import { reverseString } from "../transforms/reverse.js";

describe("url-encoding", () => {
  it("round-trips text with reserved characters", () => {
    const text = "curl http://x?a=1&b=2";
    expect(urlDecode(urlEncode(text))).toBe(text);
  });

  it("rejects a malformed percent-escape", () => {
    expect(() => urlDecode("100% not a %zz escape")).toThrow();
  });

  it("round-trips unicode text", () => {
    const text = "échó 🔥 says hi";
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

  it("reverses by code point, not UTF-16 code unit, so surrogate pairs survive", () => {
    // A naive input.split("").reverse().join("") would split this emoji's
    // surrogate pair apart and corrupt it.
    expect(reverseString("a🔥b")).toBe("b🔥a");
  });
});

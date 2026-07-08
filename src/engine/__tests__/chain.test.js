import { describe, expect, it } from "vitest";
import { chainReachesTarget, runChain } from "../chain.js";
import { base64Encode } from "../transforms/base64.js";
import { rot13 } from "../transforms/rot13.js";

describe("runChain", () => {
  it("peels multiple layers in order", () => {
    const plaintext = "echo peeled";
    const obfuscated = base64Encode(rot13(plaintext));

    const steps = runChain(obfuscated, ["base64-decode", "rot13"]);

    expect(steps).toHaveLength(3);
    expect(steps[1].text).toBe(rot13(plaintext));
    expect(steps[2].text).toBe(plaintext);
  });

  it("stops at the first failing operation instead of throwing", () => {
    const steps = runChain("not base64!!", ["base64-decode", "rot13"]);

    expect(steps).toHaveLength(2);
    expect(steps[1].ok).toBe(false);
  });
});

describe("chainReachesTarget", () => {
  it("confirms a correct move sequence", () => {
    const plaintext = "echo peeled";
    const obfuscated = base64Encode(rot13(plaintext));

    expect(chainReachesTarget(obfuscated, ["base64-decode", "rot13"], plaintext)).toBe(true);
  });

  it("rejects a wrong move sequence", () => {
    const plaintext = "echo peeled";
    const obfuscated = base64Encode(rot13(plaintext));

    expect(chainReachesTarget(obfuscated, ["rot13"], plaintext)).toBe(false);
  });
});

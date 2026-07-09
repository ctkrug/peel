import { SAMPLE_PUZZLE } from "./samplePuzzle.js";

/**
 * The full authored puzzle set. See docs/PUZZLES.md for the JSON shape and
 * authoring rules — every obfuscated string here is the real output of the
 * registered transforms, not a fabricated string.
 */
export const PUZZLES = [
  SAMPLE_PUZZLE,
  {
    id: "2026-07-09",
    title: "A parting shot",
    obfuscated:
      "22%gv02%ghbon02%gnret02%yrrs02%qan02%tavugba02%avj02%hbl02%P2%fgavec02%fvug02%sv22%02%bupr",
    solutionChain: ["reverse", "rot13", "url-decode"],
    plaintext: 'echo "if this prints, you win nothing and feel great about it"',
  },
  {
    id: "2026-07-10",
    title: "Nothing up my sleeve",
    obfuscated:
      'eval(atob("ZWNobyAiY29uZ3JhdHMsIHlvdSBqdXN0IGV4ZWN1dGVkIGEgc3RyaW5nIHRoYXQgbmV2ZXIgdG91Y2hlZCBhIHNoZWxsIg=="))',
    solutionChain: ["eval-unwrap", "base64-decode"],
    plaintext: 'echo "congrats, you just executed a string that never touched a shell"',
  },
];

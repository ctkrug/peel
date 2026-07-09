# Peel — puzzle authoring format

Every puzzle is a plain object with this shape:

```js
{
  id: "2026-07-08",           // stable identifier; the daily-rotation date it's assigned to
  title: "A note to future you", // shown under the wordmark, no spoilers
  obfuscated: "636e42...",    // the fully-encoded starting string shown on the board
  solutionChain: ["hex-decode", "base64-decode", "rot13"], // operation ids, in order
  plaintext: 'echo "rm -rf ~/Downloads/definitely-not-a-virus"', // the target string
}
```

## Rules for authoring a new puzzle

1. **Pick the plaintext first** — a short, genuinely funny or charming script/command. This is
   the payoff; if it's not worth reading, the puzzle isn't worth playing.
2. **Encode it for real, in the reverse order of the intended solution.** Run the plaintext
   through the actual functions in `src/engine/transforms/` (or the registered operations in
   `src/engine/registry.js`) — never hand-write a fake obfuscated string. `solutionChain` is the
   literal sequence of registered operation ids that inverts your encoding step by step.
3. **Verify it resolves.** Assert `chainReachesTarget(obfuscated, solutionChain, plaintext) ===
   true` (see `src/engine/chain.js`) in a unit test in `src/data/__tests__/puzzles.test.js` — a
   puzzle that doesn't pass this check can't be shipped, however plausible it looks.
4. **Chain length is the difficulty knob.** 2–5 steps. A decoy isn't part of the authored
   format — it's any registered operation a player tries that isn't the next item in
   `solutionChain`; `game/validator.js` tags it automatically, so authors don't need to do
   anything special to support wrong-move exploration.
5. **`eval-unwrap`-based puzzles**: `eval-unwrap` only strips the `eval(...)` (and, if present,
   a nested `atob(...)`) call syntax down to its inner string literal — it does not decode
   base64 itself. An `eval(atob("..."))`-obfuscated puzzle still needs a following
   `base64-decode` step in `solutionChain` to reach plaintext.

## Where puzzles live

`src/data/puzzles.js` exports `PUZZLES`, the full authored list (currently includes the original
`SAMPLE_PUZZLE`). `src/game/dailyPuzzle.js` picks one deterministically for a given date — see
`docs/ARCHITECTURE.md` for how daily rotation selects from this list.

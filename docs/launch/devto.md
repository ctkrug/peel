---
title: "Building Peel, a daily deobfuscation puzzle where the decoder is the game"
published: false
tags: javascript, gamedev, webdev, canvas
---

I like reading obfuscated one-liners. The base64-in-a-base64, the `eval(atob(...))` wrappers, the
occasional ROT13 that someone thought counted as encryption. What I could never find was a small,
fun, daily way to enjoy that. CyberChef is the professional tool for it, but it is a workbench, not
a game. So I built [Peel](https://apps.charliekrug.com/peel/): one obfuscated one-liner a day, and
you peel it apart one decode at a time until the plaintext shows. Fewest moves wins.

Here are the two decisions that shaped the build.

## The decoder is the game, in both directions

The thing I most wanted to avoid was a fake reveal, a puzzle that plays a canned animation instead
of actually decoding anything. So the transform engine is the whole game, and it runs in both
directions.

Every transform is a pure `string -> string` function that throws on invalid input:

```js
export function hexDecode(input) {
  const clean = input.trim().replace(/\s+/g, "");
  if (!/^([0-9a-fA-F]{2})*$/.test(clean)) {
    throw new Error("not valid hex");
  }
  const bytes = (clean.match(/.{2}/g) ?? []).map((pair) => parseInt(pair, 16));
  return new TextDecoder().decode(Uint8Array.from(bytes));
}
```

Puzzles are authored plaintext-first. To build one I take the readable string and run the encode
transforms in the order I want the player to reverse, which produces the obfuscated blob. The
puzzle stores that blob plus the solution chain, which is the exact inverse. Because the same engine
does both jobs, a test can assert that running the chain over the blob really returns the plaintext:

```js
export function chainReachesTarget(startingText, operationIds, target) {
  const steps = runChain(startingText, operationIds);
  const last = steps[steps.length - 1];
  return last.ok && last.text === target;
}
```

That check runs over every puzzle in the test suite, so a mis-authored puzzle fails CI instead of
shipping. When you press "Base64 decode" in the game, it calls the same `base64Decode` the author
used, on the current board text. Nothing is scripted.

One small but satisfying detail: I wrote base64 by hand against a `TextEncoder`/`TextDecoder`
instead of reaching for `Buffer`, so the identical code runs in the browser and in Node tests with
no environment branch.

## Telling an advancing move from a decoy

A move can do three things: advance the solution, apply cleanly but lead nowhere (a decoy), or fail
to apply at all. I did not want to hardcode "move 3 is correct." Instead the validator counts how
many on-path moves you have already played and checks whether your next operation matches the
solution chain at that index:

```js
function onPathCount(state) {
  return state.history.filter((move) => move.onPath).length;
}

export function isOnPathMove(state, operationId) {
  const expected = state.puzzle.solutionChain[onPathCount(state)];
  return operationId === expected;
}
```

Decoys interleaved in your history do not advance the counter, they just sit there. Undo walks back
through history and restores the text from the last successful move. This kept the state model tiny:
every move returns a new immutable state object, and the only stateful thing in the app is one
closure variable in `main.js` that holds the current state and touches the DOM.

## What I would do differently

I would build the puzzle authoring as a tiny CLI from day one. I wrapped early puzzles by hand in a
scratch file, and while the CI check caught mistakes, a `peel author` command that takes plaintext
and a chain and prints the puzzle JSON would have saved time. I would also add a hint system that
spends a move to highlight the outer encoding, since new players sometimes stall on the first layer.

The engine, game state, and UI helpers sit at 100% line and branch coverage. The canvas renderer
and DOM wiring are verified by hand and with Playwright, since unit-testing pixel output is more
trouble than it is worth for a project this size.

Play it here: [apps.charliekrug.com/peel](https://apps.charliekrug.com/peel/)
Source: [github.com/ctkrug/peel](https://github.com/ctkrug/peel)

# Peel

A daily puzzle where you peel back a real obfuscated one-liner — base64 chains, ROT13, hex,
URL-encoding, nested `eval` — move by move until the plaintext script is revealed. Fewest moves
wins.

## What it is

Every day, Peel ships one hand-crafted puzzle: a genuinely obfuscated shell/JS one-liner wrapped
in a chain of reversible encodings. You pick a decode operation, watch that layer visibly unwind,
and keep going until the garbage resolves into a short, readable, funny plaintext script. Your
score is the move count and the clock.

Think Wordle, but the payoff is a real deobfuscation "aha" instead of five colored squares.

## Why

[CyberChef](https://github.com/gchq/CyberChef) is the professional's power tool for this kind of
work — dozens of operations, infinitely composable, built for CTF players and security analysts.
It is not a game. Nothing today turns "decode the obfuscated one-liner" into a bite-sized,
shareable, scored daily puzzle the way Wordle turned five-letter words into a habit. Peel is
that game.

## Core features

- A hand-built string-transform engine (base64, hex, ROT13, URL-encoding, string reversal) that
  chains operations and validates partial decode state at every move.
- A move-by-move reveal on a canvas board: each click on a transform button peels one layer off
  the obfuscated string with a crossfade, and wrong/off-path moves shake the board.
- Move history, undo, a live timer that freezes on solve, and a win overlay with your stats.
- Synth WebAudio SFX (hover/success/fail/win) with a persisted mute toggle — no audio files.
- Terminal/CRT-phosphor visual direction end to end (see [`docs/DESIGN.md`](docs/DESIGN.md)).

## Planned

- Nested `eval` unwrapping, additional hand-authored puzzles, and deterministic daily rotation
  (see [`docs/BACKLOG.md`](docs/BACKLOG.md) Epic 4).
- A shareable, spoiler-free result grid (Wordle-style).
- A streak/history view so daily play compounds over time.

## Stack

- Vanilla JavaScript, [Vite](https://vitejs.dev/) for dev/build, [Vitest](https://vitest.dev/)
  for unit tests.
- Canvas 2D for the puzzle board and reveal animation — no UI framework.
- Zero backend: puzzles are static JSON, ships as a static site.

## Status

The core peel loop and its juice (animation, sound, win screen) are playable end to end against
one hand-verified sample puzzle. See [`docs/VISION.md`](docs/VISION.md) for the full design,
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the module map, and
[`docs/BACKLOG.md`](docs/BACKLOG.md) for the build plan.

## Development

```sh
npm install
npm run dev      # local dev server
npm test         # run the unit tests
npm run build    # production build into dist/
```

## License

MIT — see [LICENSE](LICENSE).

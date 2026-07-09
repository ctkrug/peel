# Peel — Architecture

A concise map for picking this codebase back up cold. See `docs/VISION.md` for product intent
and `docs/DESIGN.md` for the visual direction; `docs/BACKLOG.md` tracks what's built.

## Run / test

- `npm run dev` — Vite dev server.
- `npm test` — `vitest run`, all pure logic (no DOM/canvas/audio required).
- `npm run build` — static production build to `dist/`, relative asset paths (`base: "./"` in
  `vite.config.js`) so it can be served from a subpath like `apps.charliekrug.com/peel/`.

## Data flow

```
SAMPLE_PUZZLE (data/samplePuzzle.js)
        │
        ▼
createPuzzleState (game/puzzle.js) ──► { puzzle, currentText, history, complete, startedAt, completedAt }
        │
        ▼
attemptMove(state, operationId, now) (game/validator.js)
        │  applyOperation via engine/registry.js
        │  tags the move onPath/decoy via isOnPathMove
        ▼
new state ──► main.js re-renders: canvas board, move-history list, timer, undo/toolbox state
```

`state` is plain, immutable-per-call data — `attemptMove`/`undoLastMove` always return a new
object, never mutate in place. `main.js` is the only stateful thing (holds the current `state` in
a closure variable) and the only place that touches the DOM.

## Modules

- **`engine/`** — the transform layer. `transforms/*.js` are pure `string -> string` functions
  (throwing on invalid input); `registry.js` is the `{ id: { label, apply } }` lookup the rest of
  the app uses instead of importing transforms directly; `chain.js` runs a sequence of operation
  ids over a starting string (`runChain`) and checks whether it reaches a target
  (`chainReachesTarget`) — used by both puzzle authoring/tests and could back a future solver.
- **`data/samplePuzzle.js`** — the one hardcoded puzzle for v1 (no daily rotation yet, see
  BACKLOG Epic 4). Shape: `{ id, title, obfuscated, solutionChain, plaintext }`.
- **`game/`** — puzzle rules, no DOM/canvas dependency.
  - `puzzle.js`: `createPuzzleState`, `moveCount`, `elapsedMs` (zero before the first move, ticks
    against `now` while unsolved, frozen at `completedAt - startedAt` once complete).
  - `validator.js`: `attemptMove` (applies an operation, records history, detects completion),
    `undoLastMove`, `isOnPathMove` (compares an attempted op against the next not-yet-played step
    of `puzzle.solutionChain`, so an interleaved decoy doesn't block later correct steps from
    still counting as on-path).
- **`canvas/`** — the board renderer, DOM/canvas dependent (untested directly; verified by hand).
  - `renderer.js`: `createRenderer(canvas)` → `{ resize, render, transitionTo }`. `render` draws
    instantly; `transitionTo` crossfades to new text over 120ms with a one-frame static-glyph
    flicker mid-transition (falls back to instant `render` under `prefers-reduced-motion`).
  - `glitchText.js`: `randomGlyphs(length, random)` — pure, used for both the crossfade's static
    frame and the win overlay's matrix-rain glyphs.
- **`audio/`** — synthesized WebAudio SFX, no binary assets.
  - `muteStore.js`: `createMuteStore(storage)` — thin wrapper over any Storage-like object
    (localStorage in the app, an in-memory fake in tests) for the persisted mute flag.
  - `sfx.js`: `createSfx(storage)` → `{ isMuted, setMuted, hover, moveSuccess, moveFail, win }`.
    The `AudioContext` is constructed lazily on the first non-muted play call (always from a user
    gesture), so there's no autoplay-policy violation. Oscillator/noise node graphs are covered by
    tests via a fake `AudioContext`; actual sound is manual-QA only.
- **`ui/`** — small pure helpers extracted out of `main.js` so they're unit-testable.
  - `format.js`: `formatElapsed(ms)` → `"m:ss"`.
  - `historyView.js`: `describeMove(move, operations)` → `{ label, status, detail }` for the
    move-history panel (`status` is `"on-path" | "decoy" | "failed"`; never touches
    plaintext/obfuscated strings, just the move's own text/error).
- **`main.js`** — the only DOM-touching module. Builds the page once (`mount`), wires toolbox
  buttons, undo, the mute toggle, the wordmark glitch, and the win overlay, and holds `state` +
  `timerHandle` in closure. `update(lastMove)` is the single re-render entrypoint: it decides
  crossfade vs. shake+flash from `lastMove.ok`/`lastMove.onPath`, then re-renders the move count,
  timer, history list, and (on a fresh win) the win overlay + `sfx.win()`.

## Adding a new transform

1. Add a pure function to `engine/transforms/` (throw on invalid input, never return `null`).
2. Register it in `engine/registry.js` with a display `label`.
3. Unit-test happy path + malformed input in `engine/__tests__/`.

## Adding a new puzzle

Author `{ id, title, obfuscated, solutionChain, plaintext }` by hand (obfuscation must be genuine
output of the registered transforms, not a fabricated string) and assert
`chainReachesTarget(obfuscated, solutionChain, plaintext) === true` in a test — see
`engine/__tests__/chain.test.js`. Daily rotation across multiple puzzles is not built yet
(BACKLOG Epic 4).

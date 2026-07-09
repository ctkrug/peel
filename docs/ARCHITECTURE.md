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
PUZZLES (data/puzzles.js) ──► getDailyPuzzle(dateString, PUZZLES) (game/dailyPuzzle.js)
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
  `transforms/evalUnwrap.js` is syntactic only (strips `eval(...)`/`atob(...)` call wrapping down
  to the inner string literal) — it never executes code, so an `eval(atob(...))` puzzle still
  needs a following `base64-decode` step.
- **`data/`** — static puzzle content, no daily-rotation logic (that's `game/dailyPuzzle.js`).
  - `samplePuzzle.js`: the original v1 puzzle, `{ id, title, obfuscated, solutionChain,
    plaintext }` (see `docs/PUZZLES.md` for the full authoring format/rules).
  - `puzzles.js`: `PUZZLES`, the full authored list (`SAMPLE_PUZZLE` plus hand-authored puzzles);
    every entry's chain is verified against its plaintext in `data/__tests__/puzzles.test.js`.
- **`game/`** — puzzle rules, no DOM/canvas dependency.
  - `puzzle.js`: `createPuzzleState`, `moveCount`, `elapsedMs` (zero before the first move, ticks
    against `now` while unsolved, frozen at `completedAt - startedAt` once complete).
  - `validator.js`: `attemptMove` (applies an operation, records history, detects completion),
    `undoLastMove`, `isOnPathMove` (compares an attempted op against the next not-yet-played step
    of `puzzle.solutionChain`, so an interleaved decoy doesn't block later correct steps from
    still counting as on-path).
  - `dailyPuzzle.js`: `getDailyPuzzle(dateString, puzzles)` — hashes the date string to an index
    into `puzzles` so the same date always resolves to the same puzzle with no server or
    `Math.random()`; falls back to `SAMPLE_PUZZLE` if the list is empty.
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
  - `shareResult.js`: `buildShareGrid(history)` maps each move to a spoiler-free symbol
    (on-path/decoy/failed, never the move's text); `buildShareText(state, now)` wraps that grid
    with the puzzle id, move count, and elapsed time for the win overlay's Share button.
- **`main.js`** — the only DOM-touching module. Resolves today's puzzle via
  `getDailyPuzzle(todayDateString(), PUZZLES)`, builds the page once (`mount`), wires toolbox
  buttons, undo, the mute toggle, the wordmark glitch, and the win overlay (including Share, which
  copies `buildShareText`'s output to the clipboard), and holds `state` + `timerHandle` in
  closure. `update(lastMove)` is the single re-render entrypoint: it decides crossfade vs.
  shake+flash from `lastMove.ok`/`lastMove.onPath`, then re-renders the move count, timer, history
  list, and (on a fresh win) the win overlay + `sfx.win()`.

## Adding a new transform

1. Add a pure function to `engine/transforms/` (throw on invalid input, never return `null`).
2. Register it in `engine/registry.js` with a display `label`.
3. Unit-test happy path + malformed input in `engine/__tests__/`.

## Adding a new puzzle

See `docs/PUZZLES.md` for the full authoring format and rules. In short: author
`{ id, title, obfuscated, solutionChain, plaintext }` by hand (obfuscation must be genuine output
of the registered transforms, not a fabricated string), add it to `PUZZLES` in `data/puzzles.js`,
and assert `chainReachesTarget(obfuscated, solutionChain, plaintext) === true` in
`data/__tests__/puzzles.test.js`. It's automatically in the daily-rotation pool via
`game/dailyPuzzle.js` — no extra wiring needed.

# Peel — Backlog

Epics and stories for the v1 build. Every story lists concrete, checkable acceptance criteria —
no vibes. Story 1.1 is the wow moment from the project brief and ships first.

## Epic 1 — Core peel loop

- [x] **1.1 Wow moment: solve the sample puzzle end to end**
  - Loading the app shows the fully obfuscated `SAMPLE_PUZZLE.obfuscated` string on the board and
    nothing else is pre-decoded.
  - Clicking the correct next operation from `SAMPLE_PUZZLE.solutionChain`, in order, visibly
    updates the board text to that step's intermediate string after each click.
  - After the final correct move the board shows `SAMPLE_PUZZLE.plaintext` exactly and a timer
    that was running stops (its displayed value no longer changes on subsequent renders).

- [x] **1.2 Move history panel**
  - Every attempted operation (successful or not) appears in a visible list in the order it was
    played, labeled with the operation's display name.
  - A successful move's list entry shows the resulting text (or a truncated preview); a failed
    move's entry is visually distinguished (e.g. a different color/icon) from a successful one.

- [x] **1.3 Undo**
  - An "Undo" control is present and, when clicked after at least one move, restores
    `currentText` to the value it held before the last move and removes that move from history.
  - Undo is disabled (or a no-op) when there is no move history, and disabled once the puzzle is
    complete.

- [x] **1.4 Decoy/wrong-move feedback**
  - Playing an operation that is not the next step in the solution chain still applies if it's
    syntactically valid (per `docs/VISION.md`'s "decoys" design decision) and is visually marked
    as off-path in the history, without ending or resetting the puzzle.
  - Playing an operation that throws (e.g. `hex-decode` on non-hex text) shows an inline error
    state and leaves `currentText` unchanged, per `attemptMove`'s existing contract.

## Epic 2 — Juice & design polish

- [ ] **2.1 Design polish pass**
  - The board, toolbox, and header visually match `docs/DESIGN.md`'s tokens (colors, type
    pairing, radius, shadow/glow) rather than the SCOPE-phase placeholder styling.
  - The CRT scanline/glow treatment and the wordmark glitch detail from `docs/DESIGN.md` §4 are
    implemented and respect `prefers-reduced-motion`.

- [ ] **2.2 Peel animation**
  - A successful move crossfades the board text over ~120ms with a one-frame static flicker
    instead of an instant text swap.
  - A failed/off-path move triggers a ~100ms board shake and a brief danger-red flash, per
    `docs/DESIGN.md`'s juice plan.

- [ ] **2.3 Synth sound effects**
  - `hover`, `move-success`, `move-fail`, and `win` sounds are synthesized via WebAudio
    (oscillator/noise nodes) with no binary audio files in the repo.
  - A mute toggle is present, its state persists across a page reload via `localStorage`, and the
    `AudioContext` is only created after a user gesture (no autoplay-policy console error on
    load).

- [ ] **2.4 Win celebration**
  - Reaching the plaintext shows an overlay with the final move count, elapsed time, and one
    primary call-to-action button.
  - The overlay includes a particle/motion flourish that is skipped (or reduced to a static
    state) when `prefers-reduced-motion` is set.

## Epic 3 — Scoring & sharing

- [ ] **3.1 Live timer**
  - The timer starts on the first move (not on page load) and updates at least once per second
    while the puzzle is unsolved.
  - The timer freezes at the exact solve time once `state.complete` is true and does not resume
    on further interaction.

- [ ] **3.2 Shareable result string**
  - A "Share" control generates a Wordle-style grid (one row/symbol per move, marking
    on-path/off-path/failed) that contains no plaintext or obfuscated text — spoiler-free.
  - Clicking "Share" copies the result string to the clipboard (with a visible confirmation) and
    the same string is reproducible from `state.history` alone (pure function, covered by a
    unit test).

- [ ] **3.3 Win-screen stats**
  - The win overlay displays the final move count and elapsed time sourced directly from
    `state.history` / `state.completedAt - state.startedAt`, not a separately tracked value that
    could drift.

## Epic 4 — Puzzle content & daily rotation groundwork

- [ ] **4.1 Puzzle authoring format**
  - A documented JSON shape for a puzzle (`id`, `title`, `obfuscated`, `solutionChain`,
    `plaintext`) exists, and at least two additional hand-authored puzzles beyond
    `SAMPLE_PUZZLE` validate against it (each has a unit test asserting
    `chainReachesTarget(obfuscated, solutionChain, plaintext) === true`).
  - Each new puzzle's plaintext is a genuinely different joke/script than the sample, not a
    reworded duplicate.

- [ ] **4.2 Deterministic daily selection**
  - Given a date string and the puzzle list, a pure function returns the same puzzle for the
    same date on every call (no server, no randomness at call time), covered by a unit test.
  - If the computed date has no authored puzzle, the function falls back to `SAMPLE_PUZZLE`
    instead of throwing.

- [ ] **4.3 Nested `eval`-unwrap operation**
  - A new transform recognizes a wrapped `eval(...)` (or `eval(atob(...))`-style) call and
    returns its inner argument as plain text, with a unit test for at least one real nested
    example.
  - At least one puzzle in the authored set (from 4.1) uses this operation in its solution
    chain and passes the same `chainReachesTarget` check.

- [ ] **4.4 Design polish: puzzle content pass**
  - Every authored puzzle (sample plus new) is played once end-to-end after the Epic 2 polish
    pass lands, confirming the peel animation and win screen render correctly for each, not just
    the original sample.

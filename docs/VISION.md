# Peel — Vision

## The problem

Deobfuscating a nasty one-liner — a base64-wrapped, ROT13'd, `eval`-nested shell command — is a
real skill with a real "aha" moment, but the tools for practicing it are professional-grade and
intimidating. CyberChef is the reference tool: powerful, infinitely composable, built for CTF
players and security analysts who already know what a "magic wand" recipe does. It has no daily
cadence, no score, nothing to share. There is no on-ramp for someone who just wants a five-minute
puzzle and a payoff.

Meanwhile, the daily-puzzle genre (Wordle, Connections, Framed) has proven that a small,
well-scoped, once-a-day challenge with a shareable result is something people build a habit
around — but none of them touch this space. "Decode the weird string" is a genuinely satisfying
puzzle shape that nobody has turned into a game.

## Who it's for

People who enjoy daily puzzle games (Wordle-and-friends players) AND people adjacent to
security/dev work who'd get a kick out of a puzzle built from real obfuscation techniques —
without needing CyberChef-level expertise to play. No account, no install: open the page, play
today's puzzle, come back tomorrow.

## The core idea

Every day, Peel publishes one puzzle: a short, real, funny/interesting plaintext script (an
`echo`, a shell one-liner, a tiny script) that has been run through a chain of 2–5 reversible
encodings (base64, ROT13, hex, URL-encoding, string reversal, and eventually nested `eval`
unwrapping). The player sees only the fully obfuscated, garbage-looking end state.

Each turn, the player picks one decode operation from a fixed toolbox. If it's the right next
step, that layer visibly peels away on the board and the string gets one step closer to
readable — usually still gibberish for the first few moves. If it's the wrong operation, the
board shows the attempt failed (or produces new, differently-wrong garbage) and it costs a move.
The puzzle ends the instant the fully-decoded plaintext appears: **the timer stops, the moves are
final, and the payoff is that the resolved plaintext is actually worth reading** — a joke, a
useless-but-charming command, a tiny easter egg.

Score = move count (primary) and elapsed time (secondary, tiebreaker/bragging rights). A
shareable result mirrors the Wordle format: a small grid of which operations were tried, in
order, with no spoilers, postable anywhere.

## Key design decisions

- **The obfuscation is real, not decorative.** Every puzzle is an actual chain of real encodings
  applied to real text via the same transform engine the player interacts with — there's no
  separate "authoring format" that fakes the visual without the underlying transform being
  genuine. This is what makes the wow moment land: the player is really running base64 decode,
  not watching a canned animation.
- **The toolbox is fixed and small.** A short, memorizable set of operations (starting with
  base64, ROT13, hex, URL-encoding, reversal; nested `eval`-unwrapping later) keeps the game
  approachable — the challenge is picking the right order, not knowing obscure operations.
- **Partial state must always be inspectable and undoable.** The player can see the full history
  of moves and their resulting intermediate strings, and can undo — a puzzle game punishes wrong
  final answers, not exploration.
- **Zero backend.** Puzzles are static JSON, generated/curated ahead of time and shipped with the
  build. No server, no accounts, no database — this keeps the game free to host indefinitely and
  trivially cacheable as a static site.
- **Canvas-rendered board.** The peel animation (layers unwinding, the plaintext resolving) is
  the emotional core of the game and deserves a real animation loop, not DOM transitions —
  Canvas 2D gives full control over that reveal.
- **Hand-calibrated difficulty.** Puzzle authoring is manual, not procedurally generated: a human
  picks the plaintext (for the joke/charm), the encoding chain (for the difficulty curve), and
  verifies the chain resolves cleanly. Difficulty is expressed as chain length + whether any step
  is a decoy (an operation that "succeeds" syntactically but drifts further from the answer).

## What "v1 done" looks like

- The transform engine supports base64, ROT13, hex, URL-encoding, and string reversal, chainable
  in any order, with partial-state validation at every step (this exists today in `src/engine/`).
- A single daily puzzle (hardcoded or loaded from a static JSON file — no rotation/scheduling
  logic required for v1) is fully playable end-to-end: obfuscated start state → move-by-move
  peel → win state with move count and time.
- The canvas board renders the current string, animates each peel, and gives clear feedback for
  right vs. wrong moves, per `docs/DESIGN.md`.
- A win screen shows the final score, a shareable result string, and is genuinely satisfying to
  reach (the "wow moment" from the project brief).
- The site builds to a single static directory (relative asset paths) and is deployable as-is to
  `apps.charliekrug.com/peel`.
- Undo and a visible move history exist so play never feels like a guessing-only game.

Out of scope for v1 (future backlog): true daily rotation with a puzzle calendar, nested `eval`
unwrapping as an operation, a streak/history view backed by localStorage, decoy operations,
leaderboards.

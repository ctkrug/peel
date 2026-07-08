# Peel — Design

## 1. Aesthetic direction

**Terminal-mono / CRT:** Peel looks like a real terminal session on an old phosphor monitor —
near-black glass, a soft green glow, faint scanlines, and monospace type everywhere. The theme
isn't decorative: the player is *actually* running decode operations, so the UI should look like
the tool that would really do that.

## 2. Tokens

**Color**

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0a0f0d` | page background |
| `--surface-1` | `#101714` | panels, board frame |
| `--surface-2` | `#182019` | raised chips, buttons at rest |
| `--text` | `#d9f5e3` | primary text |
| `--text-muted` | `#6f8f7c` | secondary/meta text |
| `--accent` | `#4ef29c` | phosphor green — primary actions, success, the peel glow |
| `--accent-support` | `#ffb454` | amber — the wordmark accent glyph, secondary highlights |
| `--danger` | `#ff5f56` | wrong-move feedback |

**Type** — [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) (display: 700
weight, wide letter-spacing, used for the wordmark and headings) paired with
[IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) (UI: 400/500 weight, body text,
buttons, move history). System monospace fallback: `ui-monospace, "SF Mono", Consolas, monospace`.
Type scale: 13 / 16 / 20 / 25 / 32 / 40px (×1.25).

**Spacing** — 8px base unit: 8, 16, 24, 32, 48, 64.

**Radius** — 4px. Sharp corners read as "terminal window," not "app card."

**Shadow / glow** — panels get a layered CRT-bezel treatment: `inset 0 1px 0 rgba(255,255,255,0.04)`
plus an outer `0 8px 24px rgba(0,0,0,0.5)`. Active/focused controls and a correct peel get an
outer phosphor glow: `0 0 16px rgba(78,242,156,0.35)`.

**Motion** — UI transitions 160ms ease-out. A correct peel: 120ms crossfade with a 1-frame
static flicker. A wrong move: 100ms, board shakes ±3px twice and flashes danger red.

## 3. Layout intent

The hero is **the board**: the obfuscated string, rendered large and centered, with the move
toolbox and history as a supporting rail.

- **Desktop (1440×900):** board + toolbox in a two-column layout — board ~65% width on the
  left, a right sidebar (~35%) stacking the move toolbox, move history, and timer/score. Board
  fills ≥60vh.
- **Phone (390×844):** single column — board on top (full width, ~50vh), toolbox directly below
  as a wrapped button grid, move history collapses to a horizontal scroll strip under the timer.

## 4. Signature detail

The wordmark "peel" in the header periodically (every ~6s, and once on load) glitches through
one obfuscated frame — e.g. flickers to `cGVlbA==` for ~100ms — before snapping back to clean
"peel" text. The wordmark demonstrates the game's own mechanic. Respects
`prefers-reduced-motion` (glitch disabled, wordmark stays static).

## 5. Juice plan

- **Movement tween:** each peel crossfades the board text over 120ms with a one-frame static
  flicker (opacity/blur glitch), never an instant swap.
- **Impact feedback (wrong move):** board shakes ±3px over 100ms and flashes a danger-red
  vignette at 15% opacity.
- **Goal feedback (correct move):** board pulses an outer phosphor glow, and a new chip pops
  into the move history with a 140ms scale-in (0.85 → 1).
- **Win celebration:** overlay with a matrix-rain-style particle sweep in phosphor green behind
  a stats card (moves, time, share grid) and one clear CTA — "Share result."
- **Synth SFX (WebAudio, generated in code — no audio files):**
  - `hover` — a soft short click (filtered noise burst, ~15ms)
  - `move-success` — two-tone ascending blip (square wave, ~90ms)
  - `move-fail` — a low buzzy thud (sawtooth, ~140ms, low-pass filtered)
  - `win` — a short 4-note arpeggio chime (sine wave)
  - All SFX are low-volume and rate-throttled; a mute toggle (speaker icon, top-right) persists
    in `localStorage` and the `AudioContext` is created lazily on first user gesture.

Every later BUILD/QA run follows this file. Changes to direction or tokens get their own commit
with a stated reason.

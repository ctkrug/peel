import { createPuzzleState, elapsedMs, moveCount } from "./game/puzzle.js";
import { attemptMove, undoLastMove } from "./game/validator.js";
import { getDailyPuzzle } from "./game/dailyPuzzle.js";
import { listOperations, OPERATIONS } from "./engine/registry.js";
import { createRenderer } from "./canvas/renderer.js";
import { PUZZLES } from "./data/puzzles.js";
import { formatElapsed } from "./ui/format.js";
import { describeMove } from "./ui/historyView.js";
import { buildShareText } from "./ui/shareResult.js";
import { createSfx } from "./audio/sfx.js";
import { randomGlyphs } from "./canvas/glitchText.js";

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function mount(root) {
  const todaysPuzzle = getDailyPuzzle(todayDateString(), PUZZLES);

  root.innerHTML = `
    <header class="app-header">
      <div class="app-header__title">
        <h1 class="wordmark">peel</h1>
        <p class="tagline">${todaysPuzzle.title}</p>
      </div>
      <button id="mute" class="mute-button" type="button" aria-pressed="false" aria-label="Mute sound">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor" />
          <path class="mute-button__wave" d="M16.5 8.5a5 5 0 0 1 0 7" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" />
          <path class="mute-button__slash" d="M18 9l4 6M22 9l-4 6" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" />
        </svg>
      </button>
    </header>
    <main class="layout">
      <div class="board-frame" id="board-frame">
        <canvas id="board" class="board"></canvas>
        <div class="board-flash" aria-hidden="true"></div>
      </div>
      <aside class="sidebar">
        <section>
          <h2>Toolbox</h2>
          <div id="toolbox" class="toolbox"></div>
          <button id="undo" class="undo-button" type="button">Undo</button>
        </section>
        <section>
          <h2>Moves</h2>
          <p id="move-count" class="move-count">0 moves</p>
          <p id="timer" class="timer">0:00</p>
          <ol id="history" class="history" aria-label="Move history"></ol>
        </section>
      </aside>
    </main>
    <div id="win-overlay" class="win-overlay" hidden>
      <div id="win-rain" class="win-overlay__rain" aria-hidden="true"></div>
      <div class="win-card" role="dialog" aria-modal="true" aria-labelledby="win-title">
        <p class="win-card__eyebrow">Solved</p>
        <h2 id="win-title" class="win-card__title">peel complete</h2>
        <dl class="win-card__stats">
          <div>
            <dt>Moves</dt>
            <dd id="win-moves">0</dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd id="win-time">0:00</dd>
          </div>
        </dl>
        <div class="win-card__actions">
          <button id="win-share" class="win-card__cta win-card__cta--secondary" type="button">Share result</button>
          <button id="win-play-again" class="win-card__cta" type="button">Play again</button>
        </div>
        <p id="win-share-status" class="win-card__share-status" role="status" aria-live="polite"></p>
      </div>
    </div>
  `;

  const canvas = root.querySelector("#board");
  const boardFrame = root.querySelector("#board-frame");
  const toolbox = root.querySelector("#toolbox");
  const moveCountEl = root.querySelector("#move-count");
  const timerEl = root.querySelector("#timer");
  const historyEl = root.querySelector("#history");
  const undoButton = root.querySelector("#undo");
  const muteButton = root.querySelector("#mute");
  const winOverlay = root.querySelector("#win-overlay");
  const winRain = root.querySelector("#win-rain");
  const winMovesEl = root.querySelector("#win-moves");
  const winTimeEl = root.querySelector("#win-time");
  const winPlayAgainButton = root.querySelector("#win-play-again");
  const winShareButton = root.querySelector("#win-share");
  const winShareStatus = root.querySelector("#win-share-status");
  const renderer = createRenderer(canvas);
  const sfx = createSfx(window.localStorage);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let state = createPuzzleState(todaysPuzzle);
  let timerHandle = null;
  let wasComplete = false;

  function updateMuteButton() {
    const muted = sfx.isMuted();
    muteButton.classList.toggle("mute-button--muted", muted);
    muteButton.setAttribute("aria-pressed", String(muted));
    muteButton.setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
  }

  muteButton.addEventListener("click", () => {
    sfx.setMuted(!sfx.isMuted());
    updateMuteButton();
  });
  updateMuteButton();

  function spawnMatrixRain() {
    winRain.innerHTML = "";
    const columns = 28;
    for (let i = 0; i < columns; i++) {
      const drop = document.createElement("span");
      drop.className = "win-overlay__drop";
      drop.style.left = `${(i / columns) * 100}%`;
      drop.style.animationDelay = `${Math.random() * 1.2}s`;
      drop.style.animationDuration = `${1.4 + Math.random() * 1.2}s`;
      drop.textContent = randomGlyphs(3 + Math.floor(Math.random() * 4));
      winRain.appendChild(drop);
    }
  }

  function showWinOverlay() {
    winMovesEl.textContent = String(moveCount(state));
    winTimeEl.textContent = formatElapsed(elapsedMs(state, Date.now()));
    winShareStatus.textContent = "";
    winOverlay.hidden = false;
    if (!reduceMotion) {
      spawnMatrixRain();
    }
    winPlayAgainButton.focus();
  }

  function hideWinOverlay() {
    winOverlay.hidden = true;
    winRain.innerHTML = "";
  }

  winShareButton.addEventListener("click", async () => {
    const text = buildShareText(state, Date.now());
    try {
      await navigator.clipboard.writeText(text);
      winShareStatus.textContent = "Copied to clipboard!";
    } catch {
      winShareStatus.textContent = text;
    }
  });

  winPlayAgainButton.addEventListener("click", () => {
    winShareStatus.textContent = "";
    hideWinOverlay();
    if (timerHandle !== null) {
      clearInterval(timerHandle);
      timerHandle = null;
    }
    state = createPuzzleState(todaysPuzzle);
    wasComplete = false;
    update();
  });

  function shakeBoard() {
    boardFrame.classList.remove("board-frame--shake");
    void boardFrame.offsetWidth; // restart the animation even if it's already running
    boardFrame.classList.add("board-frame--shake");
  }

  function tickTimer() {
    timerEl.textContent = formatElapsed(elapsedMs(state, Date.now()));
    if (state.complete && timerHandle !== null) {
      clearInterval(timerHandle);
      timerHandle = null;
    }
  }

  for (const operationId of listOperations()) {
    const button = document.createElement("button");
    button.textContent = OPERATIONS[operationId].label;
    button.addEventListener("mouseenter", () => sfx.hover());
    button.addEventListener("click", () => {
      const movesBefore = state.history.length;
      state = attemptMove(state, operationId, Date.now());
      if (timerHandle === null && state.startedAt !== null && !state.complete) {
        timerHandle = setInterval(tickTimer, 250);
      }
      const lastMove = state.history.length > movesBefore ? state.history.at(-1) : null;
      if (lastMove?.ok && lastMove.onPath) {
        sfx.moveSuccess();
      } else if (lastMove) {
        sfx.moveFail();
      }
      update(lastMove);
    });
    toolbox.appendChild(button);
  }

  undoButton.addEventListener("mouseenter", () => sfx.hover());
  undoButton.addEventListener("click", () => {
    state = undoLastMove(state);
    update();
  });

  function update(lastMove = null) {
    if (lastMove && lastMove.ok && lastMove.onPath) {
      renderer.transitionTo(state.currentText, reduceMotion);
    } else {
      renderer.render(state.currentText);
      if (lastMove) {
        shakeBoard();
      }
    }
    moveCountEl.textContent = `${moveCount(state)} move${moveCount(state) === 1 ? "" : "s"}`;
    toolbox.querySelectorAll("button").forEach((button) => {
      button.disabled = state.complete;
    });
    undoButton.disabled = state.complete || state.history.length === 0;
    if (state.complete) {
      moveCountEl.textContent += " — solved!";
    }
    if (state.complete && !wasComplete) {
      sfx.win();
      showWinOverlay();
    }
    wasComplete = state.complete;
    tickTimer();
    renderHistory();
  }

  function renderHistory() {
    historyEl.innerHTML = "";
    state.history.forEach((move) => {
      const described = describeMove(move, OPERATIONS);
      const item = document.createElement("li");
      item.className = `history-entry history-entry--${described.status}`;

      const label = document.createElement("span");
      label.className = "history-entry__label";
      label.textContent = described.label;

      const detail = document.createElement("span");
      detail.className = "history-entry__detail";
      detail.textContent = described.detail;

      item.append(label, detail);
      historyEl.appendChild(item);
    });
  }

  window.addEventListener("resize", () => {
    renderer.resize();
    update();
  });

  startWordmarkGlitch(root.querySelector(".wordmark"));

  update();
}

const WORDMARK_GLITCH_FRAME = "cGVlbA==";
const WORDMARK_GLITCH_INTERVAL_MS = 6000;
const WORDMARK_GLITCH_DURATION_MS = 100;

function startWordmarkGlitch(wordmarkEl) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const cleanText = wordmarkEl.textContent;
  function glitch() {
    wordmarkEl.textContent = WORDMARK_GLITCH_FRAME;
    setTimeout(() => {
      wordmarkEl.textContent = cleanText;
    }, WORDMARK_GLITCH_DURATION_MS);
  }

  glitch();
  setInterval(glitch, WORDMARK_GLITCH_INTERVAL_MS);
}

mount(document.getElementById("app"));

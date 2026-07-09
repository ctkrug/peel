import { createPuzzleState, elapsedMs, moveCount } from "./game/puzzle.js";
import { attemptMove, undoLastMove } from "./game/validator.js";
import { listOperations, OPERATIONS } from "./engine/registry.js";
import { createRenderer } from "./canvas/renderer.js";
import { SAMPLE_PUZZLE } from "./data/samplePuzzle.js";
import { formatElapsed } from "./ui/format.js";
import { describeMove } from "./ui/historyView.js";

function mount(root) {
  root.innerHTML = `
    <header class="app-header">
      <h1 class="wordmark">peel</h1>
      <p class="tagline">${SAMPLE_PUZZLE.title}</p>
    </header>
    <main class="layout">
      <div class="board-frame">
        <canvas id="board" class="board"></canvas>
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
  `;

  const canvas = root.querySelector("#board");
  const toolbox = root.querySelector("#toolbox");
  const moveCountEl = root.querySelector("#move-count");
  const timerEl = root.querySelector("#timer");
  const historyEl = root.querySelector("#history");
  const undoButton = root.querySelector("#undo");
  const renderer = createRenderer(canvas);

  let state = createPuzzleState(SAMPLE_PUZZLE);
  let timerHandle = null;

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
    button.addEventListener("click", () => {
      state = attemptMove(state, operationId, Date.now());
      if (timerHandle === null && state.startedAt !== null && !state.complete) {
        timerHandle = setInterval(tickTimer, 250);
      }
      update();
    });
    toolbox.appendChild(button);
  }

  undoButton.addEventListener("click", () => {
    state = undoLastMove(state);
    update();
  });

  function update() {
    renderer.render(state.currentText);
    moveCountEl.textContent = `${moveCount(state)} move${moveCount(state) === 1 ? "" : "s"}`;
    toolbox.querySelectorAll("button").forEach((button) => {
      button.disabled = state.complete;
    });
    undoButton.disabled = state.complete || state.history.length === 0;
    if (state.complete) {
      moveCountEl.textContent += " — solved!";
    }
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

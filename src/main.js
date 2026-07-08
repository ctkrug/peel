import { createPuzzleState, moveCount } from "./game/puzzle.js";
import { attemptMove } from "./game/validator.js";
import { listOperations, OPERATIONS } from "./engine/registry.js";
import { createRenderer } from "./canvas/renderer.js";
import { SAMPLE_PUZZLE } from "./data/samplePuzzle.js";

function mount(root) {
  root.innerHTML = `
    <header class="app-header">
      <h1 class="wordmark">peel</h1>
      <p class="tagline">${SAMPLE_PUZZLE.title}</p>
    </header>
    <main class="layout">
      <canvas id="board" class="board"></canvas>
      <aside class="sidebar">
        <section>
          <h2>Toolbox</h2>
          <div id="toolbox" class="toolbox"></div>
        </section>
        <section>
          <h2>Moves</h2>
          <p id="move-count" class="move-count">0 moves</p>
        </section>
      </aside>
    </main>
  `;

  const canvas = root.querySelector("#board");
  const toolbox = root.querySelector("#toolbox");
  const moveCountEl = root.querySelector("#move-count");
  const renderer = createRenderer(canvas);

  let state = createPuzzleState(SAMPLE_PUZZLE);

  for (const operationId of listOperations()) {
    const button = document.createElement("button");
    button.textContent = OPERATIONS[operationId].label;
    button.addEventListener("click", () => {
      state = attemptMove(state, operationId, Date.now());
      update();
    });
    toolbox.appendChild(button);
  }

  function update() {
    renderer.render(state.currentText);
    moveCountEl.textContent = `${moveCount(state)} move${moveCount(state) === 1 ? "" : "s"}`;
    toolbox.querySelectorAll("button").forEach((button) => {
      button.disabled = state.complete;
    });
    if (state.complete) {
      moveCountEl.textContent += " — solved!";
    }
  }

  window.addEventListener("resize", () => {
    renderer.resize();
    update();
  });

  update();
}

mount(document.getElementById("app"));

import { applyOperation } from "../engine/registry.js";

/**
 * How many of the puzzle's solution-chain steps have been played, in order,
 * so far — decoys interleaved in between don't reset this count, they just
 * don't advance it. Used to tell the next move's on-path/off-path status.
 */
function onPathCount(state) {
  return state.history.filter((move) => move.onPath).length;
}

export function isOnPathMove(state, operationId) {
  const expected = state.puzzle.solutionChain[onPathCount(state)];
  return operationId === expected;
}

export function attemptMove(state, operationId, now) {
  if (state.complete) {
    return state;
  }

  const startedAt = state.startedAt ?? now;
  const onPath = isOnPathMove(state, operationId);
  let result;
  try {
    result = { text: applyOperation(operationId, state.currentText), ok: true, onPath };
  } catch (error) {
    result = { text: null, ok: false, onPath: false, error: error.message };
  }

  const history = [...state.history, { operationId, ...result }];
  const currentText = result.ok ? result.text : state.currentText;
  const complete = result.ok && currentText === state.puzzle.plaintext;

  return {
    ...state,
    currentText,
    history,
    startedAt,
    complete,
    completedAt: complete ? now : state.completedAt,
  };
}

export function undoLastMove(state) {
  if (state.complete || state.history.length === 0) {
    return state;
  }

  const history = state.history.slice(0, -1);
  const lastOk = [...history].reverse().find((move) => move.ok);
  const currentText = lastOk ? lastOk.text : state.puzzle.obfuscated;

  return { ...state, history, currentText };
}

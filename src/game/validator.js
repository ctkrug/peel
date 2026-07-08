import { applyOperation } from "../engine/registry.js";

export function attemptMove(state, operationId, now) {
  if (state.complete) {
    return state;
  }

  const startedAt = state.startedAt ?? now;
  let result;
  try {
    result = { text: applyOperation(operationId, state.currentText), ok: true };
  } catch (error) {
    result = { text: null, ok: false, error: error.message };
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

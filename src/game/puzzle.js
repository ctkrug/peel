export function createPuzzleState(puzzle) {
  return {
    puzzle,
    currentText: puzzle.obfuscated,
    history: [],
    complete: false,
    startedAt: null,
    completedAt: null,
  };
}

export function moveCount(state) {
  return state.history.length;
}

/**
 * Elapsed solve time. Zero before the first move, frozen at the exact solve
 * time once complete, otherwise ticking against `now`.
 */
export function elapsedMs(state, now) {
  if (state.startedAt === null) {
    return 0;
  }
  const end = state.complete ? state.completedAt : now;
  return end - state.startedAt;
}

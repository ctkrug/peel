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

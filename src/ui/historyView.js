const PREVIEW_LENGTH = 40;

function truncate(text) {
  return text.length > PREVIEW_LENGTH ? `${text.slice(0, PREVIEW_LENGTH)}…` : text;
}

/**
 * Maps a raw history entry to what the move-history panel renders: a label,
 * a status for styling, and either a text preview (success) or the error
 * message (failure) — never both, and never the puzzle's plaintext/obfuscated
 * strings directly, so this stays reusable for a future spoiler-free share view.
 */
export function describeMove(move, operations) {
  const label = operations[move.operationId]?.label ?? move.operationId;

  if (!move.ok) {
    return { label, status: "failed", detail: move.error };
  }

  return {
    label,
    status: move.onPath ? "on-path" : "decoy",
    detail: truncate(move.text),
  };
}

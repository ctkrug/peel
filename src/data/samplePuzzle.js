/**
 * A single hand-verified puzzle used as the v1 placeholder for daily rotation.
 * The obfuscated string is genuinely produced by the engine's own transforms
 * (rot13 -> base64-encode -> hex-encode), so the solution chain below is the
 * real inverse, not a scripted animation.
 */
export const SAMPLE_PUZZLE = {
  id: "2026-07-08",
  title: "A note to future you",
  obfuscated:
    "636e4231596941695a586f674c57567a4948347655574a7159586c69626e466d4c33467963335a68646d64796557777459574a6e4c57347461585a6c61475969",
  solutionChain: ["hex-decode", "base64-decode", "rot13"],
  plaintext: 'echo "rm -rf ~/Downloads/definitely-not-a-virus"',
};

const GLYPHS = "!@#$%^&*<>?/\\|{}[]01";

/** Generates a string of random glyph characters for the one-frame static flicker. */
export function randomGlyphs(length, random = Math.random) {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += GLYPHS[Math.floor(random() * GLYPHS.length)];
  }
  return out;
}

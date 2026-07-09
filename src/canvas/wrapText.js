/**
 * Wraps `text` into lines no wider than `maxWidth`, breaking on spaces first
 * and falling back to a character-by-character break for any single word
 * (or the obfuscated blobs this game deals in, which are one giant "word")
 * that alone exceeds `maxWidth` — otherwise it would run off the board
 * instead of wrapping.
 */
export function computeWrappedLines(text, maxWidth, measureWidth) {
  const lines = [];
  let line = "";

  function flush() {
    if (line) {
      lines.push(line);
      line = "";
    }
  }

  for (const word of text.split(" ")) {
    if (measureWidth(word) <= maxWidth) {
      const candidate = line ? `${line} ${word}` : word;
      if (measureWidth(candidate) <= maxWidth) {
        line = candidate;
      } else {
        flush();
        line = word;
      }
      continue;
    }

    flush();
    let chunk = "";
    for (const char of word) {
      const next = chunk + char;
      if (chunk && measureWidth(next) > maxWidth) {
        lines.push(chunk);
        chunk = char;
      } else {
        chunk = next;
      }
    }
    line = chunk;
  }

  flush();
  return lines.length ? lines : [""];
}

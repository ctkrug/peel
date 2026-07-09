/**
 * Unwraps a textual `eval("...")` or `eval(atob("..."))` call to its inner
 * argument. This is a syntactic unwrap only — it never executes code — so an
 * `eval(atob("..."))` puzzle still needs a following `base64-decode` move to
 * reveal the plaintext, same as any other chained encoding.
 */
export function evalUnwrap(input) {
  const text = input.trim();
  const evalMatch = text.match(/^eval\(\s*([\s\S]*)\s*\)\s*;?$/);
  if (!evalMatch) {
    throw new Error("not a wrapped eval(...) call");
  }

  let inner = evalMatch[1].trim();
  const atobMatch = inner.match(/^atob\(\s*([\s\S]*)\s*\)$/);
  if (atobMatch) {
    inner = atobMatch[1].trim();
  }

  return stripQuotes(inner);
}

function stripQuotes(text) {
  if (text.length < 2) {
    return text;
  }
  const first = text[0];
  const last = text[text.length - 1];
  const isQuoted = (first === '"' || first === "'" || first === "`") && first === last;
  return isQuoted ? text.slice(1, -1) : text;
}

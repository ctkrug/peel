/**
 * Unwraps a textual `eval("...")` or `eval(atob("..."))` call to its inner
 * argument. This is a syntactic unwrap only — it never executes code — so an
 * `eval(atob("..."))` puzzle still needs a following `base64-decode` move to
 * reveal the plaintext, same as any other chained encoding.
 */
export function evalUnwrap(input) {
  const text = input.trim();
  const evalArg = matchCall(text, "eval");
  if (evalArg === null) {
    throw new Error("not a wrapped eval(...) call");
  }

  const atobArg = matchCall(evalArg.trim(), "atob");
  const inner = atobArg === null ? evalArg.trim() : atobArg.trim();

  return stripQuotes(inner);
}

/**
 * If `text` is exactly `name(...)`, optionally followed by a trailing `;`
 * and/or whitespace, returns the raw argument text; otherwise null. Tracks
 * paren depth and quote state so nested calls/parens inside string literals
 * don't confuse the match, and rejects trailing content after the call's own
 * closing paren instead of greedily swallowing it (e.g. `eval("a") + eval("b")`
 * is not a single wrapped call and must be rejected, not mangled).
 */
function matchCall(text, name) {
  const prefix = `${name}(`;
  if (!text.startsWith(prefix)) {
    return null;
  }

  let depth = 1;
  let quote = null;
  for (let i = prefix.length; i < text.length; i++) {
    const char = text[i];
    if (quote) {
      if (char === "\\") {
        i++;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
    } else if (char === "(") {
      depth++;
    } else if (char === ")") {
      depth--;
      if (depth === 0) {
        const rest = text.slice(i + 1).trim();
        return rest === "" || rest === ";" ? text.slice(prefix.length, i) : null;
      }
    }
  }

  return null;
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

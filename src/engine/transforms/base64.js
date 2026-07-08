/**
 * Base64 encode/decode, implemented without relying on Node-only Buffer so the
 * same code runs unmodified in the browser and in tests.
 */

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

export function base64Encode(input) {
  const bytes = new TextEncoder().encode(input);
  let output = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : undefined;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : undefined;

    output += ALPHABET[b0 >> 2];
    output += ALPHABET[((b0 & 0x03) << 4) | (b1 === undefined ? 0 : b1 >> 4)];
    output += b1 === undefined ? "=" : ALPHABET[((b1 & 0x0f) << 2) | (b2 === undefined ? 0 : b2 >> 6)];
    output += b2 === undefined ? "=" : ALPHABET[b2 & 0x3f];
  }
  return output;
}

export function base64Decode(input) {
  const clean = input.trim().replace(/=+$/, "");
  if (!/^[A-Za-z0-9+/]*$/.test(clean)) {
    throw new Error("not valid base64");
  }

  const bytes = [];
  let buffer = 0;
  let bitsCollected = 0;
  for (const char of clean) {
    buffer = (buffer << 6) | ALPHABET.indexOf(char);
    bitsCollected += 6;
    if (bitsCollected >= 8) {
      bitsCollected -= 8;
      bytes.push((buffer >> bitsCollected) & 0xff);
    }
  }
  return new TextDecoder().decode(Uint8Array.from(bytes));
}

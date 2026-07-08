export function hexEncode(input) {
  const bytes = new TextEncoder().encode(input);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function hexDecode(input) {
  const clean = input.trim().replace(/\s+/g, "");
  if (!/^([0-9a-fA-F]{2})+$/.test(clean)) {
    throw new Error("not valid hex");
  }

  const bytes = clean.match(/.{2}/g).map((pair) => parseInt(pair, 16));
  return new TextDecoder().decode(Uint8Array.from(bytes));
}

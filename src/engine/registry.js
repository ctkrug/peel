import { base64Encode, base64Decode } from "./transforms/base64.js";
import { rot13 } from "./transforms/rot13.js";
import { hexEncode, hexDecode } from "./transforms/hex.js";
import { urlEncode, urlDecode } from "./transforms/urlEncoding.js";
import { reverseString } from "./transforms/reverse.js";

export const OPERATIONS = {
  "base64-encode": { label: "Base64 encode", apply: base64Encode },
  "base64-decode": { label: "Base64 decode", apply: base64Decode },
  "rot13": { label: "ROT13", apply: rot13 },
  "hex-encode": { label: "Hex encode", apply: hexEncode },
  "hex-decode": { label: "Hex decode", apply: hexDecode },
  "url-encode": { label: "URL encode", apply: urlEncode },
  "url-decode": { label: "URL decode", apply: urlDecode },
  "reverse": { label: "Reverse", apply: reverseString },
};

export function listOperations() {
  return Object.keys(OPERATIONS);
}

export function applyOperation(operationId, input) {
  const operation = OPERATIONS[operationId];
  if (!operation) {
    throw new Error(`unknown operation: ${operationId}`);
  }
  return operation.apply(input);
}

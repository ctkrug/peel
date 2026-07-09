import { describe, expect, it } from "vitest";
import { describeMove } from "../historyView.js";

const OPERATIONS = {
  "base64-decode": { label: "Base64 decode" },
  "hex-decode": { label: "Hex decode" },
};

describe("describeMove", () => {
  it("describes a successful on-path move", () => {
    const move = { operationId: "base64-decode", ok: true, onPath: true, text: "hello" };
    expect(describeMove(move, OPERATIONS)).toEqual({
      label: "Base64 decode",
      status: "on-path",
      detail: "hello",
    });
  });

  it("describes a successful decoy move", () => {
    const move = { operationId: "base64-decode", ok: true, onPath: false, text: "gibberish" };
    expect(describeMove(move, OPERATIONS).status).toBe("decoy");
  });

  it("describes a failed move with its error, not a text preview", () => {
    const move = { operationId: "hex-decode", ok: false, onPath: false, error: "invalid hex" };
    const described = describeMove(move, OPERATIONS);
    expect(described.status).toBe("failed");
    expect(described.detail).toBe("invalid hex");
  });

  it("truncates long previews", () => {
    const longText = "x".repeat(80);
    const move = { operationId: "base64-decode", ok: true, onPath: true, text: longText };
    const described = describeMove(move, OPERATIONS);
    expect(described.detail).toHaveLength(41);
    expect(described.detail.endsWith("…")).toBe(true);
  });

  it("leaves a preview at exactly the truncation boundary untouched", () => {
    const exactText = "x".repeat(40);
    const move = { operationId: "base64-decode", ok: true, onPath: true, text: exactText };
    expect(describeMove(move, OPERATIONS).detail).toBe(exactText);
  });

  it("falls back to the raw operation id if unknown", () => {
    const move = { operationId: "mystery-op", ok: true, onPath: false, text: "x" };
    expect(describeMove(move, OPERATIONS).label).toBe("mystery-op");
  });
});

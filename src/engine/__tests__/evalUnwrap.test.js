import { describe, expect, it } from "vitest";
import { evalUnwrap } from "../transforms/evalUnwrap.js";

describe("evalUnwrap", () => {
  it("unwraps a quoted eval(...) call", () => {
    expect(evalUnwrap('eval("echo hi")')).toBe("echo hi");
  });

  it("unwraps a nested eval(atob(...)) call to atob's own argument", () => {
    expect(evalUnwrap('eval(atob("cGVlbA=="))')).toBe("cGVlbA==");
  });

  it("tolerates surrounding whitespace and a trailing semicolon", () => {
    expect(evalUnwrap('  eval("hi");  ')).toBe("hi");
  });

  it("rejects text that isn't a wrapped eval(...) call", () => {
    expect(() => evalUnwrap("echo hi")).toThrow();
  });

  it("rejects an atob(...) call not wrapped in eval(...)", () => {
    expect(() => evalUnwrap('atob("cGVlbA==")')).toThrow();
  });

  it("rejects trailing content after the call's own closing paren", () => {
    expect(() => evalUnwrap('eval("a") + eval("b")')).toThrow();
  });

  it("rejects an eval(...) call with a missing closing paren", () => {
    expect(() => evalUnwrap('eval("hi"')).toThrow();
  });

  it("tracks an escaped quote inside the string literal instead of ending it early", () => {
    expect(evalUnwrap('eval("say \\"hi\\"")')).toBe('say \\"hi\\"');
  });

  it("returns a too-short argument unchanged instead of stripping quotes", () => {
    expect(evalUnwrap("eval(5)")).toBe("5");
  });
});

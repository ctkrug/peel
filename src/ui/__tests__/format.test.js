import { describe, expect, it } from "vitest";
import { formatElapsed } from "../format.js";

describe("formatElapsed", () => {
  it("formats zero as 0:00", () => {
    expect(formatElapsed(0)).toBe("0:00");
  });

  it("pads seconds under ten", () => {
    expect(formatElapsed(5000)).toBe("0:05");
  });

  it("rolls over into minutes", () => {
    expect(formatElapsed(65000)).toBe("1:05");
  });

  it("truncates partial seconds rather than rounding", () => {
    expect(formatElapsed(59999)).toBe("0:59");
  });

  it("does not pad the minutes component", () => {
    expect(formatElapsed(600000)).toBe("10:00");
  });
});

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createSfx } from "../sfx.js";

function fakeStorage() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, value),
  };
}

class FakeAudioContext {
  static instances = [];

  constructor() {
    this.currentTime = 0;
    this.sampleRate = 44100;
    this.destination = {};
    this.created = [];
    FakeAudioContext.instances.push(this);
  }

  createOscillator() {
    this.created.push("oscillator");
    return {
      frequency: { value: 0 },
      type: "sine",
      connect() {},
      start() {},
      stop() {},
    };
  }

  createGain() {
    this.created.push("gain");
    return {
      gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
      connect() {},
    };
  }

  createBiquadFilter() {
    this.created.push("filter");
    return { frequency: { value: 0 }, type: "lowpass", connect() {} };
  }

  createBuffer(channels, length) {
    return { getChannelData: () => new Float32Array(length) };
  }

  createBufferSource() {
    this.created.push("bufferSource");
    return { buffer: null, connect() {}, start() {} };
  }
}

describe("createSfx", () => {
  let originalAudioContext;

  beforeEach(() => {
    originalAudioContext = globalThis.AudioContext;
    globalThis.AudioContext = FakeAudioContext;
    FakeAudioContext.instances = [];
  });

  afterEach(() => {
    globalThis.AudioContext = originalAudioContext;
  });

  it("does not throw when AudioContext is unavailable", () => {
    delete globalThis.AudioContext;
    const sfx = createSfx(fakeStorage());
    expect(() => sfx.moveSuccess()).not.toThrow();
    expect(() => sfx.moveFail()).not.toThrow();
    expect(() => sfx.win()).not.toThrow();
    expect(() => sfx.hover()).not.toThrow();
  });

  it("plays two oscillator tones for moveSuccess", () => {
    const sfx = createSfx(fakeStorage());
    sfx.moveSuccess();
    const created = FakeAudioContext.instances[0].created;
    expect(created.filter((n) => n === "oscillator")).toHaveLength(2);
  });

  it("plays a filtered tone for moveFail", () => {
    const sfx = createSfx(fakeStorage());
    sfx.moveFail();
    const created = FakeAudioContext.instances[0].created;
    expect(created).toContain("oscillator");
    expect(created).toContain("filter");
  });

  it("plays a four-note arpeggio for win", () => {
    const sfx = createSfx(fakeStorage());
    sfx.win();
    const created = FakeAudioContext.instances[0].created;
    expect(created.filter((n) => n === "oscillator")).toHaveLength(4);
  });

  it("suppresses all playback while muted", () => {
    const storage = fakeStorage();
    const sfx = createSfx(storage);
    sfx.setMuted(true);
    sfx.moveSuccess();
    expect(FakeAudioContext.instances).toHaveLength(0);
  });

  it("throttles rapid hover calls", () => {
    const sfx = createSfx(fakeStorage());
    sfx.hover();
    sfx.hover();
    const created = FakeAudioContext.instances[0].created;
    expect(created.filter((n) => n === "bufferSource")).toHaveLength(1);
  });

  it("suppresses hover playback while muted", () => {
    const sfx = createSfx(fakeStorage());
    sfx.setMuted(true);
    sfx.hover();
    expect(FakeAudioContext.instances).toHaveLength(0);
  });
});

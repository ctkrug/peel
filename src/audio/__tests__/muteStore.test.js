import { describe, expect, it } from "vitest";
import { createMuteStore } from "../muteStore.js";

function fakeStorage() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, value),
  };
}

describe("createMuteStore", () => {
  it("defaults to unmuted when nothing is stored", () => {
    const store = createMuteStore(fakeStorage());
    expect(store.isMuted()).toBe(false);
  });

  it("persists a muted flag across reads", () => {
    const store = createMuteStore(fakeStorage());
    store.setMuted(true);
    expect(store.isMuted()).toBe(true);
  });

  it("can be unmuted again after being muted", () => {
    const store = createMuteStore(fakeStorage());
    store.setMuted(true);
    store.setMuted(false);
    expect(store.isMuted()).toBe(false);
  });

  it("uses independent storage instances independently", () => {
    const a = createMuteStore(fakeStorage());
    const b = createMuteStore(fakeStorage());
    a.setMuted(true);
    expect(b.isMuted()).toBe(false);
  });
});

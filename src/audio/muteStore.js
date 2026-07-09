const STORAGE_KEY = "peel:muted";

/**
 * Wraps a Storage-like object (localStorage in the app, an in-memory fake in
 * tests) so mute state persists across reloads without the audio layer
 * knowing about the storage mechanism.
 */
export function createMuteStore(storage) {
  return {
    isMuted() {
      return storage.getItem(STORAGE_KEY) === "true";
    },
    setMuted(muted) {
      storage.setItem(STORAGE_KEY, muted ? "true" : "false");
    },
  };
}

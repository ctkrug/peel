import { createMuteStore } from "./muteStore.js";

const WIN_ARPEGGIO_HZ = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
const HOVER_THROTTLE_MS = 60;

/**
 * Lazily-created WebAudio synth SFX. The AudioContext is only constructed on
 * the first `play*` call, which only ever happens from a user gesture
 * (button hover/click), satisfying the autoplay-policy requirement.
 */
export function createSfx(storage) {
  const muteStore = createMuteStore(storage);
  let ctx = null;
  let lastHoverAt = 0;

  function getContext() {
    if (ctx) {
      return ctx;
    }
    if (typeof AudioContext === "undefined") {
      return null;
    }
    ctx = new AudioContext();
    return ctx;
  }

  function playTone({
    frequency,
    type = "sine",
    duration = 0.09,
    gain = 0.05,
    startDelay = 0,
    lowpassHz = null,
  }) {
    if (muteStore.isMuted()) {
      return;
    }
    const audioCtx = getContext();
    if (!audioCtx) {
      return;
    }

    const startAt = audioCtx.currentTime + startDelay;
    const osc = audioCtx.createOscillator();
    osc.type = type;
    osc.frequency.value = frequency;

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(gain, startAt);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startAt + duration);

    if (lowpassHz) {
      const filter = audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = lowpassHz;
      osc.connect(filter);
      filter.connect(gainNode);
    } else {
      osc.connect(gainNode);
    }

    gainNode.connect(audioCtx.destination);
    osc.start(startAt);
    osc.stop(startAt + duration);
  }

  function playNoise({ duration = 0.015, gain = 0.03, filterHz = 4000 }) {
    if (muteStore.isMuted()) {
      return;
    }
    const audioCtx = getContext();
    if (!audioCtx) {
      return;
    }

    const bufferSize = Math.max(1, Math.floor(audioCtx.sampleRate * duration));
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = filterHz;

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(gain, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    source.start();
  }

  return {
    isMuted: muteStore.isMuted,
    setMuted: muteStore.setMuted,

    hover() {
      const now = Date.now();
      if (now - lastHoverAt < HOVER_THROTTLE_MS) {
        return;
      }
      lastHoverAt = now;
      playNoise({ duration: 0.015, gain: 0.025, filterHz: 6000 });
    },

    moveSuccess() {
      playTone({ frequency: 523.25, type: "square", duration: 0.05, gain: 0.05 });
      playTone({ frequency: 783.99, type: "square", duration: 0.05, gain: 0.05, startDelay: 0.05 });
    },

    moveFail() {
      playTone({ frequency: 110, type: "sawtooth", duration: 0.14, gain: 0.06, lowpassHz: 400 });
    },

    win() {
      WIN_ARPEGGIO_HZ.forEach((frequency, i) => {
        playTone({ frequency, type: "sine", duration: 0.16, gain: 0.05, startDelay: i * 0.09 });
      });
    },
  };
}

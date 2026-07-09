import { randomGlyphs } from "./glitchText.js";
import { computeWrappedLines } from "./wrapText.js";

const BG = "#101714";
const TEXT = "#d9f5e3";
const ACCENT = "#4ef29c";
const CROSSFADE_MS = 120;
const STATIC_FRAME_START = 0.45;
const STATIC_FRAME_END = 0.6;

export function createRenderer(canvas) {
  const ctx = canvas.getContext("2d");
  let displayedText = "";
  let animationHandle = null;

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function drawFrame(text) {
    const { width, height } = canvas.getBoundingClientRect();
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = TEXT;
    ctx.font = "16px 'IBM Plex Mono', ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    wrapText(ctx, text, width / 2, height / 2, width - 48, 24);

    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);
  }

  function cancelAnimation() {
    if (animationHandle !== null) {
      cancelAnimationFrame(animationHandle);
      animationHandle = null;
    }
  }

  function render(text) {
    cancelAnimation();
    displayedText = text;
    drawFrame(text);
  }

  /** Crossfades to `text` over 120ms with a one-frame static flicker mid-transition. */
  function transitionTo(text, reduceMotion = false) {
    if (reduceMotion) {
      render(text);
      return;
    }

    cancelAnimation();
    const start = performance.now();
    const glyphLength = Math.max(displayedText.length, text.length, 8);

    function step(now) {
      const progress = Math.min((now - start) / CROSSFADE_MS, 1);
      if (progress >= STATIC_FRAME_START && progress < STATIC_FRAME_END) {
        drawFrame(randomGlyphs(glyphLength));
      } else if (progress < STATIC_FRAME_START) {
        drawFrame(displayedText);
      } else {
        drawFrame(text);
      }

      if (progress < 1) {
        animationHandle = requestAnimationFrame(step);
      } else {
        displayedText = text;
        animationHandle = null;
      }
    }

    animationHandle = requestAnimationFrame(step);
  }

  function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const lines = computeWrappedLines(text, maxWidth, (line) => context.measureText(line).width);
    const startY = y - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, i) => context.fillText(line, x, startY + i * lineHeight));
  }

  resize();
  return { resize, render, transitionTo };
}

const BG = "#101714";
const TEXT = "#d9f5e3";
const ACCENT = "#4ef29c";

export function createRenderer(canvas) {
  const ctx = canvas.getContext("2d");

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function render(text) {
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

  function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    const lines = [];
    let line = "";

    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (context.measureText(candidate).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    lines.push(line);

    const startY = y - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((text, i) => context.fillText(text, x, startY + i * lineHeight));
  }

  resize();
  return { resize, render };
}

// Confetti burst on a canvas. Self-contained, cancels itself when done.
export function burstConfetti(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const W = window.innerWidth;
  const H = window.innerHeight;
  const colors = ["#5fd0ff", "#3d8bff", "#36d399", "#a78bfa", "#ffd166", "#ff7ab6"];
  const pieces = Array.from({ length: 140 }, () => ({
    x: W / 2,
    y: H / 3,
    r: 4 + Math.random() * 6,
    color: colors[(Math.random() * colors.length) | 0],
    vx: (Math.random() - 0.5) * 14,
    vy: -6 - Math.random() * 10,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
    shape: Math.random() > 0.5 ? "rect" : "circle",
  }));

  let frame = 0;
  let raf;
  const gravity = 0.32;

  function tick() {
    ctx.clearRect(0, 0, W, H);
    frame++;
    pieces.forEach((p) => {
      p.vy += gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.99;
      p.rot += p.vr;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - frame / 120);
      if (p.shape === "rect") {
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.r / 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    if (frame < 120) {
      raf = requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, W, H);
      cancelAnimationFrame(raf);
    }
  }
  tick();
}

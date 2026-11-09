/* Starfield: three parallax layers on one canvas, cheap and quiet. */
(() => {
  const canvas = document.getElementById("sky");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const layers = [
    { speed: 0.012, size: 1, alpha: 0.45 },
    { speed: 0.032, size: 1.4, alpha: 0.7 },
    { speed: 0.07, size: 2, alpha: 1 },
  ];
  let stars = [], w = 0, h = 0, raf = 0, last = 0;

  function build() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.max(90, Math.round((w * h) / 11000));
    stars = Array.from({ length: count }, (_, i) => {
      const L = layers[i % layers.length];
      return { x: Math.random() * w, y: Math.random() * h, L, tw: Math.random() * Math.PI * 2 };
    });
    paint(0);
  }

  function paint(dt) {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      if (!reduce) {
        s.y += s.L.speed * dt;
        if (s.y > h + 4) { s.y = -4; s.x = Math.random() * w; }
      }
      const twinkle = reduce ? 1 : 0.75 + 0.25 * Math.sin(s.tw + performance.now() / 2400);
      ctx.globalAlpha = s.L.alpha * twinkle;
      ctx.fillStyle = "#eef2ff";
      ctx.fillRect(Math.round(s.x), Math.round(s.y), s.L.size, s.L.size);
    }
    ctx.globalAlpha = 1;
  }

  function loop(t) {
    const dt = last ? Math.min(64, t - last) : 16;
    last = t;
    paint(dt);
    raf = requestAnimationFrame(loop);
  }

  function start() { if (!raf && !reduce) { last = 0; raf = requestAnimationFrame(loop); } }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  let resizeTimer = 0;
  addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 150);
  }, { passive: true });
  document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());

  build();
  start();
})();

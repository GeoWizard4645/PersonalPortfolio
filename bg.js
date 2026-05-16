/* Background canvas — three modes: 'grid', 'noise', 'mesh'.
   Drives a tiny rAF loop. The Tweaks panel toggles `data-bg-mode` on <body>. */
(() => {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let dpr = Math.min(2, window.devicePixelRatio || 1);
  let W = 0, H = 0;
  let mode = document.body.getAttribute("data-bg-mode") || "grid";
  let mx = 0, my = 0, tmx = 0, tmy = 0;
  let t = 0;

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  window.addEventListener("pointermove", (e) => {
    tmx = e.clientX; tmy = e.clientY;
  });

  // observer for mode changes from tweaks
  new MutationObserver(() => {
    mode = document.body.getAttribute("data-bg-mode") || "grid";
  }).observe(document.body, { attributes: true, attributeFilter: ["data-bg-mode"] });

  function drawGrid() {
    const cell = 56;
    const offX = (W / 2) % cell;
    const offY = (H / 2) % cell;
    ctx.strokeStyle = "rgba(255,255,255,0.045)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = offX; x < W; x += cell) {
      ctx.moveTo(x, 0); ctx.lineTo(x, H);
    }
    for (let y = offY; y < H; y += cell) {
      ctx.moveTo(0, y); ctx.lineTo(W, y);
    }
    ctx.stroke();

    // cursor halo highlight
    const radius = 220;
    const grd = ctx.createRadialGradient(mx, my, 0, mx, my, radius);
    grd.addColorStop(0, "rgba(125,211,252,0.10)");
    grd.addColorStop(1, "rgba(125,211,252,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    // accent dot at cursor intersection
    const gx = Math.round((mx - offX) / cell) * cell + offX;
    const gy = Math.round((my - offY) / cell) * cell + offY;
    ctx.fillStyle = "rgba(125,211,252,0.7)";
    ctx.beginPath();
    ctx.arc(gx, gy, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawMesh() {
    // soft moving plasma blobs
    const blobs = [
      { x: W*0.2, y: H*0.3, r: 320, hue: 130 },
      { x: W*0.8, y: H*0.7, r: 360, hue: 200 },
      { x: W*0.5 + Math.sin(t*0.0003)*150, y: H*0.5 + Math.cos(t*0.00025)*120, r: 280, hue: 280 },
    ];
    for (const b of blobs) {
      const grd = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      grd.addColorStop(0, `oklch(0.5 0.16 ${b.hue} / 0.18)`);
      grd.addColorStop(1, `oklch(0.5 0.16 ${b.hue} / 0)`);
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
    }
  }

  function drawNoise() {
    // sparse moving stars
    const n = 90;
    for (let i = 0; i < n; i++) {
      const seed = i * 13.37;
      const x = (Math.sin(seed) * 0.5 + 0.5) * W;
      const y = ((Math.cos(seed * 1.7) * 0.5 + 0.5) * H + t * 0.04 * (1 + (i % 5))) % H;
      const a = (Math.sin(t * 0.002 + seed) * 0.5 + 0.5) * 0.6 + 0.1;
      ctx.fillStyle = `rgba(125,211,252,${a * 0.5})`;
      ctx.fillRect(x, y, 1.4, 1.4);
    }
    // big diagonal scanlines
    ctx.strokeStyle = "rgba(255,255,255,0.025)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      const x = (i * 120 + t * 0.05) % (W + 200) - 100;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + H * 0.4, H);
      ctx.stroke();
    }
  }

  let last = performance.now();
  function loop(now) {
    const dt = now - last; last = now; t += dt;
    mx += (tmx - mx) * 0.08;
    my += (tmy - my) * 0.08;
    ctx.clearRect(0, 0, W, H);
    if (mode === "mesh") drawMesh();
    else if (mode === "noise") drawNoise();
    else drawGrid();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

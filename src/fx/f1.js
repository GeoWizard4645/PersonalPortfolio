/* ============================================================
   F1 car. v4: aerial view, scroll-scrubbed, drives UNDER the page.

   Top-down F1 car racing DOWN the page; scroll is the throttle.
   The canvas sits BEHIND the content (above the background wash,
   below text and cards), so the car weaves along the ground
   layer and slides beneath text blocks and cards like they're
   bridges over the track. No collision logic needed: the
   layering guarantees it never covers a single word.

   Cursor: get close (where it's visible) and it darts ahead
   down the track, then drifts back to where your scroll says
   it should be.

   Efficiency contract:
   - Car rasterized ONCE into an offscreen sprite; per frame one
     drawImage + shadow + a few trail segments.
   - No DOM reads in the frame loop (only scrollY).
   - Parked + trail faded -> no repaint at all.
   - DPR capped at 1.5; fixed-size ring buffers; no allocation
     inside the frame loop.

   Desktop only; skipped for reduced-motion users.
   ============================================================ */

/* Racing line: [pageProgress 0..1, xFrac, yFrac of viewport].
   The weaving v2 line: sweeps down and across the page. */
const PATH = [
  [0.00, 0.90, -0.15],
  [0.05, 0.82, 0.18],
  [0.11, 0.55, 0.52],
  [0.17, 0.24, 0.34],
  [0.24, 0.14, 0.66],
  [0.32, 0.44, 0.48],
  [0.41, 0.80, 0.62],
  [0.50, 0.66, 0.28],
  [0.58, 0.32, 0.58],
  [0.66, 0.18, 0.40],
  [0.75, 0.56, 0.68],
  [0.84, 0.80, 0.44],
  [0.92, 0.62, 0.58],
  [1.00, 0.48, 0.80],   // parks bottom-center on the contact screen
];

const SPOOK_DIST = 80;

function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

function samplePath(s) {
  const n = PATH.length;
  let i = 0;
  while (i < n - 2 && s > PATH[i + 1][0]) i++;
  const a = PATH[i], b = PATH[i + 1];
  const t = Math.max(0, Math.min(1, (s - a[0]) / Math.max(0.0001, b[0] - a[0])));
  const p0 = PATH[Math.max(0, i - 1)], p3 = PATH[Math.min(n - 1, i + 2)];
  return {
    x: catmullRom(p0[1], a[1], b[1], p3[1], t),
    y: catmullRom(p0[2], a[2], b[2], p3[2], t),
  };
}

export function initF1() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.matchMedia("(max-width: 760px)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.className = "f1-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  let dpr = Math.min(1.5, window.devicePixelRatio || 1);
  let W = 0, H = 0;

  /* ---------- sprite: top-down F1 car, nose up, origin center ---------- */

  const SW = 66, SH = 132;
  let carSprite;

  function makeSprite() {
    carSprite = document.createElement("canvas");
    carSprite.width = SW * 2 * dpr;
    carSprite.height = SH * 2 * dpr;
    const c = carSprite.getContext("2d");
    c.setTransform(2 * dpr, 0, 0, 2 * dpr, 0, 0);
    c.translate(SW / 2, SH / 2);
    c.lineJoin = "round";

    const CARBON = "#14181e";
    const CARBON_HI = "#232a33";
    const ACCENT = "#7dd3fc";
    const ACCENT_DK = "#2b7ba3";

    // floor plan (widest silhouette)
    c.fillStyle = "#0b0e12";
    c.beginPath();
    c.moveTo(-8, -50);
    c.quadraticCurveTo(-17, -28, -17, -6);
    c.lineTo(-16, 30);
    c.quadraticCurveTo(-15, 44, -12, 50);
    c.lineTo(12, 50);
    c.quadraticCurveTo(15, 44, 16, 30);
    c.lineTo(17, -6);
    c.quadraticCurveTo(17, -28, 8, -50);
    c.closePath();
    c.fill();

    // front wing
    c.fillStyle = CARBON;
    c.fillRect(-27, -62, 54, 9);
    c.strokeStyle = CARBON_HI;
    c.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      c.beginPath();
      c.moveTo(-25, -60.5 + i * 2.6);
      c.quadraticCurveTo(0, -62.5 + i * 2.6, 25, -60.5 + i * 2.6);
      c.stroke();
    }
    c.fillStyle = ACCENT_DK;
    c.fillRect(-28.5, -63, 2.4, 11);
    c.fillRect(26.1, -63, 2.4, 11);

    // suspension arms
    c.strokeStyle = "#2c343e";
    c.lineWidth = 1.6;
    [[-9, -40, -20, -37], [-9, -34, -20, -35], [9, -40, 20, -37], [9, -34, 20, -35],
     [-11, 34, -19, 37], [-11, 42, -19, 40], [11, 34, 19, 37], [11, 42, 19, 40]]
      .forEach(([ax, ay, bx, by]) => {
        c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
      });

    // wheels
    function wheel(x, y, w, h) {
      const rr = 2.5;
      c.fillStyle = "#08090b";
      c.beginPath();
      c.roundRect(x - w / 2, y - h / 2, w, h, rr);
      c.fill();
      const sheen = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
      sheen.addColorStop(0, "rgba(255,255,255,0.16)");
      sheen.addColorStop(0.5, "rgba(255,255,255,0.02)");
      sheen.addColorStop(1, "rgba(255,255,255,0.12)");
      c.fillStyle = sheen;
      c.beginPath();
      c.roundRect(x - w / 2, y - h / 2, w, h, rr);
      c.fill();
      c.strokeStyle = "rgba(255,255,255,0.1)";
      c.lineWidth = 0.8;
      c.beginPath();
      c.moveTo(x - w / 2 + 1.5, y); c.lineTo(x + w / 2 - 1.5, y);
      c.stroke();
    }
    wheel(-22, -37, 9, 15);
    wheel(22, -37, 9, 15);
    wheel(-21, 38, 10.5, 17);
    wheel(21, 38, 10.5, 17);

    // body
    const body = c.createLinearGradient(-16, 0, 16, 0);
    body.addColorStop(0, "#1c232c");
    body.addColorStop(0.35, "#39434f");
    body.addColorStop(0.5, "#46525f");
    body.addColorStop(0.65, "#39434f");
    body.addColorStop(1, "#161c24");
    c.fillStyle = body;
    c.beginPath();
    c.moveTo(-2.6, -58);
    c.lineTo(2.6, -58);
    c.quadraticCurveTo(6, -40, 8, -26);
    c.quadraticCurveTo(14, -18, 15, -4);
    c.lineTo(14, 18);
    c.quadraticCurveTo(12, 30, 9, 40);
    c.lineTo(9, 46);
    c.lineTo(-9, 46);
    c.lineTo(-9, 40);
    c.quadraticCurveTo(-12, 30, -14, 18);
    c.lineTo(-15, -4);
    c.quadraticCurveTo(-14, -18, -8, -26);
    c.quadraticCurveTo(-6, -40, -2.6, -58);
    c.closePath();
    c.fill();

    // sidepod inlets
    c.fillStyle = "#0a0d11";
    c.beginPath();
    c.moveTo(-14.5, -8); c.lineTo(-8, -10); c.lineTo(-8, -4); c.lineTo(-14.8, -1);
    c.closePath(); c.fill();
    c.beginPath();
    c.moveTo(14.5, -8); c.lineTo(8, -10); c.lineTo(8, -4); c.lineTo(14.8, -1);
    c.closePath(); c.fill();

    // accent nose stripe + engine-cover spine
    c.fillStyle = ACCENT;
    c.beginPath();
    c.moveTo(-1.6, -57); c.lineTo(1.6, -57);
    c.lineTo(2.6, -30); c.lineTo(-2.6, -30);
    c.closePath();
    c.fill();
    const spine = c.createLinearGradient(0, 2, 0, 44);
    spine.addColorStop(0, ACCENT);
    spine.addColorStop(1, ACCENT_DK);
    c.fillStyle = spine;
    c.fillRect(-1.4, 2, 2.8, 42);

    c.strokeStyle = "rgba(125,211,252,0.5)";
    c.lineWidth = 1;
    c.beginPath(); c.moveTo(0, 14); c.lineTo(0, 44); c.stroke();

    // cockpit + halo + helmet
    c.fillStyle = "#05070a";
    c.beginPath();
    c.ellipse(0, -12, 5.2, 9.5, 0, 0, Math.PI * 2);
    c.fill();
    const helmet = c.createRadialGradient(-1.4, -14.4, 0.6, 0, -13, 4);
    helmet.addColorStop(0, "#f2f6fa");
    helmet.addColorStop(0.55, "#9fb6c9");
    helmet.addColorStop(1, "#3c4d5c");
    c.fillStyle = helmet;
    c.beginPath(); c.arc(0, -13, 3.6, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "#525f6d";
    c.lineWidth = 2.2;
    c.beginPath();
    c.ellipse(0, -11.5, 7.6, 11, 0, 0, Math.PI * 2);
    c.stroke();
    c.lineWidth = 1.8;
    c.beginPath(); c.moveTo(0, -22.5); c.lineTo(0, -18); c.stroke();

    // airbox
    c.fillStyle = "#0a0d11";
    c.beginPath();
    c.ellipse(0, 1, 3.4, 2.6, 0, 0, Math.PI * 2);
    c.fill();

    // rear wing
    c.fillStyle = CARBON;
    c.fillRect(-24, 48, 48, 9);
    c.strokeStyle = CARBON_HI;
    c.lineWidth = 1.1;
    c.beginPath(); c.moveTo(-22, 51.4); c.lineTo(22, 51.4); c.stroke();
    c.strokeStyle = "rgba(125,211,252,0.55)";
    c.beginPath(); c.moveTo(-22, 54.6); c.lineTo(22, 54.6); c.stroke();
    c.fillStyle = ACCENT_DK;
    c.fillRect(-25.7, 46.5, 2.6, 12);
    c.fillRect(23.1, 46.5, 2.6, 12);

    // specular streak
    c.strokeStyle = "rgba(255,255,255,0.20)";
    c.lineWidth = 2.4;
    c.beginPath();
    c.moveTo(-4.5, -50);
    c.quadraticCurveTo(-10, -20, -10, 8);
    c.quadraticCurveTo(-9, 28, -6, 42);
    c.stroke();
  }

  function resize() {
    dpr = Math.min(1.5, window.devicePixelRatio || 1);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makeSprite();
  }

  /* ---------- input ---------- */

  let mx = -9999, my = -9999;
  window.addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; });
  window.addEventListener("resize", resize);

  /* ---------- state ---------- */

  let x = 0, y = -200;
  let ang = Math.PI / 2;
  let sBoost = 0, vBoost = 0;
  let last = performance.now();
  let idleFrames = 0;

  const TRAIL = 26;
  const trail = Array.from({ length: TRAIL }, () => ({ a: 0, x: 0, y: 0, ang: 0 }));
  let trailIdx = 0;

  function scrollProgress() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    if (max <= 0) return 0;
    return Math.max(0, Math.min(1, window.scrollY / max));
  }

  function shortestArc(from, to) {
    let d = (to - from) % (Math.PI * 2);
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    return d;
  }

  function loop(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;

    const s0 = scrollProgress();

    // cursor spook: dart ahead down the track, then drift back
    const ddx = mx - x, ddy = my - y;
    if (ddx * ddx + ddy * ddy < SPOOK_DIST * SPOOK_DIST && vBoost < 0.02) {
      vBoost = 0.14;
    }
    sBoost += vBoost * dt;
    vBoost *= Math.exp(-2.4 * dt);
    sBoost *= Math.exp(-1.1 * dt);

    const s = Math.max(0, Math.min(1, s0 + sBoost));
    const target = samplePath(s);
    const tx = target.x * W, ty = target.y * H;

    const px = x, py = y;
    x += (tx - x) * Math.min(1, 9 * dt);
    y += (ty - y) * Math.min(1, 9 * dt);
    const vx = x - px, vy = y - py;
    const speed = Math.hypot(vx, vy);

    // heading: steer along the path tangent while moving; hold when parked
    if (speed > 0.35) {
      const t2 = samplePath(Math.min(1, s + 0.004));
      const t1 = samplePath(Math.max(0, s - 0.004));
      const desired = Math.atan2(t2.y * H - t1.y * H, t2.x * W - t1.x * W);
      ang += shortestArc(ang, desired) * Math.min(1, 8 * dt);
      idleFrames = 0;
    } else {
      idleFrames++;
    }

    // parked and trail faded -> freeze the canvas as-is
    let trailAlive = false;
    for (let i = 0; i < TRAIL; i++) if (trail[i].a > 0.01) { trailAlive = true; break; }
    if (idleFrames > 30 && !trailAlive) {
      requestAnimationFrame(loop);
      return;
    }

    // stamp tire marks while moving briskly
    if (speed > 2.2) {
      const t = trail[trailIdx];
      trailIdx = (trailIdx + 1) % TRAIL;
      t.a = Math.min(0.45, 0.1 + speed * 0.018 + (vBoost > 0.02 ? 0.18 : 0));
      t.x = x; t.y = y; t.ang = ang;
    }

    /* ---------- draw ---------- */
    ctx.clearRect(0, 0, W, H);

    // tire marks: light rubber on the dark ground layer
    for (let i = 0; i < TRAIL; i++) {
      const t = trail[i];
      if (t.a <= 0.01) continue;
      t.a *= 0.955;
      const c = Math.cos(t.ang), sn = Math.sin(t.ang);
      const ox = -sn * 11, oy = c * 11;
      const lx = c * 6, ly = sn * 6;
      ctx.strokeStyle = `rgba(150,180,205,${(t.a * 0.55).toFixed(3)})`;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(t.x + ox - lx, t.y + oy - ly);
      ctx.lineTo(t.x + ox + lx, t.y + oy + ly);
      ctx.moveTo(t.x - ox - lx, t.y - oy - ly);
      ctx.lineTo(t.x - ox + lx, t.y - oy + ly);
      ctx.stroke();
    }

    // ~25% smaller than before; ground-layer scale
    const scale = Math.max(0.58, Math.min(0.82, (W / 1500) * 0.75));

    // drop shadow
    ctx.save();
    ctx.translate(x + 4, y + 6);
    ctx.rotate(ang + Math.PI / 2);
    ctx.scale(scale, scale);
    ctx.fillStyle = "rgba(0,0,0,0.30)";
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 62, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // car
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang + Math.PI / 2);
    ctx.scale(scale, scale);
    ctx.drawImage(carSprite, -SW / 2, -SH / 2, SW, SH);
    ctx.restore();

    requestAnimationFrame(loop);
  }

  resize();
  requestAnimationFrame(loop);
}

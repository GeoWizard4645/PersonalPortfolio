/* ============================================================
   F1 car. v6: aerial view, scroll-scrubbed, drives UNDER the page.

   Scroll drives the racing line; at the finish, wheel input spins donuts
   in place (contact + footer stay on screen). Arrow keys: manual drive
   with drift physics. Edge zones scroll the page while driving.
   Release the keys: 1s coast, then autonomous return along the scroll path.

   Desktop only; skipped for reduced-motion users.
   ============================================================ */

const PATH = [
  [0.00, 0.90, -0.15],
  [0.05, 0.82, 0.18],
  [0.11, 0.55, 0.52],
  [0.17, 0.24, 0.34],
  [0.24, 0.14, 0.66],
  [0.32, 0.44, 0.48],
  [0.41, 0.80, 0.62],
  [0.50, 0.66, 0.28],
  [0.58, 0.30, 0.55],
  [0.66, 0.14, 0.86],
  [0.74, 0.42, 0.91],
  [0.82, 0.72, 0.89],
  [0.90, 0.88, 0.74],
  [0.96, 0.90, 0.62],
  [1.00, 0.855, 0.80],
];

const FINISH = { x: 0.855, y: 0.80 };
const SPOOK_DIST = 80;
const DONUT_RADIUS_FRAC = 0.12;
const EDGE_ZONE = 0.05;

/* RC / Rocket League-style ground car */
const THROTTLE_ACCEL = 2000;
const BRAKE_POWER = 1500;
const REVERSE_ACCEL = 480;
const MAX_SPEED = 640;
const COAST_FRICTION = 880;
const LATERAL_GRIP = 2.2;
const TURN_BASE = 4.8;
const TURN_SPEED_BONUS = 2.8;
const MAX_TURN_RATE = 8.5;
const MIN_TURN_SPEED = 20;
const RETURN_IDLE_DELAY = 1.0;
const RETURN_SNAP_DIST = 90;
const RETURN_ARRIVE_DIST = 14;
const RETURN_ARRIVE_SPEED = 80;
const EDGE_SCROLL_SECONDS = 3.5;

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

  const SW = 64, SH = 128;
  let carSprite;

  function makeSprite() {
    carSprite = document.createElement("canvas");
    carSprite.width = SW * 2 * dpr;
    carSprite.height = SH * 2 * dpr;
    const c = carSprite.getContext("2d");
    c.setTransform(2 * dpr, 0, 0, 2 * dpr, 0, 0);
    c.translate(SW / 2, SH / 2);
    c.lineJoin = "round";
    c.lineCap = "round";

    const carbon = "#101318";
    const carbonMid = "#1a2028";
    const carbonHi = "#2a313c";
    const redDeep = "#5c0a10";
    const redMid = "#961018";
    const redBright = "#b81420";

    c.fillStyle = "rgba(0,0,0,0.35)";
    c.beginPath();
    c.ellipse(0, 0, 18, 54, 0, 0, Math.PI * 2);
    c.fill();

    function tyre(x, y, w, h) {
      c.fillStyle = "#060708";
      c.beginPath();
      c.roundRect(x - w / 2, y - h / 2, w, h, 1.5);
      c.fill();
      c.strokeStyle = "rgba(255,255,255,0.06)";
      c.lineWidth = 0.6;
      c.strokeRect(x - w / 2 + 0.5, y - h / 2 + 0.5, w - 1, h - 1);
      c.fillStyle = "rgba(255,255,255,0.04)";
      c.fillRect(x - w / 2 + 1, y - h / 2 + 1, w - 2, 1.2);
    }
    tyre(-20, -36, 8, 14);
    tyre(20, -36, 8, 14);
    tyre(-19, 36, 9, 15);
    tyre(19, 36, 9, 15);

    c.fillStyle = "#080a0d";
    c.beginPath();
    c.moveTo(-7, -48);
    c.lineTo(7, -48);
    c.lineTo(12, -22);
    c.lineTo(13, 18);
    c.quadraticCurveTo(11, 42, 8, 48);
    c.lineTo(-8, 48);
    c.quadraticCurveTo(-11, 42, -13, 18);
    c.lineTo(-12, -22);
    c.closePath();
    c.fill();

    c.fillStyle = carbon;
    c.fillRect(-24, -58, 48, 6);
    c.strokeStyle = carbonHi;
    c.lineWidth = 0.7;
    c.beginPath();
    c.moveTo(-22, -56.5); c.lineTo(22, -56.5);
    c.moveTo(-22, -54.5); c.lineTo(22, -54.5);
    c.stroke();
    c.fillStyle = redMid;
    c.fillRect(-25, -59, 1.8, 8);
    c.fillRect(23.2, -59, 1.8, 8);

    const bodyGrad = c.createLinearGradient(-14, 0, 14, 0);
    bodyGrad.addColorStop(0, redDeep);
    bodyGrad.addColorStop(0.45, redMid);
    bodyGrad.addColorStop(0.5, redBright);
    bodyGrad.addColorStop(0.55, redMid);
    bodyGrad.addColorStop(1, redDeep);
    c.fillStyle = bodyGrad;
    c.beginPath();
    c.moveTo(-1.5, -54);
    c.lineTo(1.5, -54);
    c.lineTo(5, -38);
    c.lineTo(11, -14);
    c.quadraticCurveTo(12, 4, 11, 20);
    c.lineTo(9, 38);
    c.lineTo(7, 44);
    c.lineTo(-7, 44);
    c.lineTo(-9, 38);
    c.lineTo(-11, 20);
    c.quadraticCurveTo(-12, 4, -11, -14);
    c.lineTo(-5, -38);
    c.closePath();
    c.fill();

    c.fillStyle = "#0a0c10";
    c.beginPath();
    c.moveTo(-11, -6); c.lineTo(-6, -8); c.lineTo(-6, 0); c.lineTo(-11.5, 2);
    c.closePath(); c.fill();
    c.beginPath();
    c.moveTo(11, -6); c.lineTo(6, -8); c.lineTo(6, 0); c.lineTo(11.5, 2);
    c.closePath(); c.fill();

    const spine = c.createLinearGradient(0, -10, 0, 42);
    spine.addColorStop(0, "rgba(255,255,255,0.08)");
    spine.addColorStop(0.5, "rgba(255,255,255,0.02)");
    spine.addColorStop(1, "rgba(0,0,0,0.15)");
    c.fillStyle = spine;
    c.fillRect(-1.2, -8, 2.4, 48);

    c.fillStyle = "#040506";
    c.beginPath();
    c.ellipse(0, -10, 4.2, 7.5, 0, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "rgba(255,255,255,0.12)";
    c.lineWidth = 0.8;
    c.stroke();

    c.strokeStyle = "rgba(180,188,196,0.55)";
    c.lineWidth = 1.4;
    c.beginPath();
    c.ellipse(0, -9, 6.2, 9.2, 0, Math.PI * 1.08, Math.PI * 1.92);
    c.stroke();

    c.fillStyle = carbonMid;
    c.fillRect(-2.8, 2, 5.6, 4);
    c.strokeStyle = carbonHi;
    c.lineWidth = 0.5;
    c.strokeRect(-2.8, 2, 5.6, 4);

    c.fillStyle = carbon;
    c.fillRect(-22, 46, 44, 7);
    c.strokeStyle = carbonHi;
    c.lineWidth = 0.6;
    c.beginPath();
    c.moveTo(-20, 48.5); c.lineTo(20, 48.5);
    c.moveTo(-20, 50.5); c.lineTo(20, 50.5);
    c.stroke();
    c.fillStyle = redMid;
    c.fillRect(-23.5, 45, 1.6, 9);
    c.fillRect(21.9, 45, 1.6, 9);

    c.strokeStyle = "rgba(255,255,255,0.07)";
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(-3, -46);
    c.quadraticCurveTo(-6, -10, -5, 24);
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

  let mx = -9999, my = -9999;
  window.addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; });
  window.addEventListener("resize", resize);

  let x = 0, y = -200;
  let ang = Math.PI / 2;
  let sBoost = 0, vBoost = 0;
  let last = performance.now();
  let finishUnlocked = false;
  let wheelExtra = 0;
  let vx = 0, vy = 0;
  let driveMode = "scroll"; // scroll | manual | return
  let idleTimer = 0;
  let programmaticScroll = false;
  const keys = { up: false, down: false, left: false, right: false };

  function maxScrollY() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  function scrollProgress() {
    const max = maxScrollY();
    if (max <= 0) return 0;
    return Math.max(0, Math.min(1, window.scrollY / max));
  }

  function atPageBottom() {
    return window.scrollY >= maxScrollY() - 2;
  }

  function isProjectsPage() {
    return document.body.getAttribute("data-route") === "projects-all";
  }

  function anyDriveKey() {
    return keys.up || keys.down || keys.left || keys.right;
  }

  function ignoreKeyTarget(el) {
    if (!el) return false;
    return el.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(el.tagName);
  }

  function onKeyDown(e) {
    if (ignoreKeyTarget(e.target)) return;
    const map = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
    const k = map[e.key];
    if (!k) return;
    keys[k] = true;
    driveMode = "manual";
    idleTimer = 0;
    e.preventDefault();
  }

  function onKeyUp(e) {
    const map = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
    const k = map[e.key];
    if (!k) return;
    keys[k] = false;
  }

  function clearKeys() {
    keys.up = keys.down = keys.left = keys.right = false;
  }

  function snapCarToScrollPath() {
    const home = pathTarget(scrollProgress());
    x = home.tx;
    y = home.ty;
    ang = home.pathAng;
    vx = vy = 0;
    sBoost = vBoost = 0;
    idleTimer = 0;
    driveMode = "scroll";
  }

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", clearKeys);

  window.addEventListener(
    "wheel",
    (e) => {
      const s = scrollProgress();
      const atBottom = atPageBottom();

      if (atBottom && finishUnlocked && driveMode === "scroll") {
        if (e.deltaY > 0) {
          e.preventDefault();
          wheelExtra += e.deltaY;
          vx = vy = 0;
          return;
        }
        if (e.deltaY < 0 && wheelExtra > 0) {
          e.preventDefault();
          wheelExtra = Math.max(0, wheelExtra + e.deltaY);
          return;
        }
      }

      if (driveMode === "manual" || driveMode === "return") {
        requestAnimationFrame(() => {
          if (!programmaticScroll && (driveMode === "manual" || driveMode === "return")) {
            snapCarToScrollPath();
          }
        });
      }

      if (s < 0.85) {
        wheelExtra = 0;
        finishUnlocked = false;
      } else if (atBottom) {
        finishUnlocked = true;
      }
    },
    { passive: false }
  );

  window.addEventListener(
    "scroll",
    () => {
      if (programmaticScroll) {
        programmaticScroll = false;
        return;
      }
      if (driveMode === "manual" || driveMode === "return") {
        snapCarToScrollPath();
      }
    },
    { passive: true }
  );

  function shortestArc(from, to) {
    let d = (to - from) % (Math.PI * 2);
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    return d;
  }

  function applyGroundPhysics(dt, throttle, steer) {
    const speed = Math.hypot(vx, vy);
    let turnRate = TURN_BASE + TURN_SPEED_BONUS * Math.min(1, speed / MAX_SPEED);
    turnRate = Math.min(MAX_TURN_RATE, turnRate);
    if (speed < MIN_TURN_SPEED) {
      turnRate = 0;
    } else if (speed < 55) {
      turnRate *= (speed - MIN_TURN_SPEED) / (55 - MIN_TURN_SPEED);
    }

    ang += steer * turnRate * dt;

    const fx = Math.cos(ang);
    const fy = Math.sin(ang);

    if (throttle > 0) {
      const ramp = Math.max(0.1, 1 - (speed / MAX_SPEED) ** 1.6);
      vx += fx * THROTTLE_ACCEL * throttle * ramp * dt;
      vy += fy * THROTTLE_ACCEL * throttle * ramp * dt;
    } else if (throttle < 0) {
      const forwardSpeed = vx * fx + vy * fy;
      if (forwardSpeed > 35) {
        vx -= fx * BRAKE_POWER * (-throttle) * dt;
        vy -= fy * BRAKE_POWER * (-throttle) * dt;
      } else {
        vx += fx * REVERSE_ACCEL * throttle * dt;
        vy += fy * REVERSE_ACCEL * throttle * dt;
      }
    } else {
      const spd = Math.hypot(vx, vy);
      if (spd > 1) {
        const drop = Math.min(spd, COAST_FRICTION * dt);
        vx -= (vx / spd) * drop;
        vy -= (vy / spd) * drop;
      }
    }

    const fwdSpd = vx * fx + vy * fy;
    const latX = vx - fx * fwdSpd;
    const latY = vy - fy * fwdSpd;
    const latDamp = Math.min(1, LATERAL_GRIP * dt);
    vx -= latX * latDamp;
    vy -= latY * latDamp;

    const cap = Math.hypot(vx, vy);
    if (cap > MAX_SPEED) {
      vx = (vx / cap) * MAX_SPEED;
      vy = (vy / cap) * MAX_SPEED;
    }

    x += vx * dt;
    y += vy * dt;
  }

  function clampCarToViewport() {
    const margin = 28;
    x = Math.max(margin, Math.min(W - margin, x));
    y = Math.max(margin, Math.min(H - margin, y));
  }

  function pathTarget(s) {
    const target = samplePath(s);
    const tx = target.x * W;
    const ty = target.y * H;
    const t2 = samplePath(Math.min(1, s + 0.004));
    const t1 = samplePath(Math.max(0, s - 0.004));
    const pathAng = Math.atan2(t2.y * H - t1.y * H, t2.x * W - t1.x * W);
    return { tx, ty, pathAng };
  }

  function nearestPathS() {
    let bestS = 0;
    let bestD = Infinity;
    for (let i = 0; i <= 100; i++) {
      const s = i / 100;
      const p = samplePath(s);
      const dx = p.x * W - x;
      const dy = p.y * H - y;
      const d = dx * dx + dy * dy;
      if (d < bestD) {
        bestD = d;
        bestS = s;
      }
    }
    return bestS;
  }

  function returnAimPoint(scrollS) {
    const nearS = nearestPathS();
    const gap = scrollS - nearS;
    let aimS = scrollS;
    if (gap > 0.012) {
      aimS = Math.min(scrollS, nearS + Math.max(0.045, Math.min(0.16, gap * 0.4)));
    } else if (gap < -0.012) {
      aimS = Math.max(scrollS, nearS - Math.max(0.045, Math.min(0.16, -gap * 0.4)));
    }
    return pathTarget(aimS);
  }

  function edgeScrollRate() {
    const max = maxScrollY();
    return max > 0 ? max / EDGE_SCROLL_SECONDS : 900;
  }

  function scrollPageBy(dy) {
    if (!dy) return;
    const max = maxScrollY();
    const next = Math.max(0, Math.min(max, window.scrollY + dy));
    if (next === window.scrollY) return;
    programmaticScroll = true;
    /* CSS `scroll-behavior: smooth` hijacks the scrollTop setter too, so a
       per-frame write here fights its own animation and never catches up.
       scrollTo({behavior:"instant"}) bypasses that. */
    window.scrollTo({ top: next, behavior: "instant" });
  }

  function edgeIntensity(pos, band, size, towardEdge) {
    const inZone = pos <= band || (towardEdge > 0 && pos <= band + 24);
    if (!inZone) return 0;
    if (pos <= band) return Math.max(0.35, 1 - Math.max(0, pos) / Math.max(1, band));
    return 0.35 + Math.min(0.4, towardEdge / 600);
  }

  function applyEdgeScroll(dt) {
    if (driveMode !== "manual") return;

    const bandY = H * EDGE_ZONE;
    const bandX = W * EDGE_ZONE;
    const projects = isProjectsPage();
    let delta = 0;

    const scrollRate = edgeScrollRate();
    const topPush = edgeIntensity(y, bandY, H, -vy);
    if (topPush > 0) delta -= scrollRate * topPush * dt;

    if (!projects) {
      const bottomDist = H - y;
      const bottomPush = edgeIntensity(bottomDist, bandY, H, vy);
      if (bottomPush > 0) delta += scrollRate * bottomPush * dt;
    }

    if (projects) {
      const rightDist = W - x;
      const rightPush = edgeIntensity(rightDist, bandX, W, vx);
      if (rightPush > 0) delta += scrollRate * rightPush * dt;

      const leftPush = edgeIntensity(x, bandX, W, -vx);
      if (leftPush > 0) delta -= scrollRate * leftPush * dt;
    }

    scrollPageBy(delta);
  }

  function drawFinishZone(flagA) {
    if (flagA <= 0.01) return;
    const fx = FINISH.x * W;
    const fy = FINISH.y * H;
    const sq = 11;

    for (let r = 0; r < 3; r++) {
      for (let cI = 0; cI < 8; cI++) {
        ctx.fillStyle = (r + cI) % 2 === 0
          ? `rgba(232,236,240,${(flagA * 0.85).toFixed(3)})`
          : `rgba(14,16,20,${(flagA * 0.9).toFixed(3)})`;
        ctx.fillRect(fx - 4 * sq + cI * sq, fy - 1.5 * sq + r * sq, sq, sq);
      }
    }

    const pxl = fx + 4 * sq + 16;
    const pyl = fy + 14;
    ctx.strokeStyle = `rgba(200,208,216,${flagA.toFixed(3)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pxl, pyl);
    ctx.lineTo(pxl, pyl - 46);
    ctx.stroke();
    for (let r = 0; r < 3; r++) {
      for (let cI = 0; cI < 5; cI++) {
        ctx.fillStyle = (r + cI) % 2 === 0
          ? `rgba(240,243,246,${flagA.toFixed(3)})`
          : `rgba(10,12,16,${flagA.toFixed(3)})`;
        const dy = Math.sin(cI * 1.1) * 1.6;
        ctx.fillRect(pxl + 1 + cI * 7, pyl - 46 + r * 7 + dy, 7, 7);
      }
    }
  }

  function loop(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;

    const s0 = scrollProgress();

    if (s0 >= 0.98 || atPageBottom()) {
      finishUnlocked = true;
    } else if (s0 < 0.85) {
      finishUnlocked = false;
      wheelExtra = 0;
    }

    if (atPageBottom() && finishUnlocked && wheelExtra > 0 && !anyDriveKey()) {
      driveMode = "scroll";
    }

    const inDonuts = finishUnlocked && atPageBottom() && driveMode !== "manual" && wheelExtra > 0;
    const flagA = Math.max(0, Math.min(1, (s0 - 0.88) / 0.08));

    if (anyDriveKey()) {
      driveMode = "manual";
      idleTimer = 0;
    }

    if (driveMode === "manual") {
      if (anyDriveKey()) {
        let throttle = 0;
        if (keys.up) throttle += 1;
        if (keys.down) throttle -= 1;

        let steer = 0;
        if (keys.left) steer -= 1;
        if (keys.right) steer += 1;

        applyGroundPhysics(dt, throttle, steer);
        applyEdgeScroll(dt);
        clampCarToViewport();
      } else {
        idleTimer += dt;
        applyGroundPhysics(dt, 0, 0);
        clampCarToViewport();
        if (idleTimer >= RETURN_IDLE_DELAY) {
          driveMode = "return";
          idleTimer = 0;
        }
      }
    } else if (driveMode === "return") {
      const home = pathTarget(s0);
      const { tx, ty, pathAng } = returnAimPoint(s0);
      const toX = tx - x;
      const toY = ty - y;
      const distHome = Math.hypot(home.tx - x, home.ty - y);
      const pathErr = shortestArc(ang, home.pathAng);
      const speed = Math.hypot(vx, vy);

      if (distHome < RETURN_SNAP_DIST) {
        const snap = Math.min(1, 16 * dt);
        x += (home.tx - x) * snap;
        y += (home.ty - y) * snap;
        ang += shortestArc(ang, home.pathAng) * Math.min(1, 14 * dt);
        vx *= 0.82;
        vy *= 0.82;

        if (distHome < RETURN_ARRIVE_DIST && speed < RETURN_ARRIVE_SPEED && Math.abs(pathErr) < 0.4) {
          driveMode = "scroll";
          x = home.tx;
          y = home.ty;
          ang = home.pathAng;
          vx = vy = 0;
        }
      } else {
        const aim = Math.atan2(toY, toX);
        const headingErr = shortestArc(ang, aim);
        const steer = Math.max(-1, Math.min(1, headingErr * 2.8));
        const throttle = Math.abs(headingErr) < 1.15 ? 0.88 : 0.42;
        applyGroundPhysics(dt, throttle, steer);
        clampCarToViewport();
      }
    } else {
      let tx, ty, desiredAng;

      if (inDonuts) {
        const fx = FINISH.x * W;
        const fy = FINISH.y * H;
        const r = DONUT_RADIUS_FRAC * Math.min(W, H);
        const theta = (wheelExtra / (window.innerHeight * 0.32)) * Math.PI * 2;
        tx = fx + Math.cos(theta) * r;
        ty = fy + Math.sin(theta) * r * 0.85;
        desiredAng = theta + Math.PI / 2;
      } else {
        const ddx = mx - x, ddy = my - y;
        if (ddx * ddx + ddy * ddy < SPOOK_DIST * SPOOK_DIST && vBoost < 0.02) {
          vBoost = 0.14;
        }
        sBoost += vBoost * dt;
        vBoost *= Math.exp(-2.4 * dt);
        sBoost *= Math.exp(-1.1 * dt);

        const s = Math.max(0, Math.min(1, s0 + sBoost));
        const target = pathTarget(s);
        tx = target.tx;
        ty = target.ty;
        desiredAng = target.pathAng;
      }

      const chase = inDonuts ? 18 : 9;
      x += (tx - x) * Math.min(1, chase * dt);
      y += (ty - y) * Math.min(1, chase * dt);

      const dAng = shortestArc(ang, desiredAng) * Math.min(1, (inDonuts ? 16 : 8) * dt);
      ang += dAng;
    }

    ctx.clearRect(0, 0, W, H);
    drawFinishZone(flagA);

    const scale = Math.max(0.58, Math.min(0.82, (W / 1500) * 0.75));

    ctx.save();
    ctx.translate(x + 3, y + 5);
    ctx.rotate(ang + Math.PI / 2);
    ctx.scale(scale, scale);
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 56, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

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

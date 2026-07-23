/* Small canvas painters for project preview cards.
   Kinds: pulse, balance, dashboard, plotter, equalizer, lines, pixel. */
export function paintPreview(canvas, kind) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const r = canvas.getBoundingClientRect();
  if (!r.width || !r.height) return;
  canvas.width = Math.floor(r.width * dpr);
  canvas.height = Math.floor(r.height * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const w = r.width, h = r.height;
  const c1 = "#7dd3fc";

  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#02131e");
  g.addColorStop(1, "#0b1822");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(125,211,252,0.08)";
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 28) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += 28) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  if (kind === "pulse") {
    // EKG heartbeat line: FitFo.
    const midY = h / 2;
    ctx.strokeStyle = c1; ctx.lineWidth = 2.5;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(12, midY);
    const beat = (x0) => {
      ctx.lineTo(x0, midY);
      ctx.lineTo(x0 + 8, midY - 6);
      ctx.lineTo(x0 + 16, midY + 8);
      ctx.lineTo(x0 + 24, midY - h * 0.3);
      ctx.lineTo(x0 + 32, midY + h * 0.22);
      ctx.lineTo(x0 + 40, midY);
    };
    beat(w * 0.16);
    beat(w * 0.55);
    ctx.lineTo(w - 12, midY);
    ctx.stroke();
    // Watch outline in the corner
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 1.5;
    const ww = 26, wh = 32, wx = w - ww - 18, wy = 14;
    ctx.beginPath();
    ctx.roundRect(wx, wy, ww, wh, 7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(wx + 6, wy - 4); ctx.lineTo(wx + ww - 6, wy - 4);
    ctx.moveTo(wx + 6, wy + wh + 4); ctx.lineTo(wx + ww - 6, wy + wh + 4);
    ctx.stroke();
  } else if (kind === "balance") {
    const cx = w / 2, cy = h / 2;
    ctx.strokeStyle = c1; ctx.lineWidth = 2.5; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(cx, cy - h * 0.32); ctx.lineTo(cx, cy + h * 0.30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - w * 0.30, cy - h * 0.20); ctx.lineTo(cx + w * 0.30, cy - h * 0.20); ctx.stroke();
    [-w * 0.30, w * 0.30].forEach((dx) => {
      ctx.beginPath(); ctx.arc(cx + dx, cy - h * 0.06, h * 0.16, 0, Math.PI); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + dx - h * 0.16, cy - h * 0.06); ctx.lineTo(cx + dx, cy - h * 0.20);
      ctx.moveTo(cx + dx + h * 0.16, cy - h * 0.06); ctx.lineTo(cx + dx, cy - h * 0.20);
      ctx.stroke();
    });
    ctx.beginPath(); ctx.moveTo(cx - w * 0.14, cy + h * 0.30); ctx.lineTo(cx + w * 0.14, cy + h * 0.30); ctx.stroke();
  } else if (kind === "dashboard") {
    // Mini LED dashboard tiles: Sprig. Four app tiles + a D-pad cluster.
    const pad = 16, gap = 8;
    const tw = (w - pad * 2 - gap) / 2, th = (h - pad * 2 - gap) / 2;
    const tiles = [
      { x: pad, y: pad },                       // weather
      { x: pad + tw + gap, y: pad },            // stocks
      { x: pad, y: pad + th + gap },            // sports
      { x: pad + tw + gap, y: pad + th + gap }, // net stats
    ];
    tiles.forEach((tile, i) => {
      ctx.strokeStyle = "rgba(125,211,252,0.35)";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(tile.x, tile.y, tw, th);
      ctx.strokeStyle = c1; ctx.lineWidth = 2; ctx.lineCap = "round";
      if (i === 0) {
        // sun + cloud arc
        ctx.beginPath(); ctx.arc(tile.x + tw * 0.35, tile.y + th * 0.45, th * 0.18, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(tile.x + tw * 0.55, tile.y + th * 0.68); ctx.lineTo(tile.x + tw * 0.85, tile.y + th * 0.68); ctx.stroke();
      } else if (i === 1) {
        // rising stock line
        ctx.beginPath();
        ctx.moveTo(tile.x + 6, tile.y + th - 8);
        ctx.lineTo(tile.x + tw * 0.35, tile.y + th * 0.55);
        ctx.lineTo(tile.x + tw * 0.55, tile.y + th * 0.7);
        ctx.lineTo(tile.x + tw - 6, tile.y + 8);
        ctx.stroke();
      } else if (i === 2) {
        // scoreboard bars
        ctx.fillStyle = c1;
        ctx.fillRect(tile.x + 8, tile.y + th * 0.3, tw * 0.5, 3);
        ctx.fillRect(tile.x + 8, tile.y + th * 0.6, tw * 0.34, 3);
      } else {
        // wifi arcs
        const bx = tile.x + tw / 2, by = tile.y + th * 0.78;
        [0.5, 0.32, 0.16].forEach((f) => {
          ctx.beginPath(); ctx.arc(bx, by, th * f, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke();
        });
        ctx.fillStyle = c1;
        ctx.beginPath(); ctx.arc(bx, by, 2, 0, Math.PI * 2); ctx.fill();
      }
    });
  } else if (kind === "plotter") {
    // Continuous pen-plotter squiggle: Blot.
    ctx.strokeStyle = c1; ctx.lineWidth = 1.6;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath();
    const rows = 6, left = w * 0.12, right = w * 0.88;
    const top = h * 0.2, bottom = h * 0.8;
    for (let rI = 0; rI < rows; rI++) {
      const y = top + (rI / (rows - 1)) * (bottom - top);
      const dir = rI % 2 === 0 ? 1 : -1;
      const x0 = dir === 1 ? left : right;
      const x1 = dir === 1 ? right : left;
      if (rI === 0) ctx.moveTo(x0, y);
      // squiggle across the row: amplitude varies to fake "image density"
      const steps = 26;
      for (let sI = 1; sI <= steps; sI++) {
        const x = x0 + ((x1 - x0) * sI) / steps;
        const amp = 3 + 6 * Math.abs(Math.sin((sI / steps) * Math.PI * 2 + rI));
        const yy = y + Math.sin(sI * 2.4 + rI * 5) * amp;
        ctx.lineTo(x, yy);
      }
      // connect down to next row
      if (rI < rows - 1) {
        const nextY = top + ((rI + 1) / (rows - 1)) * (bottom - top);
        ctx.lineTo(x1, nextY);
      }
    }
    ctx.stroke();
    // pen head
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.beginPath(); ctx.arc(w * 0.88, bottom, 3, 0, Math.PI * 2); ctx.fill();
  } else if (kind === "equalizer") {
    const bars = 24, gap = 5;
    const bw = (w - gap * (bars - 1) - 40) / bars;
    for (let i = 0; i < bars; i++) {
      const t = (Math.sin(i * 1.3) * 0.5 + 0.5) * (Math.sin(i * 0.7 + 1) * 0.5 + 0.5);
      const bh = 12 + t * h * 0.7;
      const x = 20 + i * (bw + gap);
      const y = (h - bh) / 2;
      ctx.fillStyle = c1;
      ctx.fillRect(x, y, bw, bh);
    }
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();
  } else if (kind === "lines") {
    const left = w * 0.1, right = w * 0.92;
    const startY = h * 0.18, step = 12;
    const rows = Math.floor((h - startY - 16) / step);
    for (let rI = 0; rI < rows; rI++) {
      const y = startY + rI * step;
      const len = (right - left) * (0.55 + 0.45 * Math.sin(rI * 1.1 + 2));
      ctx.strokeStyle = rI === 0 ? c1 : `rgba(255,255,255,${0.18 + (rI % 3) * 0.06})`;
      ctx.lineWidth = rI === 0 ? 3.5 : 1.5;
      ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(left + len, y); ctx.stroke();
    }
  } else if (kind === "pixel") {
    const pattern = [
      "0011001100",
      "0111111110",
      "0111111110",
      "0011111100",
      "0001111000",
      "0000110000",
    ];
    const pW = pattern[0].length, pH = pattern.length;
    const scale = Math.min(Math.floor((w - 60) / pW), Math.floor((h - 40) / pH));
    const offX = (w - pW * scale) / 2, offY = (h - pH * scale) / 2;
    for (let rI = 0; rI < pH; rI++) for (let c = 0; c < pW; c++) {
      if (pattern[rI][c] === "1") {
        ctx.fillStyle = c1;
        ctx.fillRect(offX + c * scale, offY + rI * scale, scale - 1, scale - 1);
      }
    }
  }

  ctx.strokeStyle = "rgba(125,211,252,0.55)";
  ctx.lineWidth = 1;
  const L = 10;
  [[10, 10], [w - 10, 10], [10, h - 10], [w - 10, h - 10]].forEach(([x, y], i) => {
    const sx = (i & 1) ? -1 : 1;
    const sy = (i > 1) ? -1 : 1;
    ctx.beginPath();
    ctx.moveTo(x + L * sx, y); ctx.lineTo(x, y);
    ctx.moveTo(x, y + L * sy); ctx.lineTo(x, y);
    ctx.stroke();
  });
}

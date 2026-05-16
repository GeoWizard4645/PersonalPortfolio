/* ===========================================================
   Vivaan Shahani — projects.js
   -----------------------------------------------------------
   Renders the project grid from PROJECTS data.
   Each card paints its preview into a small canvas using one
   of a few procedural styles — gives every card a unique
   "screenshot" without shipping image assets.

   To add a new project: append an object to PROJECTS below.
   =========================================================== */

(() => {
  "use strict";

  /* ---------- Project data (EDIT ME) ---------- */
  const PROJECTS = [
    {
      title: "DJ Website",
      href:  "https://geowizard4645.github.io/DJ/",
      tag:   "Live · Web",
      tone:  "live",
      preview: { style: "equalizer", palette: ["#67e8f9", "#a78bfa"] },
      role: `Designed and built the entire site in vanilla HTML/CSS/JS — including the visual identity, animated audio motifs, and booking surface. <b>Role:</b> sole designer & developer.`,
      chips: ["HTML", "CSS", "JS", "Design"],
    },
    {
      title: "Medium Blog",
      href:  "https://vivshahani.medium.com/",
      tag:   "Writing",
      tone:  "writing",
      preview: { style: "lines", palette: ["#a78bfa", "#67e8f9"] },
      role: `Long-form essays on technology, debate culture, and the messy middle of growing up online. <b>Role:</b> writer & editor — every piece is self-drafted and self-published.`,
      chips: ["Essays", "Editorial"],
    },
    {
      title: "Debate101",
      href:  "https://debate101.org",
      tag:   "Founder · Live",
      tone:  "live",
      preview: { style: "scale", palette: ["#fcd34d", "#a78bfa"] },
      role: `Founded Debate101 to make competitive debate less gate-kept for beginners. <b>Role:</b> built the platform, wrote the curriculum, and drove community growth from zero.`,
      chips: ["Product", "Curriculum", "Community"],
    },
    {
      title: "Lemonade Stand",
      href:  "https://github.com/GeoWizard4645/Viv-Lemonade-Stand",
      tag:   "Archive · 6th grade",
      tone:  "archive",
      preview: { style: "pixel", palette: ["#fcd34d", "#fb923c"] },
      role: `Kept around for nostalgia — my very first coding project, written in 6th grade. <b>Role:</b> tiny me, learning loops, variables, and conditional logic the hard way.`,
      chips: ["Archive", "First Project"],
    },

    /* ───────── Templates: copy-paste a block above and edit ─────────
    {
      title: "New Project",
      href:  "https://example.com",
      tag:   "Status · Type",
      tone:  "live",                 // "live" | "writing" | "archive"
      preview: { style: "lines",     // see drawPreview() options
                 palette: ["#a78bfa", "#67e8f9"] },
      role:  `What you did, in one or two sentences. Use <b>Role:</b> ...`,
      chips: ["Tag1", "Tag2"],
    },
    ───────────────────────────────────────────────────────────────── */
  ];

  /* ---------- Render ---------- */
  const grid = document.getElementById("project-grid");
  if (!grid) return;

  PROJECTS.forEach((p, i) => {
    const card = document.createElement("a");
    card.className = "project-card";
    card.href = p.href;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.style.animation = `fade-up 600ms cubic-bezier(0.16,1,0.3,1) both`;
    card.style.animationDelay = `${i * 70}ms`;

    card.innerHTML = `
      <div class="project-preview">
        <canvas></canvas>
        <span class="project-preview-tag" data-tone="${p.tone}">${escapeHtml(p.tag)}</span>
      </div>
      <div class="project-body">
        <div class="project-title-row">
          <h3 class="project-title">${escapeHtml(p.title)}</h3>
          <span class="project-link">
            visit
            <svg class="icon icon--xs" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M7 17L17 7M7 7h10v10"/>
            </svg>
          </span>
        </div>
        <p class="project-role">${p.role}</p>
        <div class="project-meta">
          ${(p.chips || []).map((c) => `<span class="project-chip">${escapeHtml(c)}</span>`).join("")}
        </div>
      </div>
    `;
    grid.appendChild(card);

    const canvas = card.querySelector("canvas");
    drawPreview(canvas, p.preview);
    // Repaint on resize so previews stay crisp on viewport changes
    new ResizeObserver(() => drawPreview(canvas, p.preview)).observe(canvas);
  });

  // Placeholder "add new project" card — handy template visible in the grid
  const ph = document.createElement("div");
  ph.className = "project-card project-card--placeholder";
  ph.innerHTML = `
    <div class="ph-inner">
      <strong>+ Add a project</strong>
      <span class="muted">Open <code>projects.js</code> and append to <code>PROJECTS</code>.</span>
    </div>
  `;
  grid.appendChild(ph);

  // Year stamp
  const yEl = document.getElementById("year");
  if (yEl) yEl.textContent = String(new Date().getFullYear());

  /* ===========================================================
     Canvas preview generators
     -----------------------------------------------------------
     Each style draws into the card's canvas using the given
     palette. Cheap, deterministic, no external assets.
     =========================================================== */
  function drawPreview(canvas, opts = {}) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();
    canvas.width  = Math.max(1, Math.floor(rect.width  * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const [c1, c2] = opts.palette || ["#a78bfa", "#67e8f9"];

    // gradient backdrop
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#0d0d15");
    grad.addColorStop(1, "#15151f");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    switch (opts.style) {
      case "equalizer": return drawEqualizer(ctx, w, h, c1, c2);
      case "lines":     return drawLines(ctx, w, h, c1, c2);
      case "scale":     return drawScale(ctx, w, h, c1, c2);
      case "pixel":     return drawPixel(ctx, w, h, c1, c2);
      default:          return drawLines(ctx, w, h, c1, c2);
    }
  }

  function drawEqualizer(ctx, w, h, c1, c2) {
    const bars = 28;
    const gap = 4;
    const bw = (w - gap * (bars - 1)) / bars;
    for (let i = 0; i < bars; i++) {
      // pseudo-random but deterministic
      const t = (Math.sin(i * 1.3) * 0.5 + 0.5) * (Math.sin(i * 0.7 + 1) * 0.5 + 0.5);
      const bh = 10 + t * (h * 0.7);
      const x = i * (bw + gap);
      const y = (h - bh) / 2;
      const g = ctx.createLinearGradient(0, y, 0, y + bh);
      g.addColorStop(0, c1);
      g.addColorStop(1, c2);
      ctx.fillStyle = g;
      roundRect(ctx, x, y, bw, bh, 2);
      ctx.fill();
    }
    // glow line
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
  }

  function drawLines(ctx, w, h, c1, c2) {
    // text-like horizontal lines — like a blog page mock
    const left = w * 0.12;
    const right = w * 0.88;
    const startY = h * 0.22;
    const step = 14;
    const rows = Math.floor((h - startY - 20) / step);
    for (let r = 0; r < rows; r++) {
      const y = startY + r * step;
      const len = (right - left) * (0.55 + 0.45 * Math.sin(r * 1.1 + 2));
      const x2 = left + len;
      const g = ctx.createLinearGradient(left, 0, x2, 0);
      g.addColorStop(0, c1 + "ff");
      g.addColorStop(1, c2 + "33");
      ctx.strokeStyle = r === 0 ? c1 : g;
      ctx.lineWidth = r === 0 ? 4 : 2;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(x2, y);
      ctx.stroke();
    }
  }

  function drawScale(ctx, w, h, c1, c2) {
    // simplified balance-scale silhouette — represents debate
    const cx = w / 2;
    const cy = h / 2;
    ctx.strokeStyle = c1;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";

    // upright
    ctx.beginPath();
    ctx.moveTo(cx, cy - h * 0.28);
    ctx.lineTo(cx, cy + h * 0.28);
    ctx.stroke();

    // arms
    const armY = cy - h * 0.18;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.28, armY);
    ctx.lineTo(cx + w * 0.28, armY);
    ctx.stroke();

    // pans (arcs)
    [-w * 0.28, w * 0.28].forEach((dx) => {
      ctx.strokeStyle = c2;
      ctx.beginPath();
      ctx.arc(cx + dx, armY + h * 0.14, h * 0.12, 0, Math.PI);
      ctx.stroke();
      // strings
      ctx.strokeStyle = c1 + "88";
      ctx.beginPath();
      ctx.moveTo(cx + dx - h * 0.12, armY + h * 0.14);
      ctx.lineTo(cx + dx, armY);
      ctx.moveTo(cx + dx + h * 0.12, armY + h * 0.14);
      ctx.lineTo(cx + dx, armY);
      ctx.stroke();
    });

    // base
    ctx.strokeStyle = c1;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.12, cy + h * 0.28);
    ctx.lineTo(cx + w * 0.12, cy + h * 0.28);
    ctx.stroke();
  }

  function drawPixel(ctx, w, h, c1, c2) {
    // pixel-art style "lemonade" — yellow circle + glass
    const cellW = 14;
    const cols = Math.floor(w / cellW);
    const rows = Math.floor(h / cellW);

    // a heart in the middle: classic 6th-grade vibes
    const pattern = [
      "0011001100",
      "0111111110",
      "0111111110",
      "0011111100",
      "0001111000",
      "0000110000",
    ];
    const pW = pattern[0].length;
    const pH = pattern.length;
    const scale = Math.min(Math.floor((w - 40) / pW), Math.floor((h - 40) / pH));
    const offX = (w - pW * scale) / 2;
    const offY = (h - pH * scale) / 2;

    // sprinkle background dots
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if ((r * c + r) % 11 === 0) {
          ctx.fillRect(c * cellW + 4, r * cellW + 4, 2, 2);
        }
      }
    }

    for (let r = 0; r < pH; r++) {
      for (let c = 0; c < pW; c++) {
        if (pattern[r][c] === "1") {
          const g = ctx.createLinearGradient(0, offY, 0, offY + pH * scale);
          g.addColorStop(0, c1);
          g.addColorStop(1, c2);
          ctx.fillStyle = g;
          ctx.fillRect(offX + c * scale, offY + r * scale, scale - 1, scale - 1);
        }
      }
    }
  }

  /* ---------- helpers ---------- */
  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();

/* Projects + Contact + Footer */
const P = window.PORTFOLIO_DATA.projects;
const { useState: useStateP, useRef: useRefP, useEffect: useEffectP } = React;

/* small canvas painter for the inline project preview */
function paintPreview(canvas, kind) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const r = canvas.getBoundingClientRect();
  if (!r.width || !r.height) return;
  canvas.width = Math.floor(r.width * dpr);
  canvas.height = Math.floor(r.height * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const w = r.width, h = r.height;
  const c1 = "#7dd3fc"; // accent
  const ink = "#02131e";

  // base — ink wash
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#02131e");
  g.addColorStop(1, "#0b1822");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // soft grid background
  ctx.strokeStyle = "rgba(125,211,252,0.08)";
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 28) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += 28) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  if (kind === "balance") {
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
    for (let r = 0; r < rows; r++) {
      const y = startY + r * step;
      const len = (right - left) * (0.55 + 0.45 * Math.sin(r * 1.1 + 2));
      ctx.strokeStyle = r === 0 ? c1 : `rgba(255,255,255,${0.18 + (r % 3) * 0.06})`;
      ctx.lineWidth = r === 0 ? 3.5 : 1.5;
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
    for (let r = 0; r < pH; r++) for (let c = 0; c < pW; c++) {
      if (pattern[r][c] === "1") {
        ctx.fillStyle = c1;
        ctx.fillRect(offX + c * scale, offY + r * scale, scale - 1, scale - 1);
      }
    }
  }

  // crosshair corners
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

function ProjectRow({ p, i, expanded, onEnter, onLeave }) {
  const canvasRef = useRefP(null);
  useEffectP(() => {
    if (canvasRef.current && expanded) {
      paintPreview(canvasRef.current, p.preview);
    }
  }, [expanded]);

  return (
    <a
      href={p.href}
      target={p.href === "#" ? undefined : "_blank"}
      rel="noopener noreferrer"
      className={`project-row ${expanded ? "is-expanded" : ""}`}
      data-cursor="hover"
      onPointerEnter={onEnter}
      onFocus={onEnter}
    >
      <div className="project-row__main">
        <span className="project-row__num">{p.num}</span>
        <span className="project-row__title">
          {p.title.split(" ").map((w, k, arr) => (
            <React.Fragment key={k}>
              {k === arr.length - 1 ? <span className="serif">{w}</span> : <>{w} </>}
            </React.Fragment>
          ))}
        </span>
        <span className="project-row__role">{p.role}</span>
        <span className="project-row__tags">
          {p.tags.map((t, k) => <span key={k} className="project-row__tag">{t}</span>)}
        </span>
        <span className="project-row__year">{p.year}</span>
        <span className="project-row__arrow">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17L17 7M9 7h8v8" />
          </svg>
        </span>
      </div>

      <div className="project-row__details">
        <div className="project-row__preview">
          <span className="project-row__preview-tag">↗ Visit · {p.year}</span>
          <canvas ref={canvasRef} />
        </div>
        <div className="project-row__info">
          <div className="project-row__info-block">
            <span className="project-row__info-label">What it is</span>
            <p className="project-row__info-text">{p.what}</p>
          </div>
          <div className="project-row__info-block">
            <span className="project-row__info-label">What I did</span>
            <p className="project-row__info-text">{p.did}</p>
          </div>
          <div className="project-row__info-block">
            <span className="project-row__info-label">What I learned</span>
            <p className="project-row__info-text">{p.learned}</p>
          </div>
          {p.tools && (
            <div className="project-row__info-block">
              <span className="project-row__info-label">Tooling</span>
              <span className="project-row__info-tools">
                {p.tools.map((t, k) => (
                  <span key={k} className="project-row__info-tool">{t}</span>
                ))}
              </span>
            </div>
          )}
        </div>
      </div>
    </a>
  );
}

function Projects() {
  const [hovered, setHovered] = useStateP(null);

  return (
    <section className="section projects" id="work">
      <div className="projects__head">
        <div>
          <div className="section__num">[ <span>03</span> ] · Selected Work</div>
          <h2 className="projects__heading" data-reveal>
            <SplitText>Shipped things,</SplitText>
            <br /><SplitText delay={120}>kept the receipts.</SplitText>
          </h2>
        </div>
        <p className="projects__note" data-reveal>
          Four projects. A non-profit platform, a DJ booking page, an essay archive, and one nostalgic 6th-grade origin. Hover any row — the row expands inline.
        </p>
      </div>

      <div
        className="projects__list"
        onPointerLeave={() => setHovered(null)}
      >
        {P.map((p, i) => (
          <ProjectRow
            key={p.num}
            p={p}
            i={i}
            expanded={hovered === i}
            onEnter={() => setHovered(i)}
            onLeave={() => setHovered(null)}
          />
        ))}
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="contact__inner">
        <div className="section__num">[ <span>04</span> ] · Get in touch</div>
        <h2 className="contact__big" data-cursor="text" data-reveal>
          <SplitText>Let's build</SplitText>
          <br /><SplitText delay={120}><span className="stroke">something</span></SplitText>{" "}<SplitText delay={240}>together.</SplitText>
        </h2>
        <a className="contact__email" href="mailto:vivaan.shahani@gmail.com" data-cursor="hover">
          vivaan.shahani@gmail.com →
        </a>

        <div className="contact__row">
          <div className="contact__col">
            <div className="contact__col-label">Email</div>
            <a href="mailto:vivaan.shahani@gmail.com">vivaan.shahani@gmail.com</a>
          </div>
          <div className="contact__col">
            <div className="contact__col-label">Phone</div>
            <a href="tel:+19145207210">+1 914-520-7210</a>
          </div>
          <div className="contact__col">
            <div className="contact__col-label">Elsewhere</div>
            <a href="https://github.com/GeoWizard4645" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
            <a href="https://vivshahani.medium.com/" target="_blank" rel="noopener noreferrer">Medium ↗</a>
            <a href="https://debate101.org" target="_blank" rel="noopener noreferrer">Debate101 ↗</a>
          </div>
          <div className="contact__col">
            <div className="contact__col-label">Based in</div>
            <span>Scarsdale, NY · ET</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function FooterStrip() {
  return (
    <div className="footer-strip">
      <span>© '26 — Vivaan Shahani / All work my own.</span>
      <span>Built with React + a lot of CSS · v2</span>
    </div>
  );
}

Object.assign(window, { Projects, Contact, FooterStrip });

/* Projects (carousel) + ProjectsAll (grid page) + Contact + Footer */
const P = window.PORTFOLIO_DATA.projects;
const { useState: useStateP, useRef: useRefP, useEffect: useEffectP, useMemo: useMemoP } = React;

/* small canvas painter for project previews */
function paintPreview(canvas, kind) {
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

/* Carousel card — used in the horizontal carousel on the home page. */
function ProjectCard({ p }) {
  const canvasRef = useRefP(null);
  useEffectP(() => {
    if (canvasRef.current) paintPreview(canvasRef.current, p.preview);
    const onResize = () => {
      if (canvasRef.current) paintPreview(canvasRef.current, p.preview);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [p.preview]);

  return (
    <a
      href={p.href}
      target={p.href === "#" ? undefined : "_blank"}
      rel="noopener noreferrer"
      className="project-card"
      data-cursor="hover"
    >
      <div className="project-card__head">
        <span className="project-card__num">{p.num}</span>
        <span className="project-card__year">{p.year}</span>
      </div>
      <div className="project-card__preview">
        <span className="project-card__preview-tag">↗ Visit</span>
        <canvas ref={canvasRef} />
      </div>
      <h3 className="project-card__title">
        {p.title.split(" ").map((w, k, arr) => (
          <React.Fragment key={k}>
            {k === arr.length - 1 ? <span className="serif">{w}</span> : <>{w} </>}
          </React.Fragment>
        ))}
      </h3>
      <p className="project-card__role">{p.role}</p>
      <div className="project-card__tags">
        {p.tags.map((t, k) => <span key={k} className="project-card__tag">{t}</span>)}
      </div>
      <div className="project-card__foot">
        <span className="project-card__foot-label">What I did</span>
        <p className="project-card__foot-text">{p.did}</p>
      </div>
      <span className="project-card__arrow" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 17L17 7M9 7h8v8" />
        </svg>
      </span>
    </a>
  );
}

function Projects({ onViewAll }) {
  return (
    <div className="pin-wrap" data-pin="projects-carousel">
      <section className="projects projects--carousel" id="work">
        <div className="projects-carousel">
          <div className="projects-carousel__head">
            <div>
              <div className="section__num">[ <span>03</span> ] · Projects</div>
              <h2 className="projects__heading" data-reveal>
                <SplitText>Shipped things,</SplitText>
                <br /><SplitText delay={120}>kept the receipts.</SplitText>
              </h2>
            </div>
            <div className="projects-carousel__head-right">
              <p className="projects__note" data-reveal>
                Scroll down — the cards shift sideways. Hover a card or hit View All for the full archive.
              </p>
              <button
                type="button"
                className="projects-carousel__view-all"
                onClick={onViewAll}
                data-cursor="hover"
              >
                View All Projects
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>

          <div className="projects-carousel__viewport">
            <div className="projects-carousel__track">
              {P.map((p) => <ProjectCard key={p.num} p={p} />)}
              <div className="projects-carousel__endcap">
                <span className="projects-carousel__endcap-mark">— End of reel —</span>
                <button
                  type="button"
                  className="projects-carousel__endcap-btn"
                  onClick={onViewAll}
                  data-cursor="hover"
                >
                  See all projects →
                </button>
              </div>
            </div>
          </div>

          <div className="projects-carousel__scroll" aria-hidden="true">
            <span>Continue</span>
            <span className="projects-carousel__scroll-line" />
          </div>
        </div>
      </section>
    </div>
  );
}

/* ===== All projects page ===== */
function ProjectsAll({ onBack }) {
  const [q, setQ] = useStateP("");
  const filtered = useMemoP(() => {
    const term = q.trim().toLowerCase();
    if (!term) return P;
    return P.filter((p) => {
      const hay = [
        p.title, p.role, p.year, p.what, p.did, p.learned,
        ...(p.tags || []), ...(p.tools || []),
      ].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(term);
    });
  }, [q]);

  return (
    <section className="projects-all" id="projects-all">
      <div className="projects-all__inner">
        <div className="projects-all__top">
          <button
            type="button"
            className="projects-all__back"
            onClick={onBack}
            data-cursor="hover"
          >
            <span aria-hidden="true">←</span> Back home
          </button>
          <div className="projects-all__count">
            {filtered.length} / {P.length} projects
          </div>
        </div>

        <header className="projects-all__head">
          <div className="section__num">[ <span>—</span> ] · Archive</div>
          <h1 className="projects-all__title">
            All <span className="serif">projects.</span>
          </h1>
          <p className="projects-all__lede">
            Every shipped thing — non-profits, audio, journalism, and the 6th-grade lemonade-stand origin. Search by name, stack, or year.
          </p>
        </header>

        <div className="projects-all__search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="search"
            placeholder="Search projects, tags, tools, years…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search projects"
            data-cursor="text"
          />
          {q && (
            <button
              type="button"
              className="projects-all__search-clear"
              onClick={() => setQ("")}
              aria-label="Clear search"
              data-cursor="hover"
            >
              ×
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="projects-all__empty">
            No projects matched <em>"{q}"</em>. Try fewer letters.
          </div>
        ) : (
          <div className="projects-all__grid">
            {filtered.map((p) => <ProjectGridItem key={p.num} p={p} />)}
          </div>
        )}
      </div>
    </section>
  );
}

function ProjectGridItem({ p }) {
  const canvasRef = useRefP(null);
  useEffectP(() => {
    if (canvasRef.current) paintPreview(canvasRef.current, p.preview);
    const onResize = () => {
      if (canvasRef.current) paintPreview(canvasRef.current, p.preview);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [p.preview]);

  return (
    <a
      href={p.href}
      target={p.href === "#" ? undefined : "_blank"}
      rel="noopener noreferrer"
      className="projects-all__card"
      data-cursor="hover"
    >
      <div className="projects-all__card-preview">
        <canvas ref={canvasRef} />
        <span className="projects-all__card-tag">↗ {p.year}</span>
      </div>
      <div className="projects-all__card-body">
        <div className="projects-all__card-meta">
          <span>{p.num}</span>
          <span>{p.year}</span>
        </div>
        <h3 className="projects-all__card-title">
          {p.title.split(" ").map((w, k, arr) => (
            <React.Fragment key={k}>
              {k === arr.length - 1 ? <span className="serif">{w}</span> : <>{w} </>}
            </React.Fragment>
          ))}
        </h3>
        <p className="projects-all__card-role">{p.role}</p>

        <div className="projects-all__card-section">
          <span className="projects-all__card-label">What it is</span>
          <p>{p.what}</p>
        </div>
        <div className="projects-all__card-section">
          <span className="projects-all__card-label">What I did</span>
          <p>{p.did}</p>
        </div>
        <div className="projects-all__card-section">
          <span className="projects-all__card-label">What I learned</span>
          <p>{p.learned}</p>
        </div>

        <div className="projects-all__card-tags">
          {p.tags.map((t, k) => (
            <span key={k} className="projects-all__card-tagchip">{t}</span>
          ))}
        </div>
        {p.tools && (
          <div className="projects-all__card-tools">
            <span className="projects-all__card-label">Tooling</span>
            <div>
              {p.tools.map((t, k) => (
                <span key={k} className="projects-all__card-tool">{t}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </a>
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
            <a href="https://www.linkedin.com/in/vivaan-shahani-a682303b7/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
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

Object.assign(window, { Projects, ProjectsAll, Contact, FooterStrip });

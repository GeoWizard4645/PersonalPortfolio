import React, { useEffect, useMemo, useRef, useState } from "react";
import DATA from "../data.js";
import { paintPreview } from "../previews.js";

const P = DATA.projects;

export default function ProjectsAll({ onBack }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
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
          <div className="section__num">[ <span>+</span> ] · Archive</div>
          <h1 className="projects-all__title">
            All <span className="serif">projects.</span>
          </h1>
          <p className="projects-all__lede">
            Every shipped thing: a startup, non-profits, embedded hardware, open source, audio, journalism, and the 6th-grade lemonade-stand origin. Search by name, stack, or year.
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
  const canvasRef = useRef(null);
  useEffect(() => {
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

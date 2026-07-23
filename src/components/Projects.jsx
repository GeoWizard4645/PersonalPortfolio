import React, { useEffect, useRef } from "react";
import DATA from "../data.js";
import SplitText from "./SplitText.jsx";
import { paintPreview } from "../previews.js";

const P = DATA.projects;

/* Carousel card, used in the horizontal carousel on the home page. */
function ProjectCard({ p }) {
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

export default function Projects({ onViewAll }) {
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
                Scroll down and the cards shift sideways. Hover a card or hit View All for the full archive.
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
                <span className="projects-carousel__endcap-mark">End of reel</span>
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

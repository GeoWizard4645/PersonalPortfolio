/* Interactive Resume — the white "document mode" section. */
const RD = window.PORTFOLIO_DATA.resume;
const { useState: useStateR } = React;

function Resume() {
  const [activeId, setActiveId] = useStateR(RD.tabs[0].id);
  const active = RD.tabs.find((t) => t.id === activeId);

  return (
    <section className="resume-wrap" id="resume">
      <div className="resume-doc">
        <header className="resume-doc__head">
          <div>
            <div className="section__num" style={{ color: "var(--doc-dim)" }}>
              [ <span style={{ color: "oklch(0.65 0.18 130)" }}>02</span> ] · Interactive Resume
            </div>
            <h2 className="resume-doc__title">
              Vivaan Shahani<span className="serif">,</span>
              <br />a one-page <span className="serif">résumé.</span>
            </h2>
            <div className="resume-doc__subtitle">10th grade · Edgemont '28 · Scarsdale, NY</div>
          </div>
          <div className="resume-doc__contact">
            <a href="mailto:vivaan.shahani@gmail.com">vivaan.shahani@gmail.com</a>
            <a href="tel:+19145207210">+1 914-520-7210</a>
            <a href="https://vivshahani.medium.com/" target="_blank" rel="noopener noreferrer">vivshahani.medium.com</a>
            <a href="https://github.com/GeoWizard4645" target="_blank" rel="noopener noreferrer">github.com/GeoWizard4645</a>
          </div>
        </header>

        <p className="resume-doc__summary" data-reveal>
          {RD.summary}
        </p>

        <nav className="resume-doc__tabs" aria-label="Resume sections">
          {RD.tabs.map((t, i) => (
            <button
              key={t.id}
              className={`resume-tab ${t.id === activeId ? "is-active" : ""}`}
              onClick={() => setActiveId(t.id)}
              data-cursor="hover"
            >
              <span className="resume-tab__num">{String(i + 1).padStart(2, "0")}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <div className="resume-doc__panel" key={activeId}>
          {active.entries && active.entries.map((e, i) => (
            <article className="resume-entry" key={i}>
              <div className="resume-entry__meta">
                <div>{e.period}</div>
                <div className="org">{e.org}</div>
                <div>{e.place}</div>
              </div>
              <div className="resume-entry__body">
                <h4>{e.title}</h4>
                {e.blurb && <p>{e.blurb}</p>}
                {e.bullets && (
                  <ul>
                    {e.bullets.map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                )}
              </div>
            </article>
          ))}
          {active.skills && (
            <div className="resume-skills">
              {active.skills.map((s, i) => (
                <div className="resume-skills__item" key={i}>
                  <span>{s.name}</span>
                  <span className="cat">{s.cat}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="resume-doc__actions">
          <a
            className="btn-doc btn-doc--solid"
            href="https://resume.vivaanshahani.com"
            target="_blank" rel="noopener noreferrer"
            data-cursor="hover"
          >
            View Traditional Résumé
            <span style={{ fontSize: 13 }}>↗</span>
          </a>
          <a className="btn-doc" href="mailto:vivaan.shahani@gmail.com" data-cursor="hover">
            Email me
            <span style={{ fontSize: 13 }}>→</span>
          </a>
          <a className="btn-doc" href="https://github.com/GeoWizard4645" target="_blank" rel="noopener noreferrer" data-cursor="hover">
            GitHub
            <span style={{ fontSize: 13 }}>↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}

window.Resume = Resume;

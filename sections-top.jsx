/* Hero + Marquee + About — top of page + shared SplitText */
const D = window.PORTFOLIO_DATA;
const { useEffect, useState, useRef } = React;

/* Split children into words; each word rises from below when an ancestor
   carrying [data-reveal].is-in (or .split.is-in) is in view. */
function SplitText({ children, delay = 0, step = 50, className = "" }) {
  // Recursively walk children; for strings, split by whitespace; for elements,
  // keep the element wrapper but split its inner text.
  let i = 0;
  function walk(node) {
    if (typeof node === "string") {
      const parts = node.split(/(\s+)/);
      return parts.map((p, k) => {
        if (/^\s+$/.test(p)) return p;
        if (!p) return null;
        const d = delay + i * step;
        i += 1;
        return (
          <span className="split__word" key={`w-${k}-${i}`}>
            <span style={{ "--d": `${d}ms` }}>{p}</span>
          </span>
        );
      });
    }
    if (Array.isArray(node)) return node.map(walk);
    if (React.isValidElement(node)) {
      return React.cloneElement(node, { ...node.props, children: walk(node.props.children) });
    }
    return node;
  }
  return <span className={`split ${className}`}>{walk(children)}</span>;
}

function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function Nav({ active, onNav }) {
  const now = useNow();
  const tz = now.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false, timeZone: "America/New_York",
  });
  const links = [
    { id: "about", label: "About", num: "01" },
    { id: "resume", label: "Resume", num: "02" },
    { id: "work", label: "Projects", num: "03" },
    { id: "contact", label: "Contact", num: "04" },
  ];
  return (
    <nav className="nav">
      <a href="#top" className="nav__brand" onClick={(e) => { e.preventDefault(); onNav("top"); }}>
        <span className="nav__brand-mark">VS</span>
        <span>Vivaan Shahani</span>
        <span style={{ opacity: 0.5 }}>©'26</span>
      </a>
      <div className="nav__center">
        {links.map((l) => (
          <a
            key={l.id}
            href={`#${l.id}`}
            className={`nav__link ${active === l.id ? "is-active" : ""}`}
            onClick={(e) => { e.preventDefault(); onNav(l.id); }}
          >
            <span className="nav__link-num">{l.num}</span>{l.label}
          </a>
        ))}
      </div>
      <div className="nav__right">
        <span className="nav__clock">
          <span className="nav__clock-dot" />
          NY · {tz}
        </span>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero__inner">
        <div className="hero__meta">
          <div className="hero__meta-block">
            <span className="hero__meta-block-label">Index</span>
            <span>Portfolio / Edition 02 / '26</span>
          </div>
          <div className="hero__meta-block" style={{ textAlign: "right" }}>
            <span className="hero__meta-block-label">Currently</span>
            <span>{D.hero.available} · {D.hero.location}</span>
          </div>
        </div>

        <h1 className="hero__title" data-cursor="text">
          <span className="hero__title-line"><span>Vivaan&nbsp;</span></span>
          <span className="hero__title-line"><span>Shahani<span className="serif">,</span></span></span>
          <span className="hero__title-line"><span><span className="stroke">a&nbsp;builder</span> <span className="serif">&amp;</span> writer.</span></span>
        </h1>

        <div className="hero__sub">
          <p className="hero__lede">
            10th-grade student, 4.00 GPA. Co-founder of <em>Debate101</em>, varsity debater, self-taught engineer, saxophonist, DJ. I move between fields on purpose — and looking for a real summer engineering role to ship in.
          </p>
          <div className="hero__scroll">
            <span>Scroll</span>
            <span className="hero__scroll-line" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = ["Python", "Java", "React", "Swift", "Web", "CAD", "Debate", "Saxophone", "DJ", "Writing", "Lacrosse", "Black Belt"];
  const row = (
    <span>
      {items.map((s, i) => (
        <React.Fragment key={i}>
          <span>{i % 2 === 0 ? s : <span className="ghost">{s}</span>}</span>
          <span className="dot" />
        </React.Fragment>
      ))}
    </span>
  );
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {row}{row}
      </div>
    </div>
  );
}

function About() {
  return (
    <section className="section" id="about">
      <div className="about">
        <div>
          <div className="section__num">[ <span>01</span> ] · About</div>
          <h2 className="about__heading" data-reveal>
            <SplitText>Built across</SplitText>{" "}
            <span className="serif"><SplitText delay={120}>debate, code,</SplitText></span>
            <br /><SplitText delay={260}>and the</SplitText>{" "}
            <span className="serif"><SplitText delay={400}>long-form essay.</SplitText></span>
          </h2>
        </div>
        <div className="about__body">
          {D.about.body.map((p, i) => (
            <p key={i} data-reveal style={{ "--rd": `${i * 80}ms` }}>{p}</p>
          ))}
          <div className="about__stats">
            {D.about.stats.map((s, i) => (
              <div key={i} data-reveal style={{ "--rd": `${i * 80}ms` }}>
                <div className="about__stat-num">
                  <span className="stat-rise"><span style={{ "--d": `${i * 80}ms` }}>{s.num}</span></span>
                  {s.unit ? <span className="unit">{s.unit}</span> : null}
                </div>
                <div className="about__stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Nav, Hero, Marquee, About, SplitText });

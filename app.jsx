/* Main app — wires sections, active-section nav, scroll reveals,
   and the Tweaks panel. Per-section exit motion lives in transitions.js. */
const { useState: useStateA, useEffect: useEffectA, useRef: useRefA } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#7dd3fc",
  "bgMode": "grid",
  "cursorEnabled": true,
  "fxMode": "cinematic"
}/*EDITMODE-END*/;

const ACCENT_OPTIONS = ["#7dd3fc", "#a78bfa", "#fb923c", "#f472b6"];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [active, setActive] = useStateA("about");

  // Apply tweaks to DOM
  useEffectA(() => {
    document.documentElement.style.setProperty("--accent", t.accent);
    document.body.setAttribute("data-bg-mode", t.bgMode);
    document.body.setAttribute("data-fx-mode", t.fxMode);
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    if (dot) dot.style.display = t.cursorEnabled ? "" : "none";
    if (ring) ring.style.display = t.cursorEnabled ? "" : "none";
    document.body.style.cursor = t.cursorEnabled ? "none" : "auto";
  }, [t.accent, t.bgMode, t.cursorEnabled, t.fxMode]);

  // Smooth scroll handler
  function goTo(id) {
    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }

  // IntersectionObserver — active section + reveals + fold-line activation
  useEffectA(() => {
    const sections = ["about", "resume", "work", "contact"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const navObs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    sections.forEach((s) => navObs.observe(s));

    const revObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            revObs.unobserve(e.target);
          }
        });
      },
      { rootMargin: "-10% 0px -10% 0px", threshold: 0.05 }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => revObs.observe(el));

    const foldObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          e.target.classList.toggle("is-active", e.isIntersecting);
        });
      },
      { threshold: 0.5 }
    );
    document.querySelectorAll(".fold-line").forEach((el) => foldObs.observe(el));

    return () => { navObs.disconnect(); revObs.disconnect(); foldObs.disconnect(); };
  }, []);

  return (
    <>
      <Nav active={active} onNav={goTo} />
      <div className="page">
        <div className="pin-wrap" data-pin="hero"><Hero /></div>
        <Marquee />
        <div className="pin-wrap" data-pin="about">
          <About />
        </div>
        <Resume />
        <div className="pin-wrap" data-pin="split">
          <div className="split-stage" data-screen-label="Split Transition">
            <div className="split-stage__bg" aria-hidden="true">
              <div className="split-stage__teaser">
                <span className="split-stage__eyebrow">↓ Continue</span>
                <span className="split-stage__mark">03</span>
                <span className="split-stage__label">Selected <span className="serif">Work</span></span>
              </div>
            </div>
            <div className="split-stage__half split-stage__half--top" aria-hidden="true">
              <span className="split-stage__edge">— Résumé end —</span>
            </div>
            <div className="split-stage__half split-stage__half--bot" aria-hidden="true">
              <div className="split-stage__sketch">
                <span className="split-stage__sketch-mark">— Page 2 of 2 —</span>
                <svg className="split-stage__sketch-svg" viewBox="0 0 400 90" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <circle cx="16" cy="45" r="3.4" fill="currentColor" stroke="none" />
                  <path d="M16 45 C 50 12, 86 78, 122 45 S 196 12, 232 45 S 308 78, 344 45" />
                  <path d="M340 32 L 366 45 L 340 58" />
                  <path d="M82 70 q 6 6 12 0 t 12 0 t 12 0" opacity="0.55" />
                  <path d="M250 70 q 6 6 12 0 t 12 0 t 12 0" opacity="0.55" />
                </svg>
                <span className="split-stage__sketch-note">done, but never finished.</span>
                <span className="split-stage__sketch-sig">— </span>
              </div>
            </div>
          </div>
        </div>
        <Projects />
        <Contact />
        <FooterStrip />
      </div>

      <TweaksPanel title="Portfolio Tweaks">
        <TweakSection label="Accent">
          <TweakColor
            label="Accent color"
            value={t.accent}
            options={ACCENT_OPTIONS}
            onChange={(v) => setTweak("accent", v)}
          />
        </TweakSection>
        <TweakSection label="Transitions">
          <TweakRadio
            label="Section motion"
            value={t.fxMode}
            options={["cinematic", "subtle", "off"]}
            onChange={(v) => setTweak("fxMode", v)}
          />
        </TweakSection>
        <TweakSection label="Background">
          <TweakRadio
            label="Mode"
            value={t.bgMode}
            options={["grid", "mesh", "noise"]}
            onChange={(v) => setTweak("bgMode", v)}
          />
        </TweakSection>
        <TweakSection label="Cursor">
          <TweakToggle
            label="Custom cursor"
            value={t.cursorEnabled}
            onChange={(v) => setTweak("cursorEnabled", v)}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

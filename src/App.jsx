import React, { useEffect, useState } from "react";
import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import Marquee from "./components/Marquee.jsx";
import About from "./components/About.jsx";
import Resume from "./components/Resume.jsx";
import Projects from "./components/Projects.jsx";
import ProjectsAll from "./components/ProjectsAll.jsx";
import Contact, { FooterStrip } from "./components/Contact.jsx";
import ArrowKeysHint from "./components/ArrowKeysHint.jsx";
import { initFx, reinitFx } from "./fx/scrollFx.js";

function readRoute() {
  return window.location.pathname.replace(/\/$/, "") === "/projects" ? "projects-all" : "home";
}

export default function App() {
  const [active, setActive] = useState("about");
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onPopState = () => setRoute(readRoute());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    document.body.setAttribute("data-route", route);
    window.scrollTo({ top: 0 });
  }, [route]);

  // Smooth scroll handler
  function goTo(id) {
    if (route === "projects-all") {
      // Leaving the archive: set path, then scroll once home renders.
      window.history.pushState({}, "", "/");
      setRoute("home");
      requestAnimationFrame(() => requestAnimationFrame(() => goTo(id)));
      return;
    }
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

  function openProjectsAll() {
    window.history.pushState({}, "", "/projects");
    setRoute("projects-all");
  }
  function closeProjectsAll() {
    window.history.pushState({}, "", "/");
    setRoute("home");
  }

  // First-mount FX boot.
  useEffect(() => { initFx(); }, []);

  // IntersectionObserver: active section + reveals + fold-line activation.
  // Re-binds across route changes because the home DOM tree unmounts/remounts.
  useEffect(() => {
    let cleanup;
    const setup = () => {
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

      // Re-prep the scroll-fx engine now that the new DOM is live.
      reinitFx();

      cleanup = () => { navObs.disconnect(); revObs.disconnect(); foldObs.disconnect(); };
    };
    // Wait a tick so the new tree is mounted before observing.
    const id = requestAnimationFrame(setup);
    return () => {
      cancelAnimationFrame(id);
      if (cleanup) cleanup();
    };
  }, [route]);

  return (
    <>
      <Nav active={route === "projects-all" ? "work" : active} onNav={goTo} />
      {route === "projects-all" ? (
        <div className="page page--archive">
          <ProjectsAll onBack={closeProjectsAll} />
          <FooterStrip />
        </div>
      ) : (
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
                  <span className="split-stage__eyebrow">Continue</span>
                  <ArrowKeysHint />
                  <span className="split-stage__mark">03</span>
                  <span className="split-stage__label"><span className="serif">Projects</span></span>
                </div>
              </div>
              <div className="split-stage__half split-stage__half--top" aria-hidden="true">
                <span className="split-stage__edge">Résumé end</span>
              </div>
              <div className="split-stage__half split-stage__half--bot" aria-hidden="true">
                <div className="split-stage__sketch">
                  <span className="split-stage__sketch-mark">Page 2 of 2</span>
                  <svg className="split-stage__sketch-svg" viewBox="0 0 400 90" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <circle cx="16" cy="45" r="3.4" fill="currentColor" stroke="none" />
                    <path d="M16 45 C 50 12, 86 78, 122 45 S 196 12, 232 45 S 308 78, 344 45" />
                    <path d="M340 32 L 366 45 L 340 58" />
                    <path d="M82 70 q 6 6 12 0 t 12 0 t 12 0" opacity="0.55" />
                    <path d="M250 70 q 6 6 12 0 t 12 0 t 12 0" opacity="0.55" />
                  </svg>
                  <span className="split-stage__sketch-note">done, but never finished.</span>
                </div>
              </div>
            </div>
          </div>
          <Projects onViewAll={openProjectsAll} />
          <Contact />
          <FooterStrip />
        </div>
      )}
    </>
  );
}

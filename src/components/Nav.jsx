import React, { useEffect, useState } from "react";

function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export default function Nav({ active, onNav }) {
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
        <a
          href="https://vivaanshahani.com/caduceus"
          className="nav__caduceus-hint"
          target="_blank"
          rel="noopener noreferrer"
        >
          looking for caduceus?
        </a>
        <span className="nav__clock">
          <span className="nav__clock-dot" />
          NY · {tz}
        </span>
      </div>
    </nav>
  );
}

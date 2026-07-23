import React from "react";
import D from "../data.js";
import SplitText from "./SplitText.jsx";

export default function About() {
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

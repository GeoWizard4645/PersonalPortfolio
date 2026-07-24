import React from "react";
import D from "../data.js";
import ArrowKeysHint from "./ArrowKeysHint.jsx";

/* Once May rolls around, that summer's application window is basically
   closed, so point at next year's instead - keeps this line accurate
   forever without a yearly edit. */
function availabilityLabel() {
  const now = new Date();
  const summerYear = now.getMonth() >= 4 ? now.getFullYear() + 1 : now.getFullYear();
  return `Available for Summer '${String(summerYear).slice(-2)}`;
}

/* The big hero. The scroll FX engine (fx/scrollFx.js) splits the title into
   per-letter dual layers at runtime: an outline ghost that stays put and a
   filled glyph that drops off the bottom of the screen as you scroll. */
export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero__inner">
        <div className="hero__meta">
          <div className="hero__meta-block">
            <span className="hero__meta-block-label">Index</span>
            <span>Portfolio / Edition 03 / '26</span>
          </div>
          <div className="hero__meta-block" style={{ textAlign: "right" }}>
            <span className="hero__meta-block-label">Currently</span>
            <span>{availabilityLabel()} · {D.hero.location}</span>
          </div>
        </div>

        <h1 className="hero__title" data-cursor="text">
          <span className="hero__title-line"><span>Vivaan&nbsp;</span></span>
          <span className="hero__title-line"><span>Shahani<span className="serif">,</span></span></span>
          <span className="hero__title-line"><span><span className="stroke">a&nbsp;builder</span> <span className="serif">&amp;</span> writer.</span></span>
        </h1>

        <div className="hero__sub">
          <p className="hero__lede">
            10th-grade student, 4.00 GPA. COO of <em>FitFo</em>, co-founder of <em>Debate101</em>, varsity debater, self-taught engineer, saxophonist, DJ. I move between fields on purpose, and I'm looking for a real summer engineering role to ship in.
          </p>
          <div className="hero__scroll-wrap">
            <div className="hero__scroll">
              <span>Scroll</span>
            </div>
            <ArrowKeysHint />
          </div>
        </div>
      </div>
    </section>
  );
}

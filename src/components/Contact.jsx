import React from "react";
import SplitText from "./SplitText.jsx";

export default function Contact() {
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
            <a href="https://fitfo.app" target="_blank" rel="noopener noreferrer">FitFo ↗</a>
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

export function FooterStrip() {
  return (
    <div className="footer-strip">
      <span>© '26 Vivaan Shahani / All work my own.</span>
      <span>Built with React + Vite · v3</span>
    </div>
  );
}

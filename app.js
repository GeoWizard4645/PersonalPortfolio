/* ===========================================================
   Vivaan Shahani — portfolio app.js
   -----------------------------------------------------------
   Powers:
     • Smooth-scroll snap from hero → resume
     • Orbital animation (single rAF loop, both rings)
     • Resume modal open/close + focus management
     • Year stamp in footer

   Edit RESUME_DATA below to update what each orbit node shows.
   Each entry needs: id, label, ring (1 inner, 2 outer),
   angle (degrees on its ring), color hint, svg icon, modal body.
   =========================================================== */

(() => {
  "use strict";

  /* ---------- 0. Tiny helpers ---------- */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* SVG icon strings used inline (lucide-flavored, simple) */
  const ICONS = {
    scale: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M3 7h18M6 7l-3 7a4 4 0 0 0 6 0l-3-7Zm12 0l-3 7a4 4 0 0 0 6 0l-3-7Z"/></svg>`,
    headphones: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><rect x="3" y="14" width="5" height="7" rx="1.5"/><rect x="16" y="14" width="5" height="7" rx="1.5"/></svg>`,
    pen: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7H12v-3Z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>`,
    code: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/></svg>`,
    cap: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5a6 6 0 0 0 12 0v-5"/></svg>`,
    spark: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></svg>`,
  };

  /* ---------- 1. Resume data (EDIT ME) ----------
     Each node orbits a "ring":
       ring 1 = inner (smaller radius, faster)
       ring 2 = outer (larger radius, slower)
     `angle` is the starting offset (deg) on that ring.
  ---------------------------------------------- */
  const RESUME_DATA = [
    {
      id: "debate",
      label: "Debate",
      ring: 1,
      angle: 30,
      icon: ICONS.scale,
      eyebrow: "Founder & Builder",
      title: "Debate101",
      meta: "debate101.org · self-directed",
      body: `
        <p>Started Debate101 to lower the barrier-to-entry for new debaters — built the platform, wrote the curriculum, and grew the community.</p>
        <ul>
          <li>Designed UX, prototyped front-end, and shipped the live site.</li>
          <li>Authored training material drawing on personal competition experience.</li>
          <li>Owned everything from positioning to outreach.</li>
        </ul>
      `,
    },
    {
      id: "dj",
      label: "DJ & Audio",
      ring: 1,
      angle: 210,
      icon: ICONS.headphones,
      eyebrow: "Performer · Producer",
      title: "DJ Work",
      meta: "geowizard4645.github.io/DJ",
      body: `
        <p>Mixing as a creative side practice — built a personal DJ landing page from scratch as both a portfolio and a booking surface.</p>
        <ul>
          <li>Designed and coded the site (vanilla HTML/CSS/JS).</li>
          <li>Performed at school and community events.</li>
          <li>Use it as a sandbox for audio-driven web experiments.</li>
        </ul>
      `,
    },
    {
      id: "writer",
      label: "Writer",
      ring: 2,
      angle: 0,
      icon: ICONS.pen,
      eyebrow: "Long-form Essays",
      title: "Medium",
      meta: "vivshahani.medium.com",
      body: `
        <p>I write about ideas at the intersection of technology, debate, and growing up online. Medium is where I publish the longer pieces.</p>
        <ul>
          <li>Self-edited essays; some have crossed into wider circulation.</li>
          <li>Writing keeps the engineering work grounded in why.</li>
        </ul>
      `,
    },
    {
      id: "builder",
      label: "Builder",
      ring: 2,
      angle: 90,
      icon: ICONS.code,
      eyebrow: "Engineer-in-Training",
      title: "Code & Tinkering",
      meta: "github.com/GeoWizard4645",
      body: `
        <p>Coding since 6th grade — started with a "Lemonade Stand" project and never really stopped. Comfortable across the front-end web stack and willing to learn whatever's needed for the project at hand.</p>
        <ul>
          <li>Vanilla web (HTML/CSS/JS) — preferred for control and clarity.</li>
          <li>Comfortable with Git, GitHub Pages, basic Cloudflare deploys.</li>
          <li>Looking for internships where I can ship real code.</li>
        </ul>
      `,
    },
    {
      id: "education",
      label: "Education",
      ring: 2,
      angle: 180,
      icon: ICONS.cap,
      eyebrow: "Student",
      title: "Academics",
      meta: "High school · CS-focused",
      body: `
        <p>Currently a student focused on computer science and the humanities side of communication.</p>
        <ul>
          <li>Coursework in CS, math, English, and history.</li>
          <li>Self-study in web platform internals.</li>
          <li>Update this block with your school + GPA when ready.</li>
        </ul>
      `,
    },
    {
      id: "activities",
      label: "Leadership",
      ring: 2,
      angle: 270,
      icon: ICONS.spark,
      eyebrow: "Activities",
      title: "Leadership & Community",
      meta: "Clubs · Speech · Service",
      body: `
        <p>Roles outside the classroom — speech & debate captaincy, club leadership, community work.</p>
        <ul>
          <li>Drop your specific officer / captain roles here.</li>
          <li>Community service hours, awards, etc.</li>
        </ul>
      `,
    },
  ];

  /* ---------- 2. Smooth snap-scroll triggers ---------- */
  function wireScrollTriggers() {
    $$("[data-scroll-to]").forEach((el) => {
      el.addEventListener("click", (e) => {
        const id = el.getAttribute("data-scroll-to");
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  /* ---------- 3. Orbital animation ----------
     We position the .orbit-nodes div as a single relative coordinate
     system and place each node at center, then translate using a
     CSS transform that we update each frame.

     This is one rAF loop driving every node — fewer animations, smoother.
  ------------------------------------------------- */
  function buildOrbits() {
    const system = $("#orbit-system");
    const layer  = $("#orbit-nodes");
    if (!system || !layer) return;

    // Ring config — radii are percentages of the system size
    const RINGS = {
      1: { radiusPct: 0.30, speedDeg: 14 }, // deg / second
      2: { radiusPct: 0.46, speedDeg:  8 },
    };

    const nodes = RESUME_DATA.map((item) => {
      const btn = document.createElement("button");
      btn.className = "orbit-node";
      btn.type = "button";
      btn.setAttribute("data-id", item.id);
      btn.setAttribute("aria-label", `${item.title} — open detail`);
      btn.innerHTML = `${item.icon}<span class="orbit-node-label">${item.label}</span>`;
      btn.addEventListener("click", () => openModal(item));
      layer.appendChild(btn);
      return { ...item, el: btn };
    });

    // Animation state per node
    const state = nodes.map((n) => ({
      el: n.el,
      ring: n.ring,
      angle: (n.angle || 0) * (Math.PI / 180),
    }));

    let last = performance.now();
    let paused = false;

    // Pause when tab hidden so we don't burn cycles
    document.addEventListener("visibilitychange", () => {
      paused = document.hidden;
      last = performance.now();
    });

    // Pause when user hovers a node so they can click it without it sliding away
    layer.addEventListener("pointerenter", () => (paused = true), true);
    layer.addEventListener("pointerleave", () => {
      paused = false;
      last = performance.now();
    }, true);

    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000); // clamp big gaps
      last = now;

      const sysSize = system.getBoundingClientRect().width;

      if (!paused) {
        for (const s of state) {
          const cfg = RINGS[s.ring];
          // inner ring goes one way, outer the other (visual variety)
          const dir = s.ring === 1 ? 1 : -1;
          s.angle += dir * (cfg.speedDeg * Math.PI / 180) * dt;
        }
      }

      for (const s of state) {
        const cfg = RINGS[s.ring];
        const r = cfg.radiusPct * sysSize;
        const x = Math.cos(s.angle) * r;
        const y = Math.sin(s.angle) * r;
        s.el.style.transform = `translate(${x}px, ${y}px)`;
      }

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- 4. Modal ---------- */
  let lastFocus = null;

  function openModal(item) {
    const modal = $("#modal");
    if (!modal) return;
    lastFocus = document.activeElement;

    $("#modal-eyebrow").textContent = item.eyebrow || "";
    $("#modal-title").textContent   = item.title || "";
    $("#modal-meta").textContent    = item.meta || "";
    $("#modal-icon").innerHTML      = item.icon || "";
    $("#modal-body").innerHTML      = item.body || "";

    modal.hidden = false;
    document.body.style.overflow = "hidden";

    // Focus close button for keyboard users
    requestAnimationFrame(() => $(".modal-close", modal)?.focus());
  }

  function closeModal() {
    const modal = $("#modal");
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  function wireModal() {
    $$('[data-close]').forEach((el) => el.addEventListener("click", closeModal));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

  /* ---------- 5. Misc ---------- */
  function stampYear() {
    const y = $("#year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    stampYear();
    wireScrollTriggers();
    wireModal();
    // Only build orbits if the system exists (home page)
    if ($("#orbit-system")) buildOrbits();
  });
})();

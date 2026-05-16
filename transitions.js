/* ============================================================
   Per-section exit transitions — driven by scroll position.
   Each section has its OWN motion personality; no blur.

   1. HERO       → letters fall like rain (gravity, stagger, drift)
   2. ABOUT      → heading words scatter L/R; body shrinks up
   3. RESUME     → lift-and-flip (3D pivot at bottom, tilts away)
   4. PROJECTS   → rows sling off horizontally, alternating dirs

   Tweak modes: 'cinematic' (full), 'subtle' (~40%), 'off' (no-op).
   ============================================================ */
(function () {
  const state = {
    hero: null, about: null, resume: null, projects: null,
  };
  let ticking = false;
  let initialized = false;
  let mode = "cinematic";
  let scale = 1;

  /* ---------- helpers ---------- */

  // Seeded-ish pseudo-random by index — stable across reloads.
  function rng(i, salt = 1) {
    const v = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
    return v - Math.floor(v); // 0..1
  }

  // Split a root element's text into <span data-fall> tokens (per-letter).
  // Preserves existing element wrappers (.serif, .stroke, etc.).
  function splitLetters(root) {
    if (root.dataset.fxSplit === "letters") {
      return Array.from(root.querySelectorAll('[data-fall="l"]'));
    }
    const created = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const textNodes = [];
    let n;
    while ((n = walker.nextNode())) {
      if (n.nodeValue && n.nodeValue.length) textNodes.push(n);
    }
    textNodes.forEach((node) => {
      const text = node.nodeValue;
      if (!text) return;
      const frag = document.createDocumentFragment();
      for (const ch of text) {
        if (/\s/.test(ch)) {
          frag.appendChild(document.createTextNode(ch));
          continue;
        }
        const s = document.createElement("span");
        s.textContent = ch;
        s.setAttribute("data-fall", "l");
        s.style.display = "inline-block";
        s.style.willChange = "transform, opacity";
        frag.appendChild(s);
        created.push(s);
      }
      node.parentNode.replaceChild(frag, node);
    });
    root.dataset.fxSplit = "letters";
    return created;
  }

  // Split a root's text into word tokens.
  function splitWordsIn(root) {
    if (root.dataset.fxSplit === "words") {
      return Array.from(root.querySelectorAll('[data-fall="w"]'));
    }
    const created = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const textNodes = [];
    let n;
    while ((n = walker.nextNode())) {
      if (n.nodeValue && n.nodeValue.length) textNodes.push(n);
    }
    textNodes.forEach((node) => {
      const text = node.nodeValue;
      if (!text.trim()) return;
      const parts = text.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      parts.forEach((p) => {
        if (!p.length) return;
        if (/^\s+$/.test(p)) {
          frag.appendChild(document.createTextNode(p));
          return;
        }
        const s = document.createElement("span");
        s.textContent = p;
        s.setAttribute("data-fall", "w");
        s.style.display = "inline-block";
        s.style.willChange = "transform, opacity";
        frag.appendChild(s);
        created.push(s);
      });
      node.parentNode.replaceChild(frag, node);
    });
    root.dataset.fxSplit = "words";
    return created;
  }

  /* Exit progress for a section. Returns 0 while the section is in
     view, 1 once its bottom is well above the viewport top. */
  function exitProgress(el) {
    const vh = window.innerHeight;
    const r = el.getBoundingClientRect();
    const start = vh * 0.65;   // when bottom is at 65% of vh, begin exiting
    const end   = -vh * 0.25;  // when bottom is 25% above viewport, fully exited
    if (r.bottom >= start) return 0;
    if (r.bottom <= end) return 1;
    return (start - r.bottom) / (start - end);
  }

  /* Per-section progress for projects — use the section element. */
  function exitProgressFromTop(el) {
    const vh = window.innerHeight;
    const r = el.getBoundingClientRect();
    // Begin once the section's TOP starts going negative
    const start = vh * 0.2;
    const end   = -vh * 0.6;
    if (r.top >= start) return 0;
    if (r.top <= end) return 1;
    return (start - r.top) / (start - end);
  }

  /* ---------- prep ---------- */

  function prepHero() {
    const hero = document.querySelector(".hero");
    if (!hero) return false;

    // Letter-split inside each hero__title-line > span (the inner span
    // that owns the rise-in animation). That keeps the rise animation
    // intact at the parent level and lets us drop individual glyphs.
    const titleInners = hero.querySelectorAll(".hero__title-line > span");
    const titleLetters = [];
    titleInners.forEach((inner) => {
      titleLetters.push(...splitLetters(inner));
    });

    // Other hero content: word-level is plenty.
    const otherRoots = [
      ...hero.querySelectorAll(".hero__lede"),
      ...hero.querySelectorAll(".hero__meta-block"),
      ...hero.querySelectorAll(".hero__scroll"),
    ];
    const otherWords = [];
    otherRoots.forEach((root) => otherWords.push(...splitWordsIn(root)));

    // Stamp per-token randomness so the fall feels organic.
    titleLetters.forEach((el, i) => {
      el._dx = (rng(i, 3) - 0.5) * 280;
      el._rot = (rng(i, 7) - 0.5) * 720;
      // delay biased by horizontal position — letters at the edges fall first
      const rect = el.getBoundingClientRect();
      const center = window.innerWidth / 2;
      const edgeBias = Math.min(1, Math.abs((rect.left + rect.width / 2) - center) / (window.innerWidth / 2));
      el._delay = rng(i, 11) * 0.25 + (1 - edgeBias) * 0.05;
    });
    otherWords.forEach((el, i) => {
      el._dx = (rng(i, 13) - 0.5) * 160;
      el._rot = (rng(i, 17) - 0.5) * 360;
      el._delay = 0.05 + rng(i, 19) * 0.35;
    });

    state.hero = { el: hero, titleLetters, otherWords };
    return true;
  }

  function prepAbout() {
    const aboutSec = document.getElementById("about");
    if (!aboutSec) return false;
    const heading = aboutSec.querySelector(".about__heading");

    // The heading already contains <span class="split__word">..</span>
    // produced by the React SplitText component. Re-use those — they
    // are inline-flex word boxes that compose cleanly with translateX.
    let headingWords = heading
      ? Array.from(heading.querySelectorAll(".split__word"))
      : [];

    // Fallback: if SplitText didn't render for some reason, split words live.
    if (headingWords.length === 0 && heading) {
      headingWords = splitWordsIn(heading);
    }

    headingWords.forEach((el, i) => {
      el._dir = i % 2 === 0 ? -1 : 1;
      el._delay = (i / Math.max(1, headingWords.length)) * 0.3;
    });

    const bodyRows = Array.from(
      aboutSec.querySelectorAll(".about__body p, .about__stats > div")
    );

    state.about = { el: aboutSec, headingWords, bodyRows };
    return true;
  }

  function prepResume() {
    const el = document.querySelector(".resume-wrap");
    if (!el) return false;
    state.resume = { el };
    return true;
  }

  function prepProjects() {
    const el = document.querySelector(".projects");
    if (!el) return false;
    const rows = Array.from(el.querySelectorAll(".project-row"));
    state.projects = { el, rows };
    return true;
  }

  /* ---------- apply ---------- */

  function applyHero() {
    const s = state.hero;
    if (!s) return;
    const vh = window.innerHeight;
    const p = exitProgress(s.el);

    // Title letters — gravity (t²) fall with stagger and tumble.
    s.titleLetters.forEach((el) => {
      const local = Math.max(0, Math.min(1, (p - el._delay) / Math.max(0.001, 1 - el._delay)));
      const tg = local * local; // gravity acceleration
      if (local === 0) {
        el.style.transform = "";
        el.style.opacity = "";
        return;
      }
      const ty = tg * vh * 1.8 * scale;
      const tx = el._dx * local * scale;
      const rot = el._rot * local * scale;
      const op = 1 - Math.max(0, local - 0.7) / 0.3;
      el.style.transform =
        `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) rotate(${rot.toFixed(1)}deg)`;
      el.style.opacity = op.toFixed(3);
    });

    // Lede / meta / scroll words — softer fall, slightly later.
    s.otherWords.forEach((el) => {
      const startP = 0.04 + el._delay * 0.4;
      const local = Math.max(0, Math.min(1, (p - startP) / Math.max(0.001, 1 - startP)));
      const tg = local * local;
      if (local === 0) {
        el.style.transform = "";
        el.style.opacity = "";
        return;
      }
      const ty = tg * vh * 1.5 * scale;
      const tx = el._dx * local * 0.5 * scale;
      const rot = el._rot * local * 0.4 * scale;
      const op = 1 - Math.max(0, local - 0.7) / 0.3;
      el.style.transform =
        `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) rotate(${rot.toFixed(1)}deg)`;
      el.style.opacity = op.toFixed(3);
    });
  }

  function applyAbout() {
    const s = state.about;
    if (!s) return;
    const vw = window.innerWidth;
    const p = exitProgress(s.el);

    // Heading words scatter horizontally (alternating L/R) with rotation.
    s.headingWords.forEach((el) => {
      const local = Math.max(0, Math.min(1, (p - el._delay) / Math.max(0.001, 1 - el._delay)));
      if (local === 0) {
        el.style.transform = "";
        el.style.opacity = "";
        return;
      }
      const tx = el._dir * local * vw * 0.75 * scale;
      const rot = el._dir * local * 28 * scale;
      const op = 1 - local;
      el.style.transform = `translateX(${tx.toFixed(1)}px) rotate(${rot.toFixed(1)}deg)`;
      el.style.opacity = op.toFixed(3);
    });

    // Body rows: rise & shrink (the inverse of an entry).
    s.bodyRows.forEach((el, i) => {
      const delay = 0.1 + i * 0.05;
      const local = Math.max(0, Math.min(1, (p - delay) / Math.max(0.001, 1 - delay)));
      if (local === 0) {
        el.style.transform = "";
        el.style.opacity = "";
        return;
      }
      const ty = -local * 110 * scale;
      const sc = 1 - local * 0.18 * scale;
      const op = Math.max(0, 1 - local * 1.2);
      el.style.transform =
        `translateY(${ty.toFixed(1)}px) scale(${sc.toFixed(3)})`;
      el.style.opacity = op.toFixed(3);
    });
  }

  function applyResume() {
    const s = state.resume;
    if (!s) return;
    const vh = window.innerHeight;
    const p = exitProgress(s.el);
    if (p === 0) {
      s.el.style.transform = "";
      s.el.style.opacity = "";
      s.el.style.transformOrigin = "";
      return;
    }
    // Lift-and-flip — pivots at the bottom, top edge tilts away from viewer.
    s.el.style.transformOrigin = "50% 100%";
    const ty  = -p * vh * 0.42 * scale;
    const rotX = p * 58 * scale;
    const sc  = 1 - p * 0.18 * scale;
    const op  = 1 - p * 0.65;
    s.el.style.transform =
      `translateY(${ty.toFixed(1)}px) rotateX(${rotX.toFixed(1)}deg) scale(${sc.toFixed(3)})`;
    s.el.style.opacity = op.toFixed(3);
  }

  function applyProjects() {
    const s = state.projects;
    if (!s) return;
    const vw = window.innerWidth;
    const p = exitProgressFromTop(s.el);

    // Each row gets staggered horizontal slingshot. Alternating directions
    // so the section "shears apart" as the user scrolls past.
    s.rows.forEach((row, i) => {
      const delay = i * 0.12;
      const local = Math.max(0, Math.min(1, (p - delay) / Math.max(0.001, 1 - delay)));
      if (local === 0) {
        row.style.transform = "";
        row.style.opacity = "";
        return;
      }
      const dir = i % 2 === 0 ? -1 : 1;
      const tx = dir * local * vw * 0.95 * scale;
      const rot = dir * local * 10 * scale;
      const ty = local * 30 * scale;
      const op = Math.max(0, 1 - local * 1.15);
      row.style.transform =
        `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) rotate(${rot.toFixed(2)}deg)`;
      row.style.opacity = op.toFixed(3);
    });
  }

  function update() {
    if (mode === "off") return;
    applyHero();
    applyAbout();
    applyResume();
    applyProjects();
  }

  function resetAll() {
    function clearList(list) {
      list && list.forEach((el) => {
        el.style.transform = "";
        el.style.opacity = "";
      });
    }
    if (state.hero) {
      clearList(state.hero.titleLetters);
      clearList(state.hero.otherWords);
    }
    if (state.about) {
      clearList(state.about.headingWords);
      clearList(state.about.bodyRows);
    }
    if (state.resume) {
      state.resume.el.style.transform = "";
      state.resume.el.style.opacity = "";
      state.resume.el.style.transformOrigin = "";
    }
    if (state.projects) {
      clearList(state.projects.rows);
    }
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => { update(); ticking = false; });
      ticking = true;
    }
  }

  function setMode(m) {
    mode = m === "off" || m === "subtle" || m === "cinematic" ? m : "cinematic";
    scale = mode === "subtle" ? 0.45 : 1;
    if (mode === "off") {
      resetAll();
    } else {
      update();
    }
  }

  function tryInit() {
    if (initialized) return;
    const ready =
      prepHero() & prepAbout() & prepResume() & prepProjects();
    if (!ready) {
      setTimeout(tryInit, 80);
      return;
    }
    initialized = true;

    // Free the hero title from its overflow:hidden mask once the
    // initial rise-in animation has played out. Letters can then fall.
    setTimeout(() => {
      document.querySelectorAll(".hero__title-line").forEach((el) => {
        el.style.overflow = "visible";
      });
    }, 1400);

    // Watch the body for mode changes from the Tweaks panel.
    const obs = new MutationObserver(() => {
      const m = document.body.getAttribute("data-fx-mode") || "cinematic";
      if (m !== mode) setMode(m);
    });
    obs.observe(document.body, { attributes: true, attributeFilter: ["data-fx-mode"] });

    // Initial pickup
    const initialMode = document.body.getAttribute("data-fx-mode") || "cinematic";
    setMode(initialMode);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  // Wait until React has mounted the sections.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(tryInit, 120));
  } else {
    setTimeout(tryInit, 120);
  }

  window.__portfolioFx = { update, resetAll, setMode };
})();

/* ============================================================
   Scroll-driven per-section exit transitions.

   Pinned (sticky 100vh inside an N-vh wrapper, scroll scrubs):
     HERO   → every letter (title + lede + meta + scroll word)
              falls under gravity, lands, and STACKS like blocks
              — pre-computed pile positions prevent overlap.
     ABOUT  → heading words scatter L/R; body shrinks up.
     SPLIT  → white sheet split in half; top half slides up,
              bottom half slides down, revealing Selected Work
              eyebrow + dark bg behind. Sits between Résumé
              and Projects.

   Unpinned (animates as section exits viewport top):
     PROJECTS → rows slingshot horizontally, alternating dirs
   ============================================================ */
(function () {
  const state = { hero: null, about: null, split: null, projects: null, projectsCarousel: null };
  let ticking = false;
  let initialized = false;
  let mode = "cinematic";
  let scale = 1;
  const MOBILE_MQ = window.matchMedia("(max-width: 760px)");
  let isMobile = MOBILE_MQ.matches;

  /* ---------- helpers ---------- */

  function rng(i, salt = 1) {
    const v = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
    return v - Math.floor(v);
  }

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
        if (/\s/.test(ch)) { frag.appendChild(document.createTextNode(ch)); continue; }
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
        if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
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

  function pinProgress(wrap) {
    const rect = wrap.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = wrap.offsetHeight - vh;
    if (total <= 0) return 0;
    return Math.max(0, Math.min(1, -rect.top / total));
  }

  function exitTopProgress(el) {
    const vh = window.innerHeight;
    const r = el.getBoundingClientRect();
    const start = vh * 0.20;
    const end   = -vh * 0.10;
    if (r.bottom >= start) return 0;
    if (r.bottom <= end) return 1;
    return (start - r.bottom) / (start - end);
  }

  /* ---------- prep ---------- */

  function prepHero() {
    const wrap = document.querySelector('.pin-wrap[data-pin="hero"]');
    const hero = document.querySelector(".hero");
    if (!wrap || !hero) return false;

    const titleInners = hero.querySelectorAll(".hero__title-line > span");
    const titleLetters = [];
    titleInners.forEach((inner) => { titleLetters.push(...splitLetters(inner)); });

    // Letter-split the small text too: every glyph falls.
    const otherRoots = [
      ...hero.querySelectorAll(".hero__lede"),
      ...hero.querySelectorAll(".hero__meta-block"),
      ...hero.querySelectorAll(".hero__scroll"),
    ];
    const smallLetters = [];
    otherRoots.forEach((root) => smallLetters.push(...splitLetters(root)));

    titleLetters.forEach((el, i) => {
      el._dx = (rng(i, 3) - 0.5) * 120;       // wider horizontal drift
      el._rot = (rng(i, 7) - 0.5) * 540;      // up to 1.5 turns mid-air
      el._delay = rng(i, 11) * 0.18;
      el._finalRot = (rng(i, 17) - 0.5) * 70; // persistent random resting angle
    });
    smallLetters.forEach((el, i) => {
      el._dx = (rng(i, 31) - 0.5) * 80;
      el._rot = (rng(i, 37) - 0.5) * 360;
      el._delay = 0.06 + rng(i, 41) * 0.30;
      el._finalRot = (rng(i, 47) - 0.5) * 55;
    });

    // Nav atoms — fall as whole tokens (the clock updates from React;
    // letter-splitting would lose its spans on every re-render).
    const navAtoms = [];
    const brand = document.querySelector(".nav .nav__brand");
    if (brand) navAtoms.push(brand);
    document.querySelectorAll(".nav .nav__link").forEach((el) => navAtoms.push(el));
    const clock = document.querySelector(".nav .nav__clock");
    if (clock) navAtoms.push(clock);
    navAtoms.forEach((el, i) => {
      el._dx = (rng(i, 51) - 0.5) * 140;
      el._rot = (rng(i, 53) - 0.5) * 480;
      el._delay = rng(i, 55) * 0.12;
      el._finalRot = (rng(i, 57) - 0.5) * 60;
      el.style.willChange = "transform";
    });

    state.hero = { wrap, el: hero, titleLetters, smallLetters, navAtoms };
    return true;
  }

  /* For every falling glyph: compute the page-Y distance to the floor.
     Floor = hero bottom - 12px. Letters can overlap freely; the goal
     is that everything is collected on the floor by the end of the
     pin scrub. Runs after the rise-in completes so bounding rects
     reflect the final natural layout. */
  function captureHeroFloor() {
    const s = state.hero;
    if (!s) return;
    const scrollY = window.scrollY;
    const heroRect = s.el.getBoundingClientRect();
    const floorPageY = heroRect.bottom + scrollY - 12;

    const all = [...s.titleLetters, ...s.smallLetters, ...s.navAtoms];

    // Neutralise transforms so getBoundingClientRect reads natural layout.
    all.forEach((el) => {
      el._savedT = el.style.transform;
      el._savedO = el.style.opacity;
      el.style.transform = "none";
      el.style.opacity = "";
    });

    all.forEach((el) => {
      const r = el.getBoundingClientRect();
      const dist = floorPageY - (r.bottom + scrollY);
      el._floorDist = dist < 0 ? 0 : dist;
    });

    // Restore prior inline styles.
    all.forEach((el) => {
      el.style.transform = el._savedT || "";
      el.style.opacity = el._savedO || "";
    });
  }

  function prepAbout() {
    const wrap = document.querySelector('.pin-wrap[data-pin="about"]');
    const aboutSec = document.getElementById("about");
    if (!wrap || !aboutSec) return false;

    const heading = aboutSec.querySelector(".about__heading");
    let headingWords = heading ? Array.from(heading.querySelectorAll(".split__word")) : [];
    if (headingWords.length === 0 && heading) headingWords = splitWordsIn(heading);
    headingWords.forEach((el, i) => {
      el._dir = i % 2 === 0 ? -1 : 1;
      el._delay = (i / Math.max(1, headingWords.length)) * 0.3;
    });

    const bodyRows = Array.from(aboutSec.querySelectorAll(".about__body p, .about__stats > div"));

    state.about = { wrap, el: aboutSec, headingWords, bodyRows };
    return true;
  }

  function prepSplit() {
    const wrap = document.querySelector('.pin-wrap[data-pin="split"]');
    if (!wrap) return false;
    const top = wrap.querySelector(".split-stage__half--top");
    const bot = wrap.querySelector(".split-stage__half--bot");
    const teaser = wrap.querySelector(".split-stage__teaser");
    if (!top || !bot) return false;
    state.split = { wrap, top, bot, teaser };
    return true;
  }

  function prepProjects() {
    const projectsEl = document.querySelector(".projects");
    if (!projectsEl) return false;
    const rows = Array.from(projectsEl.querySelectorAll(".project-row"));
    state.projects = { el: projectsEl, rows };
    return true;
  }

  function prepProjectsCarousel() {
    const wrap = document.querySelector('.pin-wrap[data-pin="projects-carousel"]');
    if (!wrap) return true; // not on this page — that's fine
    const stageEl = wrap.querySelector(".projects-carousel");
    const track = wrap.querySelector(".projects-carousel__track");
    const viewport = wrap.querySelector(".projects-carousel__viewport");
    const fill = wrap.querySelector(".projects-carousel__fill");
    const scrollHint = wrap.querySelector(".projects-carousel__scroll");
    if (!track || !viewport) return false;
    state.projectsCarousel = { wrap, stageEl, track, viewport, fill, scrollHint };
    return true;
  }

  function applyProjectsCarousel() {
    const s = state.projectsCarousel;
    if (!s) return;
    const p = pinProgress(s.wrap);
    const trackW = s.track.scrollWidth;
    const viewW = s.viewport.clientWidth;
    const maxScroll = Math.max(0, trackW - viewW);
    s.track.style.transform = `translateX(${(-p * maxScroll).toFixed(1)}px)`;
    if (s.scrollHint) {
      // Fade the "Continue" hint as we get past 80% of horizontal travel.
      const op = Math.max(0, 1 - Math.max(0, (p - 0.8) / 0.2));
      s.scrollHint.style.opacity = op.toFixed(3);
    }
  }

  /* ---------- apply ---------- */

  function applyHero() {
    const s = state.hero;
    if (!s) return;
    const p = pinProgress(s.wrap);

    const fall = (el) => {
      const local = Math.max(0, Math.min(1, (p - el._delay) / Math.max(0.001, 1 - el._delay)));
      if (local === 0) { el.style.transform = ""; el.style.opacity = ""; return; }
      const tg = local * local;                                  // gravity (t²)
      const dist = el._floorDist || 0;
      const ty = dist * tg * scale;
      const tx = el._dx * local * scale;                         // linear sideways drift
      // Mid-fall tumble (sin) + persistent random landing angle
      const rot = (el._rot * Math.sin(tg * Math.PI) + (el._finalRot || 0) * tg) * scale;
      el.style.transform =
        `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) rotate(${rot.toFixed(1)}deg)`;
      el.style.opacity = "1";
    };

    s.titleLetters.forEach(fall);
    s.smallLetters.forEach(fall);

    // Nav atoms: fall during the pinned phase; snap back the instant
    // the animation completes (so they reappear in the next section).
    const wrapRect = s.wrap.getBoundingClientRect();
    const animDone = wrapRect.top < -(s.wrap.offsetHeight - window.innerHeight);
    if (animDone) {
      s.navAtoms.forEach((el) => { el.style.transform = ""; el.style.opacity = ""; });
    } else {
      s.navAtoms.forEach(fall);
    }
  }

  function applyAbout() {
    const s = state.about;
    if (!s) return;
    const vw = window.innerWidth;
    const p = pinProgress(s.wrap);

    s.headingWords.forEach((el) => {
      const local = Math.max(0, Math.min(1, (p - el._delay) / Math.max(0.001, 1 - el._delay)));
      if (local === 0) { el.style.transform = ""; el.style.opacity = ""; return; }
      const tx = el._dir * local * vw * 0.75 * scale;
      const rot = el._dir * local * 28 * scale;
      const op = 1 - local;
      el.style.transform = `translateX(${tx.toFixed(1)}px) rotate(${rot.toFixed(1)}deg)`;
      el.style.opacity = op.toFixed(3);
    });

    s.bodyRows.forEach((el, i) => {
      const delay = 0.1 + i * 0.05;
      const local = Math.max(0, Math.min(1, (p - delay) / Math.max(0.001, 1 - delay)));
      if (local === 0) { el.style.transform = ""; el.style.opacity = ""; return; }
      const ty = -local * 110 * scale;
      const sc = 1 - local * 0.18 * scale;
      const op = Math.max(0, 1 - local * 1.2);
      el.style.transform = `translateY(${ty.toFixed(1)}px) scale(${sc.toFixed(3)})`;
      el.style.opacity = op.toFixed(3);
    });
  }

  function applySplit() {
    const s = state.split;
    if (!s) return;
    const p = pinProgress(s.wrap);
    // Halves slide apart with a slight ease-in (cubic) so the split
    // accelerates as it opens. At p=1 both halves are fully off-screen.
    const eased = p * p * (3 - 2 * p);     // smoothstep
    s.top.style.transform = `translateY(${(-eased * 102).toFixed(2)}%)`;
    s.bot.style.transform = `translateY(${(eased * 102).toFixed(2)}%)`;
    // Teaser fades in as the gap widens.
    if (s.teaser) {
      const op = Math.max(0, Math.min(1, (eased - 0.15) / 0.55));
      s.teaser.style.opacity = op.toFixed(3);
      s.teaser.style.transform = `scale(${(0.92 + 0.08 * op).toFixed(3)})`;
    }
  }

  function applyProjects() {
    const s = state.projects;
    if (!s) return;
    const vw = window.innerWidth;
    const p = exitTopProgress(s.el);

    s.rows.forEach((row, i) => {
      const delay = i * 0.08;
      const local = Math.max(0, Math.min(1, (p - delay) / Math.max(0.001, 1 - delay)));
      if (local === 0) { row.style.transform = ""; row.style.opacity = ""; return; }
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
    if (mode === "off" || isMobile) return;
    applyHero();
    applyAbout();
    applySplit();
    applyProjects();
    applyProjectsCarousel();
  }

  function resetAll() {
    function clearList(list) {
      list && list.forEach((el) => { el.style.transform = ""; el.style.opacity = ""; });
    }
    if (state.hero) {
      clearList(state.hero.titleLetters);
      clearList(state.hero.smallLetters);
      clearList(state.hero.navAtoms);
    }
    if (state.about) {
      clearList(state.about.headingWords);
      clearList(state.about.bodyRows);
    }
    if (state.split) {
      state.split.top.style.transform = "";
      state.split.bot.style.transform = "";
      if (state.split.teaser) {
        state.split.teaser.style.opacity = "";
        state.split.teaser.style.transform = "";
      }
    }
    if (state.projects) clearList(state.projects.rows);
    if (state.projectsCarousel) {
      state.projectsCarousel.track.style.transform = "";
      if (state.projectsCarousel.fill) state.projectsCarousel.fill.style.transform = "";
    }
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => { update(); ticking = false; });
      ticking = true;
    }
  }

  function onResize() {
    captureHeroFloor();
    onScroll();
  }

  function setMode(m) {
    mode = m === "off" || m === "subtle" || m === "cinematic" ? m : "cinematic";
    scale = mode === "subtle" ? 0.45 : 1;
    if (mode === "off") resetAll(); else update();
  }

  function tryInit() {
    if (initialized) return;
    // On mobile we skip the entire scroll-driven engine. The CSS flattens
    // pin-wraps into normal flow and the rest of the page works fine.
    if (isMobile) {
      initialized = true;
      MOBILE_MQ.addEventListener("change", (e) => {
        if (!e.matches) {
          // Crossed back into desktop. Reload — re-running prep+layout
          // mid-session is fragile and a refresh is the cleanest reset.
          window.location.reload();
        }
      });
      return;
    }
    // If we're on the archive route, there's no home DOM to prep against —
    // bail out and wait for the route-change reinit() to call us again.
    if (document.body.getAttribute("data-route") === "projects-all") return;
    const ready = prepHero() & prepAbout() & prepSplit() & prepProjects() & prepProjectsCarousel();
    if (!ready) { setTimeout(tryInit, 80); return; }
    initialized = true;

    setTimeout(() => {
      document.querySelectorAll(".hero__title-line").forEach((el) => {
        el.style.overflow = "visible";
      });
      captureHeroFloor();
      update();
    }, 1500);

    const obs = new MutationObserver(() => {
      const m = document.body.getAttribute("data-fx-mode") || "cinematic";
      if (m !== mode) setMode(m);
    });
    obs.observe(document.body, { attributes: true, attributeFilter: ["data-fx-mode"] });

    const initialMode = document.body.getAttribute("data-fx-mode") || "cinematic";
    setMode(initialMode);

    MOBILE_MQ.addEventListener("change", (e) => {
      if (e.matches) window.location.reload();
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    update();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(tryInit, 120));
  } else {
    setTimeout(tryInit, 120);
  }

  function reinit() {
    if (isMobile) return;
    // The home tree may have unmounted and remounted (route swap).
    // Wipe stale references and re-prep against the current DOM.
    state.hero = state.about = state.split = state.projects = state.projectsCarousel = null;
    initialized = false;
    setTimeout(tryInit, 60);
  }

  window.__portfolioFx = { update, resetAll, setMode, pinProgress, captureHeroFloor, reinit };
})();

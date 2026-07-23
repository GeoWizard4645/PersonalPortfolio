/* ============================================================
   Scroll-driven per-section transitions. v3.

   Pinned (sticky 100vh inside an N-vh wrapper, scroll scrubs):
     HERO   -> each title glyph is split into two layers: a hairline
               OUTLINE ghost that stays exactly in place, and the
               FILLED glyph that tears away and falls off the bottom
               of the screen under gravity with a slight tumble.
               The lede / meta / scroll-hint fall as whole words.
     ABOUT  -> heading words peel upward line-by-line; body rows
               shrink and fade.
     SPLIT  -> white sheet parts in half, revealing the Projects
               teaser behind. Smootherstep easing.

   Unpinned:
     PROJECTS CAROUSEL -> vertical scroll scrubs horizontal travel.

   Respects prefers-reduced-motion (engine never starts).
   ============================================================ */

const state = { hero: null, about: null, split: null, projectsCarousel: null };
let ticking = false;
let initialized = false;
let booted = false;
const MOBILE_MQ = window.matchMedia("(max-width: 760px)");
const REDUCED_MQ = window.matchMedia("(prefers-reduced-motion: reduce)");
let isMobile = MOBILE_MQ.matches;

/* ---------- helpers ---------- */

function rng(i, salt = 1) {
  const v = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

/* Split every glyph of `root` into a dual-layer span:
   an absolutely-positioned outline ghost + the filled glyph on top. */
function splitGlyphLayers(root) {
  if (root.dataset.fxSplit === "glyphs") {
    return Array.from(root.querySelectorAll(".hglyph"));
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
      const wrap = document.createElement("span");
      wrap.className = "hglyph";
      // Ghost is two spans: the outer is JS-revealed (inline opacity), the
      // inner carries the STATIC glow + the shared flash animation. Keeping
      // the glow static and animating only opacity keeps it on the GPU.
      const ghost = document.createElement("span");
      ghost.className = "hglyph__ghost";
      ghost.setAttribute("aria-hidden", "true");
      const neon = document.createElement("span");
      neon.className = "neon";
      neon.textContent = ch;
      ghost.appendChild(neon);
      const fill = document.createElement("span");
      fill.className = "hglyph__fill";
      fill.textContent = ch;
      wrap.appendChild(ghost);
      wrap.appendChild(fill);
      frag.appendChild(wrap);
      created.push(wrap);
    }
    node.parentNode.replaceChild(frag, node);
  });
  root.dataset.fxSplit = "glyphs";
  return created;
}

/* Word-level split for the small hero text (lede, meta, scroll hint).
   Same dual-layer idea as the title glyphs: a ghost afterimage that stays
   and neon-flashes in sync with the title, and a fill that falls away. */
function splitWordLayers(root) {
  if (root.dataset.fxSplit === "hwords") {
    return Array.from(root.querySelectorAll(".hword"));
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
      const wrap = document.createElement("span");
      wrap.className = "hword";
      const ghost = document.createElement("span");
      ghost.className = "hword__ghost";
      ghost.setAttribute("aria-hidden", "true");
      const neon = document.createElement("span");
      neon.className = "neon";
      neon.textContent = p;
      ghost.appendChild(neon);
      const fill = document.createElement("span");
      fill.className = "hword__fill";
      fill.textContent = p;
      wrap.appendChild(ghost);
      wrap.appendChild(fill);
      frag.appendChild(wrap);
      created.push(wrap);
    });
    node.parentNode.replaceChild(frag, node);
  });
  root.dataset.fxSplit = "hwords";
  return created;
}

/* Plain word split (no ghost layer), used by the About heading fallback. */
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

const smootherstep = (t) => t * t * t * (t * (t * 6 - 15) + 10);

/* ---------- prep ---------- */

function prepHero() {
  const wrap = document.querySelector('.pin-wrap[data-pin="hero"]');
  const hero = document.querySelector(".hero");
  if (!wrap || !hero) return false;

  const titleInners = hero.querySelectorAll(".hero__title-line > span");
  const glyphs = [];
  titleInners.forEach((inner) => { glyphs.push(...splitGlyphLayers(inner)); });

  glyphs.forEach((wrapEl, i) => {
    wrapEl._dx = (rng(i, 3) - 0.5) * 90;        // sideways drift while falling
    wrapEl._rot = (rng(i, 7) - 0.5) * 70;       // gentle tumble, not a washing machine
    wrapEl._delay = rng(i, 11) * 0.3;           // staggered release
  });

  const smallRoots = [
    ...hero.querySelectorAll(".hero__lede"),
    ...hero.querySelectorAll(".hero__meta-block"),
    ...hero.querySelectorAll(".hero__scroll"),
  ];
  const words = [];
  smallRoots.forEach((root) => words.push(...splitWordLayers(root)));
  words.forEach((el, i) => {
    el._dx = (rng(i, 31) - 0.5) * 50;
    el._rot = (rng(i, 37) - 0.5) * 30;
    el._delay = 0.05 + rng(i, 41) * 0.35;
  });

  state.hero = { wrap, el: hero, glyphs, words };
  return true;
}

/* Distance each falling piece needs to clear the bottom of the hero.
   The hero is pinned at 100vh with overflow hidden, so "past the hero
   bottom" IS off-screen. Runs after the intro rise-in settles. */
function captureHeroDrop() {
  const s = state.hero;
  if (!s) return;
  const heroRect = s.el.getBoundingClientRect();
  const all = [...s.glyphs, ...s.words];

  all.forEach((el) => {
    el._savedT = el.style.transform;
    el.style.transform = "none";
  });
  all.forEach((el) => {
    const r = el.getBoundingClientRect();
    // top of glyph to bottom of hero, plus its own height and padding
    el._dropDist = Math.max(0, heroRect.bottom - r.top) + r.height + 60;
  });
  all.forEach((el) => {
    el.style.transform = el._savedT || "";
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
    el._delay = (i / Math.max(1, headingWords.length)) * 0.35;
    el._rot = (rng(i, 13) - 0.5) * 10;
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

function prepProjectsCarousel() {
  const wrap = document.querySelector('.pin-wrap[data-pin="projects-carousel"]');
  if (!wrap) return true; // not on this page, fine
  const track = wrap.querySelector(".projects-carousel__track");
  const viewport = wrap.querySelector(".projects-carousel__viewport");
  const scrollHint = wrap.querySelector(".projects-carousel__scroll");
  if (!track || !viewport) return false;
  state.projectsCarousel = { wrap, track, viewport, scrollHint };
  return true;
}

/* ---------- apply ---------- */

function applyHero() {
  const s = state.hero;
  if (!s) return;
  const p = pinProgress(s.wrap);
  if (p === s._lastP) return;            // nothing moved: zero style writes
  s._lastP = p;

  // Title glyphs: fill layer tears off and falls; outline ghost stays.
  s.glyphs.forEach((wrapEl) => {
    const fill = wrapEl.lastChild;
    const ghost = wrapEl.firstChild;
    const local = Math.max(0, Math.min(1, (p - wrapEl._delay) / Math.max(0.001, 1 - wrapEl._delay)));

    // Ghost reveals just before its glyph lets go, then holds and
    // neon-flashes (the flash itself lives in CSS keyframes).
    const ghostIn = Math.max(0, Math.min(1, (p - wrapEl._delay * 0.6) / 0.12));
    ghost.style.opacity = (ghostIn * 0.9).toFixed(3);

    if (local === 0) { fill.style.transform = ""; return; }
    const tg = local * local;                       // gravity
    const ty = (wrapEl._dropDist || 900) * tg;
    const tx = wrapEl._dx * local;
    const rot = wrapEl._rot * local;
    fill.style.transform =
      `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) rotate(${rot.toFixed(1)}deg)`;
  });

  // Small text: the fill word drops and fades; once it has fallen, a dim
  // ghost afterimage fades up in its place and flashes in sync with the
  // title outline (shared CSS keyframes).
  s.words.forEach((el) => {
    const ghost = el.firstChild;
    const fill = el.lastChild;
    const local = Math.max(0, Math.min(1, (p - el._delay) / Math.max(0.001, 1 - el._delay)));
    if (local === 0) {
      fill.style.transform = ""; fill.style.opacity = "";
      ghost.style.opacity = "0";
      return;
    }
    const tg = local * local;
    const ty = (el._dropDist || 600) * tg;
    const tx = el._dx * local;
    const rot = el._rot * local;
    fill.style.transform =
      `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) rotate(${rot.toFixed(1)}deg)`;
    fill.style.opacity = Math.max(0, 1 - local * 0.6).toFixed(3);
    // Afterimage appears only once the word is mostly gone.
    const ghostIn = Math.max(0, Math.min(1, (local - 0.55) / 0.3));
    ghost.style.opacity = (ghostIn * 0.75).toFixed(3);
  });
}

function applyAbout() {
  const s = state.about;
  if (!s) return;
  const p = pinProgress(s.wrap);
  if (p === s._lastP) return;
  s._lastP = p;

  // Heading words peel upward and fade, staggered along the line.
  s.headingWords.forEach((el) => {
    const local = Math.max(0, Math.min(1, (p - el._delay) / Math.max(0.001, 1 - el._delay)));
    if (local === 0) { el.style.transform = ""; el.style.opacity = ""; return; }
    const e = smootherstep(local);
    const ty = -e * 140;
    const rot = el._rot * e;
    el.style.transform = `translateY(${ty.toFixed(1)}px) rotate(${rot.toFixed(2)}deg)`;
    el.style.opacity = Math.max(0, 1 - e * 1.25).toFixed(3);
  });

  s.bodyRows.forEach((el, i) => {
    const delay = 0.1 + i * 0.05;
    const local = Math.max(0, Math.min(1, (p - delay) / Math.max(0.001, 1 - delay)));
    if (local === 0) { el.style.transform = ""; el.style.opacity = ""; return; }
    const e = smootherstep(local);
    const ty = -e * 90;
    const sc = 1 - e * 0.12;
    el.style.transform = `translateY(${ty.toFixed(1)}px) scale(${sc.toFixed(3)})`;
    el.style.opacity = Math.max(0, 1 - e * 1.2).toFixed(3);
  });
}

function applySplit() {
  const s = state.split;
  if (!s) return;
  const p = pinProgress(s.wrap);
  if (p === s._lastP) return;
  s._lastP = p;
  const eased = smootherstep(p);
  s.top.style.transform = `translateY(${(-eased * 102).toFixed(2)}%)`;
  s.bot.style.transform = `translateY(${(eased * 102).toFixed(2)}%)`;
  if (s.teaser) {
    const op = Math.max(0, Math.min(1, (eased - 0.15) / 0.55));
    s.teaser.style.opacity = op.toFixed(3);
    s.teaser.style.transform = `scale(${(0.92 + 0.08 * op).toFixed(3)})`;
  }
}

function applyProjectsCarousel() {
  const s = state.projectsCarousel;
  if (!s) return;
  const p = pinProgress(s.wrap);
  if (p === s._lastP) return;
  s._lastP = p;
  const trackW = s.track.scrollWidth;
  const viewW = s.viewport.clientWidth;
  const maxScroll = Math.max(0, trackW - viewW);
  s.track.style.transform = `translateX(${(-p * maxScroll).toFixed(1)}px)`;
  if (s.scrollHint) {
    const op = Math.max(0, 1 - Math.max(0, (p - 0.8) / 0.2));
    s.scrollHint.style.opacity = op.toFixed(3);
  }
}

function update() {
  if (isMobile) return;
  applyHero();
  applyAbout();
  applySplit();
  applyProjectsCarousel();
}

function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => { update(); ticking = false; });
    ticking = true;
  }
}

function onResize() {
  captureHeroDrop();
  onScroll();
}

function tryInit() {
  if (initialized) return;
  if (REDUCED_MQ.matches) { initialized = true; return; }
  // On mobile skip the entire scroll-driven engine; CSS flattens the
  // pin-wraps into normal flow.
  if (isMobile) {
    initialized = true;
    MOBILE_MQ.addEventListener("change", (e) => {
      if (!e.matches) window.location.reload();
    });
    return;
  }
  // On the archive route there's no home DOM to prep; wait for reinit.
  if (document.body.getAttribute("data-route") === "projects-all") return;
  const ready = prepHero() & prepAbout() & prepSplit() & prepProjectsCarousel();
  if (!ready) { setTimeout(tryInit, 80); return; }
  initialized = true;

  setTimeout(() => {
    // The intro rise-in needs the line boxes clipped; the fall needs them
    // open so glyphs can drop through the hero (which clips at its bounds).
    document.querySelectorAll(".hero__title-line").forEach((el) => {
      el.style.overflow = "visible";
    });
    captureHeroDrop();
    update();
  }, 1500);

  MOBILE_MQ.addEventListener("change", (e) => {
    if (e.matches) window.location.reload();
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  update();
}

export function initFx() {
  if (booted) return;
  booted = true;
  setTimeout(tryInit, 120);
}

export function reinitFx() {
  if (!booted || isMobile) return;
  // The home tree may have unmounted and remounted (route swap).
  // Wipe stale references and re-prep against the current DOM.
  state.hero = state.about = state.split = state.projectsCarousel = null;
  initialized = false;
  setTimeout(tryInit, 60);
}

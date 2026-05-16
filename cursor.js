/* Custom cursor — dot + trailing ring + hover state.
   Listens for [data-cursor="hover" | "text"] and links/buttons. */
(() => {
  if (window.matchMedia("(hover: none)").matches) return;
  const dot = document.createElement("div");
  const ring = document.createElement("div");
  dot.className = "cursor-dot";
  ring.className = "cursor-ring";
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let x = window.innerWidth / 2, y = window.innerHeight / 2;
  let rx = x, ry = y;
  let dx = x, dy = y;

  window.addEventListener("pointermove", (e) => {
    x = e.clientX; y = e.clientY;
  });

  // hover detection — delegated
  function isInteractive(el) {
    if (!el || !(el instanceof Element)) return false;
    return el.closest("a, button, [data-cursor='hover']");
  }
  function isText(el) {
    if (!el || !(el instanceof Element)) return false;
    return el.closest("[data-cursor='text']");
  }
  document.addEventListener("pointerover", (e) => {
    if (isText(e.target)) {
      ring.classList.add("is-text");
      ring.classList.remove("is-hover");
    } else if (isInteractive(e.target)) {
      ring.classList.add("is-hover");
      ring.classList.remove("is-text");
    } else {
      ring.classList.remove("is-hover", "is-text");
    }
  });

  function loop() {
    dx += (x - dx) * 0.6;
    dy += (y - dy) * 0.6;
    rx += (x - rx) * 0.16;
    ry += (y - ry) * 0.16;
    dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

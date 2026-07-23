/* Custom cursor: dot + trailing ring + hover state.
   No spotlight/text-zoom state; just a clean dot and ring. */
export function initCursor() {
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

  // hover detection, delegated
  function isInteractive(el) {
    if (!el || !(el instanceof Element)) return false;
    return el.closest("a, button, [data-cursor='hover']");
  }
  document.addEventListener("pointerover", (e) => {
    ring.classList.toggle("is-hover", !!isInteractive(e.target));
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
}

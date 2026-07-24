import React, { useEffect, useState } from "react";

const KEYS = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };

/* Small arrow-key cluster used as the scroll/drive hint in place of the
   old flashing-line indicator, now that scrolling doubles as driving. */
export default function ArrowKeysHint({ className = "" }) {
  const [pressed, setPressed] = useState(() => ({ up: false, down: false, left: false, right: false }));

  useEffect(() => {
    const onDown = (e) => {
      const k = KEYS[e.key];
      if (!k) return;
      setPressed((p) => (p[k] ? p : { ...p, [k]: true }));
    };
    const onUp = (e) => {
      const k = KEYS[e.key];
      if (!k) return;
      setPressed((p) => (p[k] ? { ...p, [k]: false } : p));
    };
    const onBlur = () => setPressed({ up: false, down: false, left: false, right: false });
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  return (
    <div className={`key-hint ${className}`} aria-hidden="true">
      <span className="key-hint__row">
        <span className={`key-hint__key ${pressed.up ? "is-active" : ""}`}>&uarr;</span>
      </span>
      <span className="key-hint__row">
        <span className={`key-hint__key ${pressed.left ? "is-active" : ""}`}>&larr;</span>
        <span className={`key-hint__key ${pressed.down ? "is-active" : ""}`}>&darr;</span>
        <span className={`key-hint__key ${pressed.right ? "is-active" : ""}`}>&rarr;</span>
      </span>
    </div>
  );
}

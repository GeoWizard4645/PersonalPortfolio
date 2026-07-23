import React from "react";

/* Split children into words; each word rises from below when an ancestor
   carrying [data-reveal].is-in (or .split.is-in) is in view. */
export default function SplitText({ children, delay = 0, step = 50, className = "" }) {
  // Recursively walk children; for strings, split by whitespace; for elements,
  // keep the element wrapper but split its inner text.
  let i = 0;
  function walk(node) {
    if (typeof node === "string") {
      const parts = node.split(/(\s+)/);
      return parts.map((p, k) => {
        if (/^\s+$/.test(p)) return p;
        if (!p) return null;
        const d = delay + i * step;
        i += 1;
        return (
          <span className="split__word" key={`w-${k}-${i}`}>
            <span style={{ "--d": `${d}ms` }}>{p}</span>
          </span>
        );
      });
    }
    if (Array.isArray(node)) return node.map(walk);
    if (React.isValidElement(node)) {
      return React.cloneElement(node, { ...node.props, children: walk(node.props.children) });
    }
    return node;
  }
  return <span className={`split ${className}`}>{walk(children)}</span>;
}

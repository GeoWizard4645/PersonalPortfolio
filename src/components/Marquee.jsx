import React from "react";

export default function Marquee() {
  const items = ["Python", "Java", "React", "Swift", "MicroPython", "Claude Code", "Cursor", "Web", "CAD", "Debate", "Saxophone", "DJ", "Writing", "Lacrosse", "Black Belt"];
  const row = (
    <span>
      {items.map((s, i) => (
        <React.Fragment key={i}>
          <span>{i % 2 === 0 ? s : <span className="ghost">{s}</span>}</span>
          <span className="dot" />
        </React.Fragment>
      ))}
    </span>
  );
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {row}{row}
      </div>
    </div>
  );
}

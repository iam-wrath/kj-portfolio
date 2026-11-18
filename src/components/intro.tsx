import type { CSSProperties } from "react";

/**
 * Page-load name reveal. Pure CSS (see .intro-overlay in globals.css), shown only when the
 * boot script adds html.intro: first visit per session, motion allowed. Words slide up in turn,
 * then the overlay wipes away; never blocks input and is gone in ~1s even if JavaScript fails.
 */
export function Intro({ name }: { name: string }) {
  return (
    <div className="intro-overlay" aria-hidden>
      <p className="intro-overlay__name">
        {name.trim().split(/\s+/).map((word, i) => (
          <span key={i} className="intro-overlay__word">
            <span style={{ "--i": i } as CSSProperties}>{word}</span>
          </span>
        ))}
      </p>
    </div>
  );
}

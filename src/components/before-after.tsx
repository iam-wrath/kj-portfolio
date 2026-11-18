"use client";

import Image from "next/image";
import { useState } from "react";

/** Accessible before/after comparison: a native range input drives a clip-path. Works with keyboard, mouse and touch. */
export function BeforeAfter({ before, after, alt }: { before: string; after: string; alt: string }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="ba" style={{ "--pos": `${pos}%` } as React.CSSProperties}>
      <Image src={before} alt={`${alt} — before editing`} fill sizes="(min-width: 960px) 50vw, 100vw" />
      <Image src={after} alt={`${alt} — after editing`} fill sizes="(min-width: 960px) 50vw, 100vw" className="ba__after" />
      <span className="ba__tag ba__tag--before" aria-hidden>Before</span>
      <span className="ba__tag ba__tag--after" aria-hidden>After</span>
      <span className="ba__line" aria-hidden />
      <span className="ba__knob" aria-hidden>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M9 6 3 12l6 6M15 6l6 6-6 6" />
        </svg>
      </span>
      <input
        className="ba__range"
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={`Compare before and after: ${alt}`}
        aria-valuetext={`${pos}% showing the edited version on the right`}
      />
    </div>
  );
}

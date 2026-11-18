"use client";

import { useEffect, useId, useRef } from "react";
import { HOUSING_INNER, HOUSING_OUTER, bladeAngle, irisState } from "@/three/aperture-math";
import type { ProgressStore } from "./aperture-section";

const BLADES = 7;

/**
 * 2D aperture: the Suspense fallback while three.js loads, and the static fallback when WebGL
 * is unavailable. Same geometry as the 3D scene (half-plane blades around a polygonal hole).
 */
export function ApertureSvg({ store, staticProgress }: { store?: ProgressStore; staticProgress?: number }) {
  const uid = useId().replace(/:/g, "");
  const group = useRef<SVGGElement>(null);
  const blades = useRef<(SVGRectElement | null)[]>([]);

  useEffect(() => {
    const apply = (p: number) => {
      const s = irisState(p);
      group.current?.setAttribute("transform", `scale(${s.scale})`);
      blades.current.forEach((el, i) => {
        if (!el) return;
        const deg = (bladeAngle(i, BLADES, s.twist) * 180) / Math.PI;
        el.setAttribute("transform", `rotate(${deg}) translate(${s.opening} 0)`);
      });
    };
    if (staticProgress !== undefined || !store) {
      apply(staticProgress ?? 0);
      return;
    }
    apply(store.value);
    return store.subscribe(apply);
  }, [store, staticProgress]);

  return (
    <svg className="aperture__svg" viewBox="-1 -1 2 2" preserveAspectRatio="xMidYMid meet" overflow="visible" aria-hidden focusable="false">
      <defs>
        <clipPath id={`clip-${uid}`}>
          <circle r={HOUSING_OUTER} />
        </clipPath>
        <linearGradient id={`blade-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#333333" />
          <stop offset="1" stopColor="#141414" />
        </linearGradient>
      </defs>
      <g ref={group}>
        <g clipPath={`url(#clip-${uid})`}>
          {Array.from({ length: BLADES }, (_, i) => (
            <rect
              key={i}
              ref={(el) => {
                blades.current[i] = el;
              }}
              x={0}
              y={-2.2}
              width={2.4}
              height={4.4}
              fill={`url(#blade-${uid})`}
              stroke="#525252"
              strokeWidth={0.006}
            />
          ))}
        </g>
        <circle r={(HOUSING_INNER + HOUSING_OUTER) / 2} fill="none" stroke="#1f1f1f" strokeWidth={HOUSING_OUTER - HOUSING_INNER} />
        <circle r={HOUSING_OUTER} fill="none" stroke="#6b6b6b" strokeWidth={0.006} />
        <circle r={HOUSING_INNER} fill="none" stroke="#404040" strokeWidth={0.006} />
        <rect x={-0.006} y={-HOUSING_OUTER + 0.02} width={0.012} height={0.08} fill="#c6ff3d" />
      </g>
    </svg>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { loadGsap } from "./gsap-loader";

/** Fades grid children in whenever `key` changes (e.g. a filter). Skips the first render and reduced motion. */
export function useGridFade<T extends HTMLElement>(key: string) {
  const ref = useRef<T>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const el = ref.current;
    if (!el || document.documentElement.classList.contains("reduce-motion")) return;
    let kill = () => {};
    let dead = false;
    loadGsap().then(({ gsap }) => {
      if (dead) return;
      const tween = gsap.fromTo(
        el.children,
        { y: 14, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out", stagger: 0.04, clearProps: "transform" }
      );
      kill = () => tween.kill();
    });
    return () => {
      dead = true;
      kill();
    };
  }, [key]);
  return ref;
}

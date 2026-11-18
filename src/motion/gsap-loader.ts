import type { gsap as GSAP } from "gsap";
import type { ScrollTrigger as ST } from "gsap/ScrollTrigger";

export type GsapKit = { gsap: typeof GSAP; ScrollTrigger: typeof ST };

let kit: Promise<GsapKit> | null = null;

/**
 * GSAP + ScrollTrigger are loaded on demand (after hydration / when first needed), so they never
 * sit on the critical path for first paint. One shared promise → one download, one registration.
 */
export function loadGsap(): Promise<GsapKit> {
  kit ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, s]) => {
    g.gsap.registerPlugin(s.ScrollTrigger);
    g.gsap.defaults({ ease: "power3.out", duration: 0.85 });
    return { gsap: g.gsap, ScrollTrigger: s.ScrollTrigger };
  });
  return kit;
}

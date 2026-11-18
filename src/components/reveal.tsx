"use client";

import { LazyMotion, MotionConfig, m, type Variants } from "motion/react";

const loadFeatures = () => import("./motion-features").then((mod) => mod.default);
import { useSyncExternalStore } from "react";

/**
 * Section transitions use `motion` (whileInView, once). Text splitting, the timeline draw
 * and the aperture stay on GSAP. Elements carry data-reveal-motion so CSS can force them
 * visible when JS motion is off (no JS, reduced motion, or the boot safety timer fired).
 */

const ease = [0.22, 1, 0.36, 1] as const;
const VIEWPORT = { once: true, amount: 0.2, margin: "0px 0px -8% 0px" } as const;

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};
const group: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const subscribe = (cb: () => void) => {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => obs.disconnect();
};
const reducedSnapshot = () => document.documentElement.classList.contains("reduce-motion");

export function MotionRoot({ children }: { children: React.ReactNode }) {
  // Honour both the OS setting and the dev-only ?motion=reduce override set by the boot script.
  const forced = useSyncExternalStore(subscribe, reducedSnapshot, () => false);
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion={forced ? "always" : "user"}>{children}</MotionConfig>
    </LazyMotion>
  );
}

type Tag = "div" | "section" | "article" | "li" | "ul" | "ol" | "figure" | "p" | "header" | "h2" | "h3";
type Props = React.HTMLAttributes<HTMLElement> & { as?: Tag; delay?: number; afterIntro?: boolean };
type GroupProps = React.HTMLAttributes<HTMLElement> & { as?: Tag };

/** Extra delay while the CSS intro overlay is playing (hero only). */
const introOffset = () =>
  typeof document !== "undefined" && document.documentElement.classList.contains("intro") ? 0.85 : 0;

export function Reveal({ as = "div", delay: baseDelay = 0, afterIntro = false, children, ...rest }: Props) {
  const C = m[as] as typeof m.div;
  const delay = baseDelay + (afterIntro ? introOffset() : 0);
  return (
    <C
      data-reveal-motion=""
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={{
        hidden: item.hidden,
        show: { opacity: 1, y: 0, transition: { duration: 0.8, ease, delay } },
      }}
      {...(rest as object)}
    >
      {children}
    </C>
  );
}

export function RevealGroup({ as = "div", children, ...rest }: GroupProps) {
  const C = m[as] as typeof m.div;
  return (
    <C initial="hidden" whileInView="show" viewport={VIEWPORT} variants={group} {...(rest as object)}>
      {children}
    </C>
  );
}

export function RevealItem({ as = "div", children, ...rest }: GroupProps) {
  const C = m[as] as typeof m.div;
  return (
    <C data-reveal-motion="" variants={item} {...(rest as object)}>
      {children}
    </C>
  );
}

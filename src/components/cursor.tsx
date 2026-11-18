"use client";

import { useEffect, useRef, useState } from "react";
import { DESKTOP_QUERY, isReducedMotion, whenIdle } from "@/motion/env";
import { loadGsap } from "@/motion/gsap-loader";

const SNAP = "a, button, [role='button'], label, summary, [data-cursor]";
const MEDIA = "img, video, .frame, .photo-btn, .video, .ba";
const SIZE = 30; // resting viewfinder size
const FOCUS = 64; // over large media
const PAD = 8; // breathing room when locked onto a control

/**
 * Camera-viewfinder cursor: corner brackets + crosshair + an acid-lime focus dot.
 * Brackets lock onto links and buttons (like autofocus snapping to a subject) and widen over media.
 * Desktop fine-pointer only, off for reduced motion, purely decorative (aria-hidden).
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const cross = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const update = () => setEnabled(mq.matches && !isReducedMotion());
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled || !root.current || !frame.current || !cross.current || !dot.current) return;
    const html = document.documentElement;
    const vf = root.current;
    const f = frame.current;
    const c = cross.current;
    const d = dot.current;
    let teardown = () => {};
    let dead = false;

    const cancelIdle = whenIdle(() =>
      loadGsap().then(({ gsap }) => {
        if (dead) return;
        html.classList.add("has-cursor");
        const ease = "power3.out";
        const fx = gsap.quickTo(f, "x", { duration: 0.35, ease });
        const fy = gsap.quickTo(f, "y", { duration: 0.35, ease });
        const fw = gsap.quickTo(f, "width", { duration: 0.35, ease });
        const fh = gsap.quickTo(f, "height", { duration: 0.35, ease });
        const cx = gsap.quickTo(c, "x", { duration: 0.15, ease });
        const cy = gsap.quickTo(c, "y", { duration: 0.15, ease });
        const dx = gsap.quickTo(d, "x", { duration: 0.05, ease });
        const dy = gsap.quickTo(d, "y", { duration: 0.05, ease });

        let px = 0;
        let py = 0;
        let locked: Element | null = null;
        let shown = false;

        const place = () => {
          if (locked) {
            const r = locked.getBoundingClientRect();
            fx(r.left - PAD);
            fy(r.top - PAD);
            fw(r.width + PAD * 2);
            fh(r.height + PAD * 2);
            return;
          }
          const size = vf.dataset.focus === "true" ? FOCUS : SIZE;
          fx(px - size / 2);
          fy(py - size / 2);
          fw(size);
          fh(size);
        };

        const move = (e: PointerEvent) => {
          if (e.pointerType !== "mouse") return;
          px = e.clientX;
          py = e.clientY;
          if (!shown) {
            gsap.set(f, { x: px - SIZE / 2, y: py - SIZE / 2, width: SIZE, height: SIZE });
            gsap.set([c, d], { x: px, y: py });
            gsap.to(vf, { autoAlpha: 1, duration: 0.3 });
            shown = true;
          }
          cx(px);
          cy(py);
          dx(px);
          dy(py);

          const t = e.target as Element | null;
          const snap = t?.closest?.(SNAP) ?? null;
          const r = snap?.getBoundingClientRect();
          // Lock onto controls, but not onto large clickable cards (those get the media focus instead).
          locked = snap && r && r.width <= 420 && r.height <= 140 ? snap : null;
          vf.dataset.locked = String(!!locked);
          vf.dataset.focus = String(!locked && !!(snap || t?.closest?.(MEDIA)));
          place();
        };
        const onScroll = () => locked && place();
        const leave = () => {
          gsap.to(vf, { autoAlpha: 0, duration: 0.25 });
          shown = false;
        };
        const down = () => gsap.to(f, { scale: 0.86, duration: 0.15, ease });
        const up = () => gsap.to(f, { scale: 1, duration: 0.3, ease });

        window.addEventListener("pointermove", move, { passive: true });
        window.addEventListener("scroll", onScroll, { passive: true });
        html.addEventListener("pointerleave", leave);
        window.addEventListener("pointerdown", down);
        window.addEventListener("pointerup", up);
        teardown = () => {
          html.classList.remove("has-cursor");
          window.removeEventListener("pointermove", move);
          window.removeEventListener("scroll", onScroll);
          html.removeEventListener("pointerleave", leave);
          window.removeEventListener("pointerdown", down);
          window.removeEventListener("pointerup", up);
        };
      })
    );
    return () => {
      dead = true;
      cancelIdle();
      teardown();
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div ref={root} className="vf" aria-hidden>
      <div ref={frame} className="vf__frame">
        <span className="vf__c vf__c--tl" />
        <span className="vf__c vf__c--tr" />
        <span className="vf__c vf__c--bl" />
        <span className="vf__c vf__c--br" />
      </div>
      <div ref={cross} className="vf__cross" />
      <div ref={dot} className="vf__dot" />
    </div>
  );
}

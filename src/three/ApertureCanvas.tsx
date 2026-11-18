"use client";

import { useEffect, useRef } from "react";
import { createApertureScene, type ApertureScene } from "./aperture-scene";
import type { ProgressStore } from "@/components/aperture-section";

declare global {
  interface Window {
    __aperture?: { frames: number; pixelRatio: number };
  }
}

/** Lazy-loaded WebGL canvas (React.lazy target). Calls onFail if WebGL can't start. */
export default function ApertureCanvas({
  store,
  mobile,
  staticProgress,
  onFail,
  onReady,
}: {
  store: ProgressStore;
  mobile: boolean;
  staticProgress?: number;
  onFail: () => void;
  onReady: () => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let scene: ApertureScene;
    try {
      scene = createApertureScene(canvas, { mobile, interactive: !mobile && staticProgress === undefined });
    } catch {
      onFail();
      return;
    }
    const lost = (e: Event) => {
      e.preventDefault();
      onFail();
    };
    canvas.addEventListener("webglcontextlost", lost);

    const stage = canvas.closest<HTMLElement>(".aperture__stage") ?? canvas;
    const sync = () => scene.resize(canvas.clientWidth, canvas.clientHeight, stage.clientHeight / 2);
    const ro = new ResizeObserver(sync);
    ro.observe(canvas);
    ro.observe(stage);
    sync();
    // Tell the section once the first frame is on screen so it can drop the SVG placeholder.
    const readyRaf = requestAnimationFrame(() => requestAnimationFrame(onReady));

    // Pause rendering while the canvas is off-screen.
    const io = new IntersectionObserver(([entry]) => scene.setVisible(entry.isIntersecting));
    io.observe(canvas);

    let unsub = () => {};
    if (staticProgress !== undefined) {
      scene.setProgress(staticProgress); // reduced motion: one static frame, no scrub
    } else {
      scene.setProgress(store.value);
      unsub = store.subscribe((p) => scene.setProgress(p));
    }

    // Subtle pointer tilt (desktop only)
    const section = canvas.closest("section");
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      scene.setTilt(ny * 0.07, nx * 0.07);
    };
    const onLeave = () => scene.setTilt(0, 0);
    if (!mobile && staticProgress === undefined) {
      section?.addEventListener("pointermove", onMove);
      section?.addEventListener("pointerleave", onLeave);
    }

    const debug = process.env.NODE_ENV === "development";
    const debugTimer = debug
      ? window.setInterval(() => (window.__aperture = { frames: scene.frames, pixelRatio: scene.pixelRatio }), 250)
      : 0;

    return () => {
      cancelAnimationFrame(readyRaf);
      unsub();
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("webglcontextlost", lost);
      section?.removeEventListener("pointermove", onMove);
      section?.removeEventListener("pointerleave", onLeave);
      window.clearInterval(debugTimer);
      scene.dispose();
    };
  }, [store, mobile, staticProgress, onFail, onReady]);

  return <canvas ref={ref} aria-hidden />;
}

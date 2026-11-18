"use client";

import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import type { ScrollTrigger as ST } from "gsap/ScrollTrigger";
import { VideoFacade } from "./video-facade";
import { ApertureSvg } from "./aperture-svg";
import { STATIC_PROGRESS, clipRadiusPx } from "@/three/aperture-math";
import { DESKTOP_QUERY, isReducedMotion } from "@/motion/env";
import { loadGsap } from "@/motion/gsap-loader";

const ApertureCanvas = lazy(() => import("@/three/ApertureCanvas"));

/** Tiny pub/sub so scroll progress reaches the canvas/SVG without React re-renders. */
export class ProgressStore {
  value = 0;
  private subs = new Set<(p: number) => void>();
  set(p: number) {
    this.value = p;
    this.subs.forEach((fn) => fn(p));
  }
  subscribe(fn: (p: number) => void) {
    this.subs.add(fn);
    return () => {
      this.subs.delete(fn);
    };
  }
}

function hasWebGL() {
  if (document.documentElement.classList.contains("force-no-webgl")) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

type Reel = { title: string; embedUrl: string; thumbnail: string | null };
type Mode = { ready: boolean; webgl: boolean; reduced: boolean; mobile: boolean };

/**
 * The site's one 3D moment: a camera iris that opens as you scroll into the featured reel.
 * The reel (DOM) is clipped to the lens; the WebGL canvas draws the blades and housing on top.
 */
export function ApertureSection({ reel, head, caption }: { reel: Reel; head: React.ReactNode; caption: React.ReactNode }) {
  const section = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const reelRef = useRef<HTMLDivElement>(null);
  const [store] = useState(() => new ProgressStore());
  const [mode, setMode] = useState<Mode>({ ready: false, webgl: false, reduced: false, mobile: true });
  const [near, setNear] = useState(false);
  const [glReady, setGlReady] = useState(false);

  // Decide capabilities after mount (SSR renders the plain reel, so no-JS visitors see it unclipped).
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const update = () => setMode({ ready: true, webgl: hasWebGL(), reduced: isReducedMotion(), mobile: !mq.matches });
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Only request three.js when the section is within ~one viewport.
  useEffect(() => {
    const el = section.current;
    if (!el || !mode.ready || !mode.webgl) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setNear(true);
        io.disconnect();
      }
    }, { rootMargin: "100% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [mode.ready, mode.webgl]);

  const onFail = useCallback(() => {
    setGlReady(false);
    setMode((m) => ({ ...m, webgl: false }));
  }, []);
  const onReady = useCallback(() => setGlReady(true), []);
  const isStatic = mode.reduced || !mode.webgl;

  // Scroll → progress → reel clip + lens
  useEffect(() => {
    if (!mode.ready || !stage.current || !reelRef.current || !pin.current || !section.current) return;
    const stageEl = stage.current;
    const reelEl = reelRef.current;
    let stageH = stageEl.clientHeight;
    const ro = new ResizeObserver(() => {
      stageH = stageEl.clientHeight;
      apply(store.value);
    });
    ro.observe(stageEl);

    function apply(p: number) {
      reelEl.style.clipPath = p >= 0.995 ? "none" : `circle(${clipRadiusPx(p, stageH).toFixed(1)}px at 50% 50%)`;
      section.current?.setAttribute("data-open", p >= 0.995 ? "true" : "false");
    }
    const unsub = store.subscribe(apply);

    if (isStatic) {
      store.set(STATIC_PROGRESS);
      return () => {
        unsub();
        ro.disconnect();
      };
    }

    store.set(0);
    const pinEl = pin.current;
    let st: ST | null = null;
    let dead = false;
    loadGsap().then(({ ScrollTrigger }) => {
      if (dead) return;
      const onUpdate = (self: ST) => store.set(self.progress);
      st = mode.mobile
        ? ScrollTrigger.create({ trigger: stageEl, start: "top 85%", end: "center 45%", scrub: 0.5, onUpdate })
        : ScrollTrigger.create({
            trigger: pinEl,
            start: "top top",
            end: "+=130%",
            scrub: 1.1,
            pin: true,
            anticipatePin: 1,
            onUpdate,
          });
      store.set(st.progress);
      ScrollTrigger.refresh();
    });
    return () => {
      dead = true;
      st?.kill();
      unsub();
      ro.disconnect();
    };
  }, [mode.ready, mode.mobile, isStatic, store]);

  return (
    <section ref={section} className="aperture section section--alt" aria-labelledby="reel-title" style={{ paddingBlock: 0 }}>
      <div ref={pin} className="aperture__pin">
        <div className="container reel">
          {head}
          <div ref={stage} className="aperture__stage">
            <div ref={reelRef} className="reel__frame aperture__reel">
              <VideoFacade title={reel.title} embedUrl={reel.embedUrl} thumbnail={reel.thumbnail} label="Featured reel" />
            </div>
            {mode.ready ? (
              <>
                {/* SVG shows until the WebGL lens has drawn its first frame (and stays if WebGL is unavailable). */}
                {!(mode.webgl && glReady) ? (
                  <div className="aperture__lens">
                    <ApertureSvg store={store} staticProgress={isStatic ? STATIC_PROGRESS : undefined} />
                  </div>
                ) : null}
                {mode.webgl && near ? (
                  <div className="aperture__gl" data-ready={glReady}>
                    <Suspense fallback={null}>
                      <ApertureCanvas
                        store={store}
                        mobile={mode.mobile}
                        staticProgress={isStatic ? STATIC_PROGRESS : undefined}
                        onFail={onFail}
                        onReady={onReady}
                      />
                    </Suspense>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
          {caption}
        </div>
      </div>
    </section>
  );
}

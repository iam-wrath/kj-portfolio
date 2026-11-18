"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { setLenis } from "./lenis";
import { splitLines } from "./split";
import { loadGsap, type GsapKit } from "./gsap-loader";
import { DESKTOP_QUERY, isReducedMotion, whenIdle } from "./env";

export { DESKTOP_QUERY, isReducedMotion };

declare global {
  interface Window {
    __motionReady?: boolean;
  }
}

/** Lenis smooth scroll — desktop only, dynamically imported so phones never download it. */
function useLenis() {
  useEffect(() => {
    if (isReducedMotion() || !window.matchMedia(DESKTOP_QUERY).matches) return;
    let mm: ReturnType<GsapKit["gsap"]["matchMedia"]> | null = null;
    let dead = false;
    const cancelIdle = whenIdle(() => loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (dead) return;
      mm = gsap.matchMedia();
      mm.add(DESKTOP_QUERY, () => {
      let cancelled = false;
      let cleanup = () => {};
      import("lenis").then(({ default: Lenis }) => {
        if (cancelled) return;
        const lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9, anchors: { offset: -80 } });
        setLenis(lenis);
        lenis.on("scroll", ScrollTrigger.update);
        const raf = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(raf);
        gsap.ticker.lagSmoothing(0);
        cleanup = () => {
          gsap.ticker.remove(raf);
          gsap.ticker.lagSmoothing(500, 33);
          lenis.destroy();
          setLenis(null);
        };
      });
      return () => {
        cancelled = true;
        cleanup();
      };
      });
    }));
    return () => {
      dead = true;
      cancelIdle();
      mm?.revert();
    };
  }, []);
}

function initScene({ gsap, ScrollTrigger }: GsapKit, desktop: boolean) {
  const restores: (() => void)[] = [];
  // Section headings: lines are measured where the browser wraps them, then slide up on scroll.
  // (Hero and page titles above the fold use CSS keyframes instead — see SplitHeading.)
  gsap.utils.toArray<HTMLElement>("[data-motion-text='lines']").forEach((el) => {
    const { targets, restore } = splitLines(el);
    restores.push(restore);
    gsap.set(el, { autoAlpha: 1 });
    gsap.fromTo(
      targets,
      { yPercent: 105 },
      {
        yPercent: 0,
        duration: desktop ? 1.05 : 0.85,
        ease: "power4.out",
        stagger: 0.1,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
        // Restore the original text after the reveal so later resizes reflow naturally.
        onComplete: restore,
      }
    );
  });

  // Clip-path image reveals
  gsap.utils.toArray<HTMLElement>("[data-image-reveal]").forEach((fig) => {
    gsap.set(fig, { autoAlpha: 1 });
    const img = fig.querySelector("img");
    const tl = gsap.timeline({ scrollTrigger: { trigger: fig, start: "top 88%", once: true } });
    tl.fromTo(fig, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: desktop ? 1.1 : 0.8, ease: "power4.out", clearProps: "clipPath" });
    if (img && desktop) tl.fromTo(img, { scale: 1.08 }, { scale: 1, duration: 1.2, ease: "power4.out", clearProps: "transform" }, 0);
  });

  // Experience timeline: the line draws itself as you scroll through it
  gsap.utils.toArray<HTMLElement>("[data-timeline]").forEach((list) => {
    const track = list.querySelector<HTMLElement>(".timeline__track");
    if (track) {
      gsap.fromTo(track, { scaleY: 0 }, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: { trigger: list, start: "top 72%", end: "bottom 72%", scrub: 0.6 },
      });
    }
    list.querySelectorAll<HTMLElement>("ol > li").forEach((li) => {
      ScrollTrigger.create({ trigger: li, start: "top 72%", toggleClass: { targets: li, className: "is-active" } });
    });
  });

  if (!desktop) return restores;

  // Magnetic CTAs (desktop only)
  gsap.utils.toArray<HTMLElement>("[data-magnetic]").forEach((el) => {
    const strength = 0.18;
    const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * strength);
      yTo((e.clientY - r.top - r.height / 2) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    restores.push(() => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      gsap.set(el, { clearProps: "transform" });
    });
  });

  return restores;
}

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useLenis();

  useEffect(() => {
    window.__motionReady = true;
    const root = document.documentElement;
    // No JS motion (reduced motion, or the boot safety timer already revealed content).
    if (!root.classList.contains("has-motion")) return;

    // Everything GSAP owns is below the fold (headline reveals above the fold are CSS), so load
    // GSAP and set it up when the main thread is idle rather than competing with hydration.
    let mm: ReturnType<GsapKit["gsap"]["matchMedia"]> | null = null;
    let dead = false;
    let pending: number | undefined;
    const imgs = Array.from(document.images).filter((i) => !i.complete);
    let onImg = () => {};

    const cancelIdle = whenIdle(() => {
      loadGsap().then((kit) => {
        if (dead) return;
        const { gsap, ScrollTrigger } = kit;
        mm = gsap.matchMedia();
        mm.add({ desktop: DESKTOP_QUERY, any: "all" }, (ctx) => {
          const { desktop } = ctx.conditions as { desktop: boolean };
          let restores: (() => void)[] = [];
          try {
            restores = initScene(kit, desktop);
          } catch (err) {
            console.error("Motion init failed — showing content without animation", err);
            root.classList.remove("has-motion");
          }
          const refresh = () => ScrollTrigger.refresh();
          document.fonts?.ready.then(refresh);
          window.addEventListener("load", refresh);
          return () => {
            window.removeEventListener("load", refresh);
            restores.forEach((r) => r());
          };
        });
        // Late-loading images change layout; keep trigger positions honest.
        onImg = () => {
          window.clearTimeout(pending);
          pending = window.setTimeout(() => ScrollTrigger.refresh(), 150);
        };
        imgs.forEach((i) => i.addEventListener("load", onImg, { once: true }));
      }).catch(() => root.classList.remove("has-motion"));
    });

    return () => {
      dead = true;
      cancelIdle();
      window.clearTimeout(pending);
      imgs.forEach((i) => i.removeEventListener("load", onImg));
      mm?.revert();
    };
  }, [pathname]);

  return <>{children}</>;
}

"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { loadGsap } from "@/motion/gsap-loader";
import { ArrowLeft, ArrowRight, Close } from "./icons";
import { getLenis } from "@/motion/lenis";

export type LightboxItem = { src: string; alt: string; caption?: string | null; width: number; height: number };

export function Lightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: LightboxItem[];
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const imgWrap = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const open = index !== null;
  const item = open ? items[index] : null;

  const go = useCallback(
    (dir: 1 | -1) => {
      if (index === null) return;
      onIndex((index + dir + items.length) % items.length);
    },
    [index, items.length, onIndex]
  );

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      getLenis()?.stop();
      if (!document.documentElement.classList.contains("reduce-motion")) {
        loadGsap().then(({ gsap }) => gsap.fromTo(d, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: "power3.out" }));
      }
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  useEffect(() => {
    const wrap = imgWrap.current;
    if (!open || !wrap || document.documentElement.classList.contains("reduce-motion")) return;
    loadGsap().then(({ gsap }) => gsap.fromTo(wrap, { autoAlpha: 0, scale: 0.97 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "power3.out" }));
  }, [index, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  return (
    <dialog
      ref={ref}
      className="lightbox"
      aria-label="Photo viewer"
      onClose={() => {
        getLenis()?.start();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) ref.current?.close();
      }}
    >
      {item ? (
        <>
          <div className="lightbox__bar">
            <span aria-live="polite">
              {String(index! + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </span>
            <button type="button" className="icon-btn" aria-label="Close" onClick={() => ref.current?.close()} autoFocus>
              <Close />
            </button>
          </div>
          <div
            className="lightbox__stage"
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
              touchX.current = null;
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) ref.current?.close();
            }}
          >
            {items.length > 1 ? (
              <button type="button" className="icon-btn lightbox__nav lightbox__nav--prev" aria-label="Previous photo" onClick={() => go(-1)}>
                <ArrowLeft />
              </button>
            ) : null}
            <div ref={imgWrap} style={{ display: "grid", placeItems: "center", width: "100%", height: "100%", minHeight: 0 }}>
              <Image
                key={item.src}
                src={item.src}
                alt={item.alt}
                width={item.width}
                height={item.height}
                sizes="100vw"
                className="lightbox__img"
                style={{ maxHeight: "calc(100dvh - 150px)" }}
              />
            </div>
            {items.length > 1 ? (
              <button type="button" className="icon-btn lightbox__nav lightbox__nav--next" aria-label="Next photo" onClick={() => go(1)}>
                <ArrowRight />
              </button>
            ) : null}
          </div>
          <p className="lightbox__cap">{item.caption}</p>
        </>
      ) : null}
    </dialog>
  );
}

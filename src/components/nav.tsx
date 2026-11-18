"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Close, Menu } from "./icons";
import { ThemeToggle } from "./theme-toggle";
import { getLenis } from "@/motion/lenis";
import { NAV_LINKS } from "@/lib/nav-links";


export function Nav({ name }: { name: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the sheet on navigation.
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const sheet = sheetRef.current;
    const menuBtn = menuBtnRef.current;
    const lenis = getLenis();
    lenis?.stop();
    document.body.style.overflow = "hidden";
    const focusables = () =>
      Array.from(sheet?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab") {
        const els = focusables();
        if (!els.length) return;
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lenis?.start();
      menuBtn?.focus();
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <header className="site-nav" data-scrolled={scrolled || open}>
        <nav className="container site-nav__inner" aria-label="Main">
          <Link href="/" className="brand" aria-label={`${name} — home`}>
            <span className="brand__mark" aria-hidden />
            <BrandName name={name} />
          </Link>
          <ul className="nav-links">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} aria-current={isActive(l.href) ? "page" : undefined}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="nav-actions">
            <ThemeToggle />
            <Link href="/contact" className="btn btn--primary btn--sm nav-cta" data-magnetic>
              Contact me
            </Link>
            <button
              ref={menuBtnRef}
              type="button"
              className="icon-btn menu-btn"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen(true)}
            >
              <Menu />
            </button>
          </div>
        </nav>
      </header>

      <div
        id="mobile-menu"
        ref={sheetRef}
        className="sheet"
        data-open={open}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!open}
      >
        <div className="sheet__top">
          <Link href="/" className="brand">
            <span className="brand__mark" aria-hidden />
            <BrandName name={name} />
          </Link>
          <button type="button" className="icon-btn" aria-label="Close menu" onClick={() => setOpen(false)}>
            <Close />
          </button>
        </div>
        <ul className="sheet__links">
          {[{ href: "/", label: "Home" }, ...NAV_LINKS, { href: "/contact", label: "Contact" }].map((l, i) => (
            <li key={l.href}>
              <Link href={l.href} aria-current={pathname === l.href ? "page" : undefined}>
                {l.label}
                <span className="idx" aria-hidden>0{i + 1}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="sheet__foot">
          <Link href="/contact?type=quote" className="btn btn--primary">Request a quote</Link>
        </div>
      </div>
    </>
  );
}

/** Full name, with middle names hidden on narrow screens so the bar never overflows. */
function BrandName({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 3) return <span>{name}</span>;
  return (
    <span>
      {parts[0]} <span className="brand__mid">{parts.slice(1, -1).join(" ")} </span>
      {parts[parts.length - 1]}
    </span>
  );
}

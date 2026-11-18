"use client";

import { Moon, Sun } from "./icons";

export function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* storage blocked — theme still applies for this visit */
    }
  };
  return (
    <button type="button" className="icon-btn theme-toggle" onClick={toggle} aria-label="Toggle light or dark theme">
      <Moon className="moon" />
      <Sun className="sun" />
    </button>
  );
}

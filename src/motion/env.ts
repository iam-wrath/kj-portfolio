/** Desktop = fine pointer + wide viewport. Reduced motion is read from <html class="reduce-motion">. */
export const DESKTOP_QUERY = "(min-width: 900px) and (hover: hover) and (pointer: fine)";
export const isReducedMotion = () =>
  typeof document !== "undefined" && document.documentElement.classList.contains("reduce-motion");

/** Run fn when the main thread is idle (with a timeout), returning a cancel function. */
export function whenIdle(fn: () => void, timeout = 1200) {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(fn, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(fn, 250);
  return () => window.clearTimeout(id);
}

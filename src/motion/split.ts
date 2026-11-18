/**
 * Accessible line splitting without a SplitText dependency. The original text is kept on
 * aria-label and the masks are aria-hidden.
 *
 * Measures where the browser wraps words, then rebuilds the text as
 * one masked block per visual line. Callers restore the original DOM once the reveal finishes,
 * so later resizes reflow naturally.
 */
export function splitLines(el: HTMLElement): { targets: HTMLElement[]; restore: () => void } {
  const original = el.innerHTML;
  const text = (el.textContent ?? "").trim().replace(/\s+/g, " ");
  el.setAttribute("aria-label", text);
  el.textContent = "";
  const probes = text.split(" ").map((w, i, arr) => {
    const s = document.createElement("span");
    s.textContent = w;
    el.appendChild(s);
    if (i < arr.length - 1) el.appendChild(document.createTextNode(" "));
    return s;
  });
  const lines: string[][] = [];
  let lastTop = Number.NaN;
  probes.forEach((p) => {
    const top = p.offsetTop;
    if (Math.abs(top - lastTop) > 2 || !lines.length) {
      lines.push([]);
      lastTop = top;
    }
    lines[lines.length - 1].push(p.textContent ?? "");
  });
  el.textContent = "";
  const targets = lines.map((words) => {
    const mask = document.createElement("span");
    mask.className = "motion-line-mask";
    mask.setAttribute("aria-hidden", "true");
    const line = document.createElement("span");
    line.className = "motion-line";
    line.textContent = words.join(" ");
    mask.appendChild(line);
    el.appendChild(mask);
    return line;
  });
  return {
    targets,
    restore: () => {
      el.innerHTML = original;
      el.removeAttribute("aria-label");
    },
  };
}

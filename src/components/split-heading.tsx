import type { CSSProperties, ReactNode } from "react";

type Props = {
  as?: "h1" | "h2";
  id?: string;
  className?: string;
  style?: CSSProperties;
  /** Seconds before the first word/line starts. */
  delay?: number;
} & ({ text: string; lines?: never } | { lines: ReactNode[]; text?: never });

/**
 * Above-the-fold headings are split on the server and revealed with CSS keyframes, so the
 * largest text paints with the first frame instead of waiting for JavaScript (better LCP).
 * Words or authored lines slide up in sequence; reduced motion / no-JS shows them static.
 */
export function SplitHeading({ as: Tag = "h1", id, className, style, delay = 0, text, lines }: Props) {
  const vars = { ...style, "--split-delay": `${delay}s` } as CSSProperties;
  if (lines) {
    return (
      <Tag id={id} className={`${className ?? ""} split-heading`} style={vars}>
        {lines.map((line, i) => (
          <span key={i} className="split-line" style={{ "--i": i } as CSSProperties}>
            {line}
          </span>
        ))}
      </Tag>
    );
  }
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <Tag id={id} className={`${className ?? ""} split-heading`} style={vars}>
      {words.map((w, i) => (
        <span key={i}>
          <span className="split-word" style={{ "--i": i } as CSSProperties}>
            {w}
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}

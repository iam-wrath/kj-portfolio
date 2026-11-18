"use client";

import { useState } from "react";
import { Play } from "./icons";

type Props = {
  title: string;
  embedUrl: string;
  thumbnail: string | null;
  label?: string;
  className?: string;
  priority?: boolean;
};

/**
 * Lightweight video embed: shows only a thumbnail until the visitor presses play,
 * so no YouTube/Vimeo scripts load on first paint (important on slow mobile data).
 */
export function VideoFacade({ title, embedUrl, thumbnail, label, className, priority }: Props) {
  const [active, setActive] = useState(false);
  return (
    <div className={`video ${className ?? ""}`}>
      {active ? (
        <iframe
          src={embedUrl}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <button type="button" className="video__poster" onClick={() => setActive(true)} aria-label={`Play video: ${title}`}>
          {thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote YouTube thumbnail; avoids image-optimizer cost
            <img src={thumbnail} alt="" loading={priority ? "eager" : "lazy"} decoding="async" width={480} height={360} />
          ) : (
            <span className="video__fallback" />
          )}
          <span className="play"><Play /></span>
          {label ? <span className="video__label"><span className="status-dot" aria-hidden />{label}</span> : null}
        </button>
      )}
    </div>
  );
}

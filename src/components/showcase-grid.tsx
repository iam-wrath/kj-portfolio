"use client";

import { useMemo, useState } from "react";
import { FilterTabs } from "./filter-tabs";
import { VideoFacade } from "./video-facade";
import { useGridFade } from "@/motion/use-grid-fade";

export type ShowcaseVideo = {
  slug: string;
  title: string;
  embedUrl: string;
  thumbnail: string | null;
  category: string;
  categoryLabel: string;
  date: string;
  venue: string;
  role: string;
};

export function ShowcaseGrid({
  videos,
  categories,
}: {
  videos: ShowcaseVideo[];
  categories: readonly { value: string; label: string }[];
}) {
  const [cat, setCat] = useState("all");
  const visible = useMemo(() => (cat === "all" ? videos : videos.filter((v) => v.category === cat)), [cat, videos]);
  const ref = useGridFade<HTMLDivElement>(cat);

  const options = [
    { value: "all", label: "All", count: videos.length },
    ...categories.map((c) => ({ ...c, count: videos.filter((v) => v.category === c.value).length })),
  ];

  return (
    <>
      <FilterTabs label="Filter videos by category" options={options} value={cat} onChange={setCat} />
      {visible.length ? (
        <div className="grid grid--3" ref={ref} style={{ rowGap: 40 }}>
          {visible.map((v) => (
            <article className="video-card" key={v.slug}>
              <VideoFacade title={v.title} embedUrl={v.embedUrl} thumbnail={v.thumbnail} label={v.categoryLabel} />
              <div className="video-card__meta">
                <h3 className="video-card__title">{v.title}</h3>
                <p className="video-card__sub">
                  {v.date ? <span>{v.date}</span> : null}
                  {v.venue ? <span>{v.venue}</span> : null}
                </p>
                {v.role ? <p className="video-card__role">role: {v.role}</p> : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="empty">No videos in this category yet.</p>
      )}
    </>
  );
}

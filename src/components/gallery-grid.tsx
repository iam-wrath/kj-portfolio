"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { FilterTabs } from "./filter-tabs";
import { Lightbox, type LightboxItem } from "./lightbox";
import { useGridFade } from "@/motion/use-grid-fade";

export type GalleryPhoto = LightboxItem & { slug: string; album: string; blurDataURL?: string };

export function GalleryGrid({
  photos,
  albums,
}: {
  photos: GalleryPhoto[];
  albums: readonly { value: string; label: string }[];
}) {
  const [album, setAlbum] = useState("all");
  const [index, setIndex] = useState<number | null>(null);
  const visible = useMemo(() => (album === "all" ? photos : photos.filter((p) => p.album === album)), [album, photos]);
  const gridRef = useGridFade<HTMLDivElement>(album);
  // CSS columns fill top-to-bottom, so the photos at the top of each column (2 on phones,
  // 3 on desktop) are the ones above the fold: load those eagerly.
  const n = visible.length;
  const columnTops = new Set([0, Math.ceil(n / 2), Math.ceil(n / 3), Math.ceil((2 * n) / 3)]);

  const options = [
    { value: "all", label: "All", count: photos.length },
    ...albums
      .map((a) => ({ ...a, count: photos.filter((p) => p.album === a.value).length }))
      .filter((a) => a.count > 0),
  ];

  return (
    <>
      <FilterTabs label="Filter photos by album" options={options} value={album} onChange={setAlbum} />
      {visible.length ? (
        <div className="masonry" ref={gridRef}>
          {visible.map((p, i) => (
            <div className="masonry__item" key={p.slug}>
              <button type="button" className="photo-btn" onClick={() => setIndex(i)} aria-label={`View photo: ${p.alt}`}>
                <Image
                  src={p.src}
                  alt={p.alt}
                  width={p.width}
                  height={p.height}
                  sizes="(min-width: 900px) 33vw, 50vw"
                  loading={columnTops.has(i) ? "eager" : "lazy"}
                  fetchPriority={i === 0 || i === Math.ceil(n / 2) ? "high" : "auto"}
                  placeholder={p.blurDataURL ? "blur" : "empty"}
                  blurDataURL={p.blurDataURL}
                />
                {p.caption ? <span className="photo-btn__cap">{p.caption}</span> : null}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty">No photos in this album yet.</p>
      )}
      <Lightbox items={visible} index={index} onIndex={setIndex} onClose={() => setIndex(null)} />
    </>
  );
}

import type { Metadata } from "next";
import { getBeforeAfter, getImageMeta, getPhotos, PHOTO_ALBUMS } from "@/lib/content";
import { CtaBand, PageHead, SectionHead } from "@/components/blocks";
import { RevealGroup, RevealItem } from "@/components/reveal";
import { GalleryGrid } from "@/components/gallery-grid";
import { BeforeAfter } from "@/components/before-after";

export const metadata: Metadata = {
  title: "Photo gallery",
  description: "Event, portrait, worship and music photography — plus before-and-after edits.",
};

export default async function GalleryPage() {
  const [photos, edits] = await Promise.all([getPhotos(), getBeforeAfter()]);
  const withMeta = await Promise.all(
    photos.map(async (p) => {
      const m = await getImageMeta(p.image);
      return { slug: p.slug, album: p.album, src: p.image, alt: p.alt, caption: p.caption, width: m.width, height: m.height, blurDataURL: m.blurDataURL };
    })
  );

  return (
    <>
      <PageHead
        title="Photography, shown with pride."
        lead="Events, portraits, worship and music. Tap any photo to view it full screen."
      />
      <section className="section" style={{ paddingTop: 0 }} aria-label="Photos">
        <div className="container">
          <GalleryGrid photos={withMeta} albums={PHOTO_ALBUMS} />
        </div>
      </section>

      {edits.length ? (
        <section className="section section--alt" aria-labelledby="edits-title">
          <div className="container">
            <SectionHead id="edits-title" title="Before and after." lead="Drag the handle (or use your arrow keys) to compare the original with the final edit." />
            <RevealGroup className="grid grid--2" style={{ gap: 32 }}>
              {edits.map((e) => (
                <RevealItem as="figure" key={e.slug} style={{ display: "grid", gap: 12 }}>
                  <BeforeAfter before={e.before} after={e.after} alt={e.alt || e.title} />
                  <figcaption>
                    <strong>{e.title}</strong>
                    <span className="muted"> — {e.caption}</span>
                  </figcaption>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      ) : null}

      <CtaBand title="Want photos like these?" text="Events, portraits, worship services and band nights — let's plan your shoot." />
    </>
  );
}

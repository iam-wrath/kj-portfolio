import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getImageMeta, getPhotos, getStreamEvents, getVideos, formatDate, VIDEO_CATEGORIES } from "@/lib/content";
import { CtaBand, PageHead, SectionHead } from "@/components/blocks";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { ShowcaseGrid } from "@/components/showcase-grid";
import { VideoFacade } from "@/components/video-facade";
import { ArrowRight } from "@/components/icons";

export const metadata: Metadata = {
  title: "Video showcase",
  description: "Live streams, church and event coverage, band and music sessions, and edited films — real samples of past work.",
};

export default async function ShowcasePage() {
  const [videos, photos, streams] = await Promise.all([getVideos(), getPhotos(), getStreamEvents()]);
  const reel = videos.find((v) => v.featured) ?? videos[0];
  const rest = videos.filter((v) => v !== reel);
  const photoPeek = await Promise.all(
    photos.slice(0, 4).map(async (p) => ({ ...p, meta: await getImageMeta(p.image) }))
  );

  return (
    <>
      <PageHead
        title="Real work from real events."
        lead="Live streams, church and event coverage, music sessions and edited films. Press play on anything — videos only load when you ask them to."
      />

      {reel ? (
        <section className="section" style={{ paddingTop: 0 }} aria-labelledby="featured">
          <div className="container reel">
            <div className="reel__frame" data-image-reveal style={{ overflow: "hidden" }}>
              <VideoFacade title={reel.title} embedUrl={reel.embedUrl} thumbnail={reel.thumbnail} label="Featured reel" priority />
            </div>
            <Reveal className="reel__caption">
              <div>
                <h2 id="featured" className="h3">{reel.title}</h2>
                <p className="muted">{[formatDate(reel.date), reel.venue].filter(Boolean).join(" · ")}</p>
              </div>
              <p className="video-card__role">role: {reel.role}</p>
            </Reveal>
          </div>
        </section>
      ) : null}

      <section className="section section--alt" aria-labelledby="all-videos">
        <div className="container">
          <h2 id="all-videos" className="sr-only">All videos</h2>
          <ShowcaseGrid
            categories={VIDEO_CATEGORIES}
            videos={rest.map((v) => ({
              slug: v.slug,
              title: v.title,
              embedUrl: v.embedUrl,
              thumbnail: v.thumbnail,
              category: v.category,
              categoryLabel: v.categoryLabel,
              date: formatDate(v.date),
              venue: v.venue,
              role: v.role,
            }))}
          />
        </div>
      </section>

      <section className="section" aria-labelledby="streams-title">
        <div className="container">
          <SectionHead id="streams-title" title="Events I've streamed." lead="Multi-camera productions for churches, conferences and family events." action={{ href: "/services", label: "Equipment & platforms" }} />
          <RevealGroup className="rows">
            {streams.map((s) => (
              <RevealItem className="row" key={s.slug}>
                <span className="row__title">{s.event}</span>
                <span className="row__cell">{s.venue}</span>
                <span className="row__cell mono">{s.date}</span>
                <span className="row__cell">{s.platforms}</span>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="photos-peek">
        <div className="container">
          <SectionHead id="photos-peek" title="Stills from the same stories." action={{ href: "/gallery", label: "Open the gallery" }} />
          <RevealGroup className="grid grid--4">
            {photoPeek.map((p) => (
              <RevealItem key={p.slug}><Link href="/gallery" className="frame frame--hover ratio-4x3" aria-label={`${p.alt} — open gallery`}>
                <Image src={p.image} alt={p.alt} fill sizes="(min-width: 1000px) 25vw, 50vw" placeholder={p.meta.blurDataURL ? "blur" : "empty"} blurDataURL={p.meta.blurDataURL} />
              </Link></RevealItem>
            ))}
          </RevealGroup>
          <Reveal as="p" style={{ marginTop: 24 }}>
            <Link href="/gallery" className="btn btn--ghost">All photos <ArrowRight className="arrow" /></Link>
          </Reveal>
        </div>
      </section>

      <CtaBand title="Need your event filmed or streamed?" text="Tell me the date, venue and what you need — I'll come back with a quote." />
    </>
  );
}

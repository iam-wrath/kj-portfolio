import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getServices, getStreamEvents } from "@/lib/content";
import { CtaBand, PageHead, SectionHead } from "@/components/blocks";
import { RevealGroup, RevealItem } from "@/components/reveal";
import { ArrowRight, Radio } from "@/components/icons";

export const metadata: Metadata = {
  title: "Creative services",
  description: "Photography, videography, editing, live streaming and social media content for churches, events and brands in Kumasi.",
};

export default async function ServicesPage() {
  const [services, streams] = await Promise.all([getServices(), getStreamEvents()]);
  return (
    <>
      <PageHead title="From capture to final cut." lead={services.intro}>
        <div className="btn-row">
          <Link href="/contact?type=quote" className="btn btn--primary" data-magnetic>Request a quote <ArrowRight className="arrow" /></Link>
          <Link href="/showcase" className="btn btn--ghost">See the work</Link>
        </div>
      </PageHead>

      <section className="section" style={{ paddingTop: 0 }} aria-label="Creative roles">
        <div className="container roles-list">
          {services.roles.map((r) => (
            <RevealGroup as="article" className="role role--wide" key={r.title} style={{ marginBottom: 16 }}>
              {r.sample ? (
                <div className="frame" data-image-reveal>
                  <Image src={r.sample} alt={`Sample work: ${r.title.toLowerCase()}`} fill sizes="(min-width: 1000px) 45vw, 100vw" />
                </div>
              ) : null}
              <div className="role__body">
                <RevealItem as="h2" className="h2">{r.title}</RevealItem>
                <RevealItem as="p" className="lead">{r.summary}</RevealItem>
              </div>
            </RevealGroup>
          ))}
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="stream-title">
        <div className="container split">
          <RevealGroup className="sticky-col">
            <RevealItem as="h2" id="stream-title" className="h2">Broadcasts that just work.</RevealItem>
            <RevealItem as="p" className="lead" style={{ marginTop: 16 }}>{services.streamingIntro}</RevealItem>
          </RevealGroup>
          <div style={{ display: "grid", gap: 32 }}>
            <RevealGroup as="ul" className="rows" style={{ listStyle: "none", padding: 0 }}>
              {streams.map((s) => (
                <RevealItem as="li" className="row" key={s.slug} style={{ gridTemplateColumns: "1fr" }}>
                  <span className="row__title" style={{ display: "flex", gap: 10, alignItems: "center" }}><Radio /> {s.event}</span>
                  <span className="row__cell">{s.venue} · {s.date} · {s.platforms}</span>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="tools-title">
        <div className="container">
          <SectionHead id="tools-title" title="Tools & equipment." />
          <RevealGroup className="grid grid--3">
            {services.equipment.map((g) => (
              <RevealItem className="card" key={g.group}>
                <h3 className="card__title">{g.group}</h3>
                <ul className="chip-row" style={{ listStyle: "none", padding: 0 }}>
                  {g.items.map((it) => <li className="chip" key={it}>{it}</li>)}
                </ul>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <CtaBand title="Let's plan your next production." text="Share the date, venue and what you need covered — photo, video, stream or all three." />
    </>
  );
}

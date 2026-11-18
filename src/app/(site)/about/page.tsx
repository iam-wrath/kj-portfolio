import type { Metadata } from "next";
import Image from "next/image";
import { getAbout, getCertifications, getImageMeta, getSite } from "@/lib/content";
import { CertGrid, CtaBand, PageHead, SectionHead } from "@/components/blocks";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { Download } from "@/components/icons";

export const metadata: Metadata = {
  title: "About",
  description: "KNUST student in Kumasi on a path into cybersecurity, with a background in media production and a decade of retail management.",
};

export default async function AboutPage() {
  const [site, about, certs] = await Promise.all([getSite(), getAbout(), getCertifications()]);
  const portrait = about.portrait ? await getImageMeta(about.portrait) : null;
  const paragraphs = about.story.split(/\n\s*\n/).filter(Boolean);

  return (
    <>
      <PageHead title="Security mindset. Storyteller's eye." lead={`${site.title}, based in ${site.location}.`}>
        {site.cv ? (
          <a className="btn btn--primary" href={site.cv} download data-magnetic>
            <Download /> Download my CV
          </a>
        ) : null}
      </PageHead>

      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="story-title">
        <div className="container split split--narrow-left">
          {portrait ? (
            <div className="sticky-col">
              <div className="frame ratio-3x4 css-reveal" style={{ "--d": "0.2s" } as React.CSSProperties}>
                <Image src={portrait.src} alt={`Portrait of ${site.name}`} fill sizes="(min-width: 960px) 40vw, 100vw" loading="eager" fetchPriority="high" placeholder={portrait.blurDataURL ? "blur" : "empty"} blurDataURL={portrait.blurDataURL} />
              </div>
            </div>
          ) : null}
          <div style={{ display: "grid", gap: 32 }}>
            <h2 id="story-title" className="sr-only">My story</h2>
            <RevealGroup className="prose">
              {paragraphs.map((p, i) => <RevealItem as="p" key={i}>{p}</RevealItem>)}
            </RevealGroup>
            <Reveal className="card">
              <p style={{ fontSize: "var(--fs-lg)", color: "var(--text)" }}>{about.personal}</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="experience-title">
        <div className="container split">
          <div className="sticky-col">
            <SectionHead id="experience-title" title="Experience." lead="Leading media teams, school roles, and more than a decade managing a retail business." />
          </div>
          {/* The accent line draws itself as you scroll through the list (GSAP, see MotionProvider). */}
          <div className="timeline-wrap" data-timeline>
            <span className="timeline__track" aria-hidden />
            <ol className="timeline">
              {about.leadership.map((l) => (
                <li key={l.role + l.org}>
                  <span className="timeline__period">{l.period}</span>
                  <h3 className="timeline__role">{l.role}</h3>
                  <p className="timeline__org">{l.org}</p>
                  <p className="timeline__sum">{l.summary}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="certs-title">
        <div className="container">
          <SectionHead id="certs-title" title="Credentials." />
          <CertGrid certs={certs} />
        </div>
      </section>

      <CtaBand title="Let's work together." text="Internships, entry-level security roles, or a camera at your next event." />
    </>
  );
}

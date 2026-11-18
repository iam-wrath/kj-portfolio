import Image from "next/image";
import Link from "next/link";
import { getCertifications, getHome, getImageMeta, getPhotos, getServices, getSite, getVideos, formatDate } from "@/lib/content";
import { CertGrid, CtaBand, SectionHead } from "@/components/blocks";
import { ApertureSection } from "@/components/aperture-section";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { ArrowRight } from "@/components/icons";
import { SplitHeading } from "@/components/split-heading";

export default async function HomePage() {
  const [site, home, videos, photos, services, certs] = await Promise.all([
    getSite(),
    getHome(),
    getVideos(),
    getPhotos(),
    getServices(),
    getCertifications(),
  ]);
  const reel = videos.find((v) => v.featured) ?? videos[0];
  const featuredPhotos = await Promise.all(
    photos.filter((p) => p.featured).slice(0, 5).map(async (p) => ({ ...p, meta: await getImageMeta(p.image) }))
  );

  return (
    <>
      {/* ---------- Hero (typographic; the largest paint is text) ---------- */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero__content">
          <SplitHeading
            id="hero-title"
            className="hero__title"
            delay={0.1}
            lines={[
              <>Hi, I&apos;m {site.shortName || site.name}.</>,
              <>I secure systems</>,
              <>&amp; tell stories<span className="accent">.</span></>,
            ]}
          />
          <div className="hero__foot">
            <p className="lead css-reveal" style={{ color: "var(--text)", "--d": "0.45s" } as React.CSSProperties}><strong>{site.name}</strong> — {site.title}</p>
            <div className="btn-row css-reveal" style={{ "--d": "0.55s" } as React.CSSProperties}>
              <Link href="/showcase" className="btn btn--primary" data-magnetic>
                View my work <ArrowRight className="arrow" />
              </Link>
              <Link href="/contact" className="btn btn--ghost" data-magnetic>Contact me</Link>
            </div>
          </div>
          <div className="hero__meta css-reveal" style={{ "--d": "0.65s" } as React.CSSProperties}>
            <span><span className="status-dot" aria-hidden /> Open to internships &amp; bookings</span>
            <span>{site.location}</span>
            <span>KNUST student</span>
            <span>IBM SkillsBuild certified</span>
          </div>
        </div>
      </section>

      {/* ---------- Intro + highlights ---------- */}
      <section className="section" aria-labelledby="intro-title">
        <div className="container">
          <div className="split split--narrow-left" style={{ marginBottom: "var(--s-9)" }}>
            <div style={{ display: "grid", gap: 20, alignContent: "start" }}>
              <h2 id="intro-title" className="h2" data-motion-text="lines">Two crafts. One discipline.</h2>
            </div>
            <div style={{ display: "grid", gap: 28 }}>
              <Reveal as="p" className="lead" style={{ color: "var(--text)", fontSize: "var(--fs-xl)", lineHeight: 1.4 }}>{site.intro}</Reveal>
              <Reveal delay={0.1}>
                <Link href="/about" className="btn btn--ghost">More about me <ArrowRight className="arrow" /></Link>
              </Reveal>
            </div>
          </div>
          <RevealGroup className="stat-row">
            {home.highlights.map((h) => (
              <RevealItem className="stat" key={h.label}>
                <h3 className="stat__label">{h.label}</h3>
                <p className="stat__text">{h.text}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ---------- The one 3D moment: aperture opens onto the featured reel ---------- */}
      {reel ? (
        <ApertureSection
          reel={{ title: reel.title, embedUrl: reel.embedUrl, thumbnail: reel.thumbnail }}
          head={<SectionHead title="Proof of work, not just words." action={{ href: "/showcase", label: "Open the showcase" }} />}
          caption={
            <div className="reel__caption aperture__stage" style={{ marginTop: 8 }}>
              <div>
                <h3 id="reel-title" className="h3">{reel.title}</h3>
                <p className="muted">{[formatDate(reel.date), reel.venue].filter(Boolean).join(" · ")}</p>
              </div>
              <p className="video-card__role">role: {reel.role}</p>
            </div>
          }
        />
      ) : null}

      {/* ---------- Selected photos ---------- */}
      <section className="section" aria-labelledby="photos-title">
        <div className="container">
          <SectionHead id="photos-title" title="Moments, lit and framed." lead="A selection from events, worship, music and portrait sessions." action={{ href: "/gallery", label: "See the full gallery" }} />
          <div className="photo-strip">
            {featuredPhotos.map((p) => (
              <Link key={p.slug} href="/gallery" className="frame frame--hover" data-image-reveal aria-label={`${p.alt} — open gallery`}>
                <Image src={p.image} alt={p.alt} fill sizes="(min-width: 900px) 33vw, 50vw" placeholder={p.meta.blurDataURL ? "blur" : "empty"} blurDataURL={p.meta.blurDataURL} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Creative roles ---------- */}
      <section className="section section--alt" aria-labelledby="roles-title">
        <div className="container">
          <SectionHead id="roles-title" title="The whole multimedia process." lead={services.intro} action={{ href: "/services", label: "All services" }} />
          <RevealGroup className="grid grid--4">
            {services.roles.slice(0, 4).map((r) => (
              <RevealItem key={r.title}>
                <Link href="/services" className="role card--hover" style={{ height: "100%" }}>
                  {r.sample ? (
                    <div className="frame">
                      <Image src={r.sample} alt={`Sample work: ${r.title.toLowerCase()}`} fill sizes="(min-width: 1000px) 25vw, (min-width: 640px) 50vw, 100vw" />
                    </div>
                  ) : null}
                  <div className="role__body">
                    <h3 className="card__title">{r.title}</h3>
                    <p>{r.summary}</p>
                  </div>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ---------- Security track + certs ---------- */}
      <section className="section" aria-labelledby="sec-title">
        <div className="container">
          <SectionHead id="sec-title" title="Building a security career, in public." lead="Certifications, coursework projects and a running log of labs and practice." action={{ href: "/cybersecurity", label: "My learning journey" }} />
          <CertGrid certs={certs.filter((c) => c.kind === "cert")} />
          <Reveal style={{ marginTop: "var(--s-6)" }}>
            <Link href="/projects" className="link">Browse projects — web development, security and study tools</Link>
          </Reveal>
        </div>
      </section>

      <CtaBand title="Have an event to cover or a role to fill?" text="Book photography, video, editing or live streaming — or talk to me about cybersecurity internships." />
    </>
  );
}

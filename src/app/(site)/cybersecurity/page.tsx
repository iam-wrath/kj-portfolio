import type { Metadata } from "next";
import Link from "next/link";
import { formatDate, getCertifications, getCyber, getLearningLog } from "@/lib/content";
import { CertGrid, CtaBand, PageHead, SectionHead } from "@/components/blocks";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { ArrowUpRight } from "@/components/icons";

export const metadata: Metadata = {
  title: "Cybersecurity",
  description: "My cybersecurity learning journey — goals, topics, practice platforms and a running lab log.",
};

export default async function CyberPage() {
  const [cyber, log, certs] = await Promise.all([getCyber(), getLearningLog(), getCertifications()]);
  return (
    <>
      <PageHead title="Learning security, one lab at a time." lead={cyber.intro} />

      <section className="section" style={{ paddingTop: 0 }} aria-label="Goals and topics">
        <div className="container split">
          <Reveal className="term" aria-label="Current goals">
            <div className="term__bar" aria-hidden><i /><i /><i /></div>
            <div className="term__body">
              <span className="c"># goals.txt</span>
              {cyber.goals.map((g, i) => (
                <span key={g}><span className="p">[{i + 1}]</span> {g}</span>
              ))}
              <span className="c"># status</span>
              <span><span className="p">$</span> learning --in-public</span>
            </div>
          </Reveal>
          <RevealGroup style={{ display: "grid", gap: 20 }}>
            <RevealItem as="h2" className="h3">Topics I&apos;m studying</RevealItem>
            <RevealItem as="ul" className="list-check">
              {cyber.topics.map((t) => <li key={t}>{t}</li>)}
            </RevealItem>
            <RevealItem as="h2" className="h3" style={{ marginTop: 16 }}>Where I practise</RevealItem>
            <RevealItem as="ul" className="chip-row" style={{ listStyle: "none", padding: 0 }}>
              {cyber.platforms.map((p) => (
                <li key={p.label}>
                  {p.url ? (
                    <a className="chip chip--accent" href={p.url} target="_blank" rel="noopener noreferrer" style={{ minHeight: 36 }}>
                      {p.label}&nbsp;<ArrowUpRight size={12} />
                    </a>
                  ) : (
                    <span className="chip">{p.label}</span>
                  )}
                </li>
              ))}
            </RevealItem>
          </RevealGroup>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="log-title">
        <div className="container">
          <SectionHead id="log-title" title="Labs, notes & write-ups." lead="A running record of what I've practised. New entries are added over time." />
          {log.length ? (
            <RevealGroup className="grid grid--3">
              {log.map((l) => {
                const inner = (
                  <>
                    <span className="card__index">{formatDate(l.date)} · {l.platform}</span>
                    <h3 className="card__title">{l.title}</h3>
                    <p>{l.summary}</p>
                  </>
                );
                return l.link ? (
                  <RevealItem key={l.slug}><a href={l.link} target="_blank" rel="noopener noreferrer" className="card">{inner}</a></RevealItem>
                ) : (
                  <RevealItem as="article" key={l.slug} className="card">{inner}</RevealItem>
                );
              })}
            </RevealGroup>
          ) : (
            <p className="empty">First write-ups coming soon.</p>
          )}
        </div>
      </section>

      <section className="section" aria-labelledby="sec-certs">
        <div className="container">
          <SectionHead id="sec-certs" title="Verified foundations." action={{ href: "/projects", label: "See projects" }} />
          <CertGrid certs={certs.filter((c) => c.kind === "cert")} />
          <Reveal as="p" className="muted" style={{ marginTop: 32, fontSize: "var(--fs-sm)" }}>
            This site practises what it preaches: HTTPS-only with HSTS, a strict nonce-based Content Security Policy,
            clickjacking protection and no third-party scripts until you press play. <Link className="link" href="/contact">Ask me how.</Link>
          </Reveal>
        </div>
      </section>

      <CtaBand title="Hiring for a security or IT internship?" text="I'd love to talk about how I can contribute and keep learning on your team." />
    </>
  );
}

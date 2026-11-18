import Link from "next/link";
import { ArrowRight, ArrowUpRight, Cap, Shield } from "./icons";
import { Reveal, RevealGroup, RevealItem } from "./reveal";
import { SplitHeading } from "./split-heading";

export function PageHead({ title, lead, children }: { title: string; lead?: string; children?: React.ReactNode }) {
  return (
    <header className="page-head">
      <div className="container page-head__inner">
        <SplitHeading className="h1" text={title} delay={0.05} style={{ maxWidth: "16ch" }} />
        {lead ? <p className="lead css-reveal" style={{ "--d": "0.3s" } as React.CSSProperties}>{lead}</p> : null}
        {children ? <div className="css-reveal" style={{ "--d": "0.4s" } as React.CSSProperties}>{children}</div> : null}
      </div>
    </header>
  );
}

export function SectionHead({ title, lead, action, id }: { title: string; lead?: string; action?: { href: string; label: string }; id?: string }) {
  return (
    <div className={`section-head ${action ? "section-head--row" : ""}`}>
      <div style={{ display: "grid", gap: 20, maxWidth: 820 }}>
        <h2 id={id} className="h2" data-motion-text="lines">{title}</h2>
        {lead ? <Reveal as="p" className="lead" delay={0.1}>{lead}</Reveal> : null}
      </div>
      {action ? (
        <Reveal delay={0.15}>
          <Link href={action.href} className="btn btn--ghost">
            {action.label} <ArrowRight className="arrow" />
          </Link>
        </Reveal>
      ) : null}
    </div>
  );
}

type Cert = { slug: string; name: string; issuer: string; kind: string; date: string; verifyUrl: string | null };
export function CertGrid({ certs }: { certs: Cert[] }) {
  return (
    <RevealGroup className={`grid ${certs.length % 4 === 0 ? "grid--4" : "grid--3"}`}>
      {certs.map((c) => (
        <RevealItem as="article" className="cert" key={c.slug}>
          <span className="cert__badge" aria-hidden>{c.kind === "education" ? <Cap /> : <Shield />}</span>
          <div>
            <h3 className="cert__name">{c.name}</h3>
            <p className="cert__issuer">{c.issuer}</p>
            <p className="cert__meta">
              <span>{c.date}</span>
              {c.verifyUrl ? (
                <a className="link" href={c.verifyUrl} target="_blank" rel="noopener noreferrer">
                  Verify <ArrowUpRight size={12} style={{ display: "inline" }} />
                  <span className="sr-only"> {c.name}</span>
                </a>
              ) : null}
            </p>
          </div>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}

export function CtaBand({ title, text }: { title: string; text: string }) {
  return (
    <section className="section section--tight" aria-label="Get in touch">
      <div className="container">
        <div className="cta-band">
          <h2 className="h2" data-motion-text="lines">{title}</h2>
          <Reveal as="p" className="lead" delay={0.1}>{text}</Reveal>
          <Reveal className="btn-row" delay={0.2}>
            <Link href="/contact?type=quote" className="btn btn--primary" data-magnetic>
              Request a quote <ArrowRight className="arrow" />
            </Link>
            <Link href="/contact" className="btn btn--ghost">Get in touch</Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

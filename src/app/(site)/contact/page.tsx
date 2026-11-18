import type { Metadata } from "next";
import { getSite } from "@/lib/content";
import { PageHead } from "@/components/blocks";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { ContactForm } from "@/components/contact-form";
import { ArrowUpRight, Mail, WhatsApp } from "@/components/icons";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch about cybersecurity opportunities or book photography, video and live streaming.",
};

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const [site, sp] = await Promise.all([getSite(), searchParams]);
  const type = typeof sp.type === "string" ? sp.type : undefined;
  const whatsapp = site.whatsapp ? site.whatsapp.replace(/\D/g, "") : null;

  return (
    <>
      <PageHead
        title={type === "quote" ? "Request a quote." : "Let's talk."}
        lead="Recruiters, event organisers, churches and collaborators — I reply quickly, especially on WhatsApp."
      />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container split split--narrow-left">
          <RevealGroup style={{ display: "grid", gap: 16, alignContent: "start" }}>
            <h2 className="sr-only">Direct contact</h2>
            <RevealItem as="ul" className="contact-links">
              <li>
                <a href={`mailto:${site.email}`}>
                  <span style={{ display: "flex", gap: 12, alignItems: "center" }}><Mail /> {site.email}</span>
                  <span className="k">email</span>
                </a>
              </li>
              {site.whatsappLink ? (
                <li>
                  <a href={site.whatsappLink} target="_blank" rel="noopener noreferrer">
                    <span style={{ display: "flex", gap: 12, alignItems: "center" }}><WhatsApp size={18} /> WhatsApp</span>
                    <span className="k">fastest</span>
                  </a>
                </li>
              ) : null}
              {site.socials.filter((s) => s.url).map((s) => (
                <li key={s.label}>
                  <a href={s.url!} target="_blank" rel="noopener noreferrer">
                    <span>{s.label}</span>
                    <ArrowUpRight />
                  </a>
                </li>
              ))}
            </RevealItem>
            <RevealItem as="p" className="muted" style={{ fontSize: "var(--fs-sm)" }}>Based in {site.location}. Available for travel across Ghana.</RevealItem>
          </RevealGroup>
          <Reveal>
            <h2 className="h3" style={{ marginBottom: 24 }}>{type === "quote" ? "Tell me about your event" : "Send a message"}</h2>
            <ContactForm email={site.email} whatsapp={whatsapp} initialService={type} greetName={site.shortName || site.name} />
          </Reveal>
        </div>
      </section>
    </>
  );
}

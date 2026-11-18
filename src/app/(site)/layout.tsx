import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { WhatsApp } from "@/components/icons";
import { MotionProvider } from "@/motion/MotionProvider";
import { MotionRoot } from "@/components/reveal";
import { Intro } from "@/components/intro";
import { Cursor } from "@/components/cursor";
import { getSite } from "@/lib/content";
import { SITE_URL } from "@/lib/site-url";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const site = await getSite();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    givenName: site.shortName || undefined,
    jobTitle: site.title,
    url: SITE_URL,
    address: { "@type": "PostalAddress", addressLocality: "Kumasi", addressCountry: "GH" },
    alumniOf: "Kwame Nkrumah University of Science and Technology",
    sameAs: site.socials.map((s) => s.url).filter(Boolean),
  };
  return (
    <>
      <Intro name={site.name} />
      <a href="#main" className="skip-link">Skip to content</a>
      <Nav name={site.name} />
      <MotionRoot>
        <MotionProvider>
          <main id="main" tabIndex={-1}>{children}</main>
        </MotionProvider>
      </MotionRoot>
      <Cursor />
      <Footer name={site.name} email={site.email} location={site.location} socials={site.socials} />
      {site.whatsappLink ? (
        <a className="wa-fab" href={site.whatsappLink} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
          <WhatsApp />
        </a>
      ) : null}
      <script
        type="application/ld+json"
        // JSON-LD is data, not executable script; escape "<" so content can't break out of the tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}

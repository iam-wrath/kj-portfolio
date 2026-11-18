import Link from "next/link";
import { NAV_LINKS } from "@/lib/nav-links";

type Props = {
  name: string;
  email: string;
  location: string;
  socials: readonly { label: string; url: string | null }[];
};

export function Footer({ name, email, location, socials }: Props) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
            <p className="h3">Let&apos;s build, secure and tell the story.</p>
            <p className="muted">Open to cybersecurity internships, entry-level roles, and media bookings in {location}.</p>
            <div className="btn-row">
              <Link className="btn btn--primary btn--sm" href="/contact?type=quote">Request a quote</Link>
              <a className="btn btn--ghost btn--sm" href={`mailto:${email}`}>{email}</a>
            </div>
          </div>
          <div>
            <p className="footer-title">Explore</p>
            <ul className="footer-links">
              {NAV_LINKS.map((l) => (
                <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="footer-title">Elsewhere</p>
            <ul className="footer-links">
              {socials.filter((s) => s.url).map((s) => (
                <li key={s.label}>
                  <a href={s.url!} target="_blank" rel="noopener noreferrer">{s.label}</a>
                </li>
              ))}
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {name} · {location}</span>
          <span>HTTPS · CSP · HSTS — built secure by default</span>
        </div>
      </div>
    </footer>
  );
}

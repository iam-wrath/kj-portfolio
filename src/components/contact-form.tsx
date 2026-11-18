"use client";

import { useState } from "react";
import { Mail, WhatsApp } from "./icons";

type Fields = { name: string; email: string; subject: string; service: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const SERVICES = [
  "General enquiry",
  "Cybersecurity / IT opportunity",
  "Photography",
  "Videography",
  "Video or photo editing",
  "Live streaming",
  "Social media content",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (s: string, max: number) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max);

/**
 * No backend: the message is composed in the visitor's own email app or WhatsApp.
 * Nothing is stored or sent by this site, so there is no spam endpoint and no API key.
 */
export function ContactForm({ email, whatsapp, initialService, greetName = "there" }: { email: string; whatsapp: string | null; initialService?: string; greetName?: string }) {
  const [f, setF] = useState<Fields>({
    name: "",
    email: "",
    subject: initialService === "quote" ? "Quote request" : "",
    service: initialService === "quote" ? "Videography" : SERVICES[0],
    message: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState<null | "email" | "whatsapp">(null);

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  function validate(): Fields | null {
    const v: Fields = {
      name: clean(f.name, 100),
      email: clean(f.email, 254),
      subject: clean(f.subject, 150),
      service: SERVICES.includes(f.service) ? f.service : SERVICES[0],
      message: clean(f.message, 3000),
    };
    const e: Errors = {};
    if (v.name.length < 2) e.name = "Please enter your name.";
    if (!EMAIL_RE.test(v.email)) e.email = "Please enter a valid email address.";
    if (v.message.length < 10) e.message = "Please write a short message (at least 10 characters).";
    setErrors(e);
    if (Object.keys(e).length) {
      document.getElementById(`cf-${Object.keys(e)[0]}`)?.focus();
      return null;
    }
    return v;
  }

  const body = (v: Fields) =>
    `Hi ${greetName},\n\n${v.message}\n\n— ${v.name}\n${v.email}\nService: ${v.service}`;

  function send(via: "email" | "whatsapp") {
    const v = validate();
    if (!v) return;
    const subject = v.subject || `${v.service} — enquiry from ${v.name}`;
    const url =
      via === "email"
        ? `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body(v))}`
        : `https://wa.me/${whatsapp}?text=${encodeURIComponent(`*${subject}*\n\n${body(v)}`)}`;
    if (via === "whatsapp") window.open(url, "_blank", "noopener,noreferrer");
    else window.location.href = url;
    setSent(via);
  }

  const field = (k: keyof Fields, label: string, input: React.ReactNode, hint?: string) => (
    <div className="field">
      <label htmlFor={`cf-${k}`}>{label}</label>
      {input}
      {hint ? <span className="hint">{hint}</span> : null}
      {errors[k] ? <span className="field__error" id={`cf-${k}-err`}>{errors[k]}</span> : null}
    </div>
  );
  const aria = (k: keyof Fields) => ({
    id: `cf-${k}`,
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `cf-${k}-err` : undefined,
  });

  return (
    <form className="form" noValidate onSubmit={(e) => { e.preventDefault(); send("email"); }}>
      <div className="form__row">
        {field("name", "Name", <input className="input" autoComplete="name" value={f.name} onChange={set("name")} maxLength={100} required {...aria("name")} />)}
        {field("email", "Email", <input className="input" type="email" autoComplete="email" inputMode="email" value={f.email} onChange={set("email")} maxLength={254} required {...aria("email")} />)}
      </div>
      <div className="form__row">
        {field("subject", "Subject", <input className="input" value={f.subject} onChange={set("subject")} maxLength={150} {...aria("subject")} />, "Optional")}
        {field(
          "service",
          "What's it about?",
          <select className="input" value={f.service} onChange={set("service")} {...aria("service")}>
            {SERVICES.map((s) => <option key={s}>{s}</option>)}
          </select>
        )}
      </div>
      {field(
        "message",
        "Message",
        <textarea className="input" value={f.message} onChange={set("message")} maxLength={3000} required {...aria("message")} />,
        "For quotes, include the date, venue and what you need covered."
      )}
      <div className="btn-row">
        <button type="submit" className="btn btn--primary"><Mail /> Send via email</button>
        {whatsapp ? (
          <button type="button" className="btn btn--ghost" onClick={() => send("whatsapp")}><WhatsApp size={18} /> Send via WhatsApp</button>
        ) : null}
      </div>
      <p className="form__note" role="status" aria-live="polite">
        {sent === "email"
          ? "Your email app should have opened with the message ready — just press send."
          : sent === "whatsapp"
            ? "WhatsApp opened in a new tab with your message ready to send."
            : "This form opens your own email app or WhatsApp with the message pre-filled. Nothing is stored on this site."}
      </p>
    </form>
  );
}

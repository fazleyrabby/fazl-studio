import { useState } from "react";
import { TLink } from "./Transition";
import { TextReveal, Reveal } from "~/motion/Reveal";
import { mailto, site } from "~/data/site";

/** The end of the experience (spec §7.8): one invitation, one button, the address. */
export function Contact() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = mailto;
    }
  };

  return (
    <section id="contact" aria-labelledby="contact-title" className="gutter pt-[18vh] pb-16">
      <TextReveal as="h2" className="type-display text-(length:--text-display)">
        <span id="contact-title">
          Let&rsquo;s build something people remember.
        </span>
      </TextReveal>

      <Reveal className="mt-14 flex flex-col gap-8 md:mt-20 md:flex-row md:items-end md:justify-between">
        <a href={mailto} data-reveal-item className="btn btn-solid self-start text-[0.875rem]! md:px-8! md:py-6!">
          Start a project <span className="arrow">↗</span>
        </a>
        <div data-reveal-item className="flex flex-col gap-2 md:items-end">
          <button type="button" onClick={copy} className="link-line self-start text-(length:--text-lead) tracking-tight md:self-end">
            {site.email}
          </button>
          <span className="type-label text-muted" aria-live="polite">
            {copied ? "Copied to clipboard" : "Click the address to copy it"}
          </span>
        </div>
      </Reveal>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="gutter mt-10 border-t border-line pt-8 pb-10">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="text-lg font-semibold tracking-tight uppercase">Fazl Studio</p>
          <p className="type-label mt-2 text-muted">Creative Technology</p>
          <p className="type-label text-muted">3D, Motion, Interactive</p>
        </div>
        <nav aria-label="Footer" className="type-label flex flex-col gap-2 md:col-span-3">
          <TLink to="/work" className="link-line self-start">
            Work
          </TLink>
          <TLink to="/studio" className="link-line self-start">
            Studio
          </TLink>
          <a href={mailto} className="link-line self-start">
            Contact
          </a>
        </nav>
        <ul className="type-label flex flex-col gap-2 md:col-span-4 md:items-end">
          {site.socials.map((s) => (
            <li key={s.href}>
              <a href={s.href} target="_blank" rel="noreferrer" className="link-line arrow-host">
                {s.label} <span className="arrow">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="type-label mt-16 flex flex-col gap-2 text-muted md:flex-row md:justify-between">
        <p>&copy; 2026 Fazl Studio</p>
        <p>Made with curiosity + code.</p>
      </div>
    </footer>
  );
}

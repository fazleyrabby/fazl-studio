import { Contact } from "~/components/Contact";
import { site } from "~/data/site";
import { breadcrumbLd, pageMeta } from "~/lib/meta";
import { Reveal, TextReveal } from "~/motion/Reveal";
import { Capabilities, Statement } from "~/sections/Studio";

export const meta = () =>
  pageMeta({
    title: "Studio | Fazl Studio",
    description: "Fazl Studio is an independent creative technology studio building 3D, motion and interactive experiences for the browser.",
    path: "/studio",
    jsonLd: [
      breadcrumbLd([
        { name: "Home", path: "/" },
        { name: "Studio", path: "/studio" },
      ]),
    ],
  });

const disciplines = ["Design", "Motion", "3D", "Code", "Experimentation"];

export default function Studio() {
  return (
    <>
      <section aria-labelledby="studio-title" className="gutter flex min-h-[92dvh] flex-col justify-end pt-28 pb-12">
        <h1 id="studio-title" aria-label="We believe the browser can be more than a document." className="type-display text-[13vw] md:text-(length:--text-title)">
          {["We believe", "the browser can be", "more than", "a document."].map((line, i) => (
            <span key={line} aria-hidden="true" className="rise" style={{ "--i": i } as React.CSSProperties}>
              <span>{line}</span>
            </span>
          ))}
        </h1>
      </section>

      <Statement>We build experiences where design, motion and technology become one.</Statement>

      <section aria-labelledby="who-title" className="gutter grid gap-10 pb-[16vh] md:grid-cols-12">
        <TextReveal as="h2" className="type-label text-muted md:col-span-3">
          <span id="who-title">The studio</span>
        </TextReveal>
        <Reveal className="flex flex-col gap-8 md:col-span-7">
          <p data-reveal-item className="text-(length:--text-lead) leading-snug tracking-tight">
            Fazl Studio is independent and deliberately small. It is run by {site.founder}, a software engineer who designs, models, animates and
            ships the work shown here.
          </p>
          <p data-reveal-item className="max-w-[58ch] leading-relaxed text-muted">
            Small means one person stays with a project from the first sketch to the deployed build, and that the engineering is as considered as
            the motion. Every project on this site is self-initiated and live, so you can open it and judge it yourself.
          </p>
          <ul data-reveal-item className="type-display flex flex-wrap gap-x-6 gap-y-1 text-(length:--text-heading)">
            {disciplines.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </Reveal>
      </section>

      <Capabilities />
      <Contact />
    </>
  );
}

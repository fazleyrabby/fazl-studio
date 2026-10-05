import type { Route } from "./+types/project";
import { Clip, Picture } from "~/components/Media";
import { TLink } from "~/components/Transition";
import { bySlug, nextOf, num, type Project } from "~/data/projects";
import { breadcrumbLd, pageMeta, projectLd } from "~/lib/meta";
import { ClipReveal, Reveal, TextReveal } from "~/motion/Reveal";
import { NotFound } from "~/routes/not-found";

export const meta = ({ params }: Route.MetaArgs) => {
  const p = bySlug(params.slug);
  if (!p) return [{ title: "Not found | Fazl Studio" }];
  return pageMeta({
    title: `${p.title} | ${p.category} | Fazl Studio`,
    description: p.summary,
    path: `/work/${p.slug}`,
    image: `/og/${p.slug}.jpg`,
    imageAlt: p.alts[0],
    type: "article",
    jsonLd: [
      projectLd(p),
      breadcrumbLd([
        { name: "Home", path: "/" },
        { name: "Work", path: "/work" },
        { name: p.title, path: `/work/${p.slug}` },
      ]),
    ],
  });
};

function LiveLink({ project, solid }: { project: Project; solid?: boolean }) {
  return (
    <a href={project.liveUrl} target="_blank" rel="noreferrer" data-cursor="Open ↗" className={`btn ${solid ? "btn-solid" : ""}`}>
      Open live experience <span className="arrow">↗</span>
    </a>
  );
}

export default function ProjectPage({ params }: Route.ComponentProps) {
  const project = bySlug(params.slug);
  if (!project) return <NotFound />;

  const next = nextOf(project);
  const { media, theme, notes } = project;
  const [lead, ...rest] = media.gallery;
  const film = media.film ?? media.preview;
  const titleSize = project.title.length > 9 ? "text-[13.5vw] md:text-(length:--text-display)" : "text-(length:--text-mega)";

  return (
    <article key={project.slug}>
      {/* the page takes on the project's atmosphere; structure and type stay the studio's (spec §7.5) */}
      <style>{`:root{--bg:${theme.background};--fg:${theme.foreground};--accent:${theme.accent};}`}</style>

      <header className="gutter flex flex-col gap-8 pt-28 pb-10 md:gap-10 md:pt-[19vh]">
        <p className="type-label fade-in text-muted">
          {num(project.order)} / {project.category} / {project.year}
        </p>
        <h1 className={`type-display ${titleSize}`}>
          <span className="rise" style={{ "--i": 1 } as React.CSSProperties}>
            <span>{project.title}</span>
          </span>
        </h1>
        <div className="fade-in flex flex-col gap-8 md:flex-row md:items-end md:justify-between" style={{ "--i": 3 } as React.CSSProperties}>
          <p className="max-w-[40ch] text-(length:--text-lead) leading-snug tracking-tight">{project.summary}</p>
          <LiveLink project={project} solid />
        </div>
      </header>

      <section aria-label="Film" className="gutter">
        <ClipReveal>
          <Clip clip={film} smallClip={media.preview} poster={media.poster} alt={`${project.title}: a short capture of the live site`} controls eager />
        </ClipReveal>
      </section>

      <section aria-labelledby="notes-title" className="gutter grid gap-10 py-[16vh] md:grid-cols-12">
        <TextReveal as="h2" className="type-label text-muted md:col-span-3">
          <span id="notes-title">Notes</span>
        </TextReveal>
        <Reveal className="grid gap-12 md:col-span-9 md:grid-cols-3 md:gap-10">
          {(
            [
              ["Concept", notes.concept],
              ["Motion", notes.motion],
              ["Build", notes.build],
            ] as const
          ).map(([label, text]) => (
            <div key={label} data-reveal-item className="border-t border-line pt-5">
              <h3 className="text-2xl font-medium tracking-tight">{label}</h3>
              <p className="mt-4 leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <section aria-label="Gallery" className="gutter flex flex-col gap-[clamp(1rem,2.6vw,3rem)]">
        <ClipReveal>
          <Picture image={media.hero} alt={project.alts[0]} sizes="100vw" className="h-auto w-full" />
        </ClipReveal>

        <div className="grid gap-[clamp(1rem,2.6vw,3rem)] md:grid-cols-12">
          {lead && (
            <ClipReveal className="md:col-span-7">
              <Picture image={lead} alt={project.alts[1] ?? ""} sizes="(min-width: 768px) 58vw, 100vw" className="h-auto w-full" />
            </ClipReveal>
          )}
          {rest[0] && (
            <ClipReveal className="md:col-span-5 md:mt-[18%]">
              <Picture image={rest[0]} alt={project.alts[2] ?? ""} sizes="(min-width: 768px) 40vw, 100vw" className="h-auto w-full" />
            </ClipReveal>
          )}
        </div>

        {/* the same site on a phone */}
        <div className="grid grid-cols-3 gap-[clamp(0.5rem,2.6vw,3rem)] py-[8vh] md:mx-auto md:w-2/3">
          {media.mobile.map((m, i) => (
            <ClipReveal key={m.src} className={i === 1 ? "mt-[14%]" : ""}>
              <Picture image={m} alt={`${project.title} on a phone, screen ${i + 1}`} sizes="(min-width: 768px) 20vw, 33vw" className="h-auto w-full" />
            </ClipReveal>
          ))}
        </div>

        {rest.length > 1 && (
          <div className="grid gap-[clamp(1rem,2.6vw,3rem)] md:grid-cols-2">
            {rest.slice(1).map((g, i) => (
              <ClipReveal key={g.src} className={rest.slice(1).length % 2 === 1 && i === 0 ? "md:col-span-2" : ""}>
                <Picture image={g} alt={project.alts[i + 3] ?? ""} sizes="(min-width: 768px) 50vw, 100vw" className="h-auto w-full" />
              </ClipReveal>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="stack-title" className="gutter grid gap-10 py-[16vh] md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <h2 id="stack-title" className="type-label text-muted">
            Built with
          </h2>
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-1 text-(length:--text-heading) leading-[1.05] font-medium tracking-[-0.035em]">
            {project.stack.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          {project.credits && (
            <p className="type-label mt-8 text-muted">{project.credits.join(". ")}</p>
          )}
        </div>
        <div className="flex flex-col items-start gap-4 md:col-span-5 md:items-end">
          <LiveLink project={project} />
          {project.repoUrl && (
            <a href={project.repoUrl} target="_blank" rel="noreferrer" className="type-label link-line arrow-host py-1">
              Source on GitHub <span className="arrow">↗</span>
            </a>
          )}
        </div>
      </section>

      <TLink
        to={`/work/${next.slug}`}
        curtain={next.theme.background}
        data-cursor="Next"
        className="gutter group/next arrow-host block border-t border-line pt-10 pb-[12vh]"
      >
        <p className="type-label text-muted">
          Next project / {num(next.order)}
        </p>
        <p
          className={`type-display mt-4 whitespace-nowrap transition-transform duration-700 ease-(--ease-out-expo) group-hover/next:translate-x-[2vw] ${
            next.title.length > 9 ? "text-[9.5vw]" : "text-(length:--text-display)"
          }`}
        >
          {next.title} <span className="arrow">→</span>
        </p>
      </TLink>
    </article>
  );
}

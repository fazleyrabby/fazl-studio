import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Clip } from "~/components/Media";
import { TLink } from "~/components/Transition";
import { ClipReveal, Reveal } from "~/motion/Reveal";
import { num, type Project } from "~/data/projects";
import { gsap, MOTION_OK } from "~/lib/scroll";

function Stack({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={`type-label flex flex-wrap gap-x-4 gap-y-1 ${className ?? ""}`}>
      {items.map((s) => (
        <li key={s}>{s}</li>
      ))}
    </ul>
  );
}

/**
 * Flagship entry (spec §7.3): one pinned scene. The preview opens from a
 * window to the full screen, then the details arrive over it. Without the
 * pin (mobile, reduced motion) the same markup reads as a stacked entry.
 */
export function Flagship({ project }: { project: Project }) {
  const root = useRef<HTMLElement>(null);
  const to = `/work/${project.slug}`;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: "[data-stage]", start: "top top", end: "+=170%", pin: true, scrub: true },
        });
        tl.fromTo("[data-media]", { clipPath: "inset(22% 31% 22% 31%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", duration: 0.6 }, 0)
          .fromTo("[data-title]", { scale: 1.18 }, { scale: 1, ease: "none", duration: 0.6 }, 0)
          .fromTo("[data-scrim]", { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.25 }, 0.55)
          .fromTo("[data-meta]", { opacity: 0, y: 36 }, { opacity: 1, y: 0, ease: "power2.out", duration: 0.25 }, 0.6)
          .to({}, { duration: 0.15 });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="work" aria-labelledby="flagship-title" className="relative scroll-mt-20">
      <div data-stage className="relative pt-20 md:h-[100dvh] md:overflow-hidden md:pt-0">
        <TLink
          to={to}
          curtain={project.theme.background}
          data-cursor="View"
          data-media
          aria-label={`${project.title}: view project`}
          className="relative block max-md:mx-[clamp(1rem,2.6vw,3rem)] md:absolute md:inset-0"
        >
          <Clip
            clip={project.media.film ?? project.media.preview}
            smallClip={project.media.preview}
            poster={project.media.poster}
            alt={project.alts[1] ?? project.alts[0]}
            fill
            className="aspect-video md:aspect-auto md:size-full"
          />
        </TLink>

        <div data-scrim aria-hidden="true" className="pointer-events-none absolute inset-0 hidden bg-linear-to-t from-black from-5% via-black/55 via-30% to-black/10 to-60% md:block" />

        <div className="gutter pointer-events-none max-md:mt-6 md:absolute md:inset-0 md:flex md:items-center md:justify-center">
          <h2 id="flagship-title" data-title className="type-display text-(length:--text-mega) md:text-white md:mix-blend-difference">
            {project.title}
          </h2>
        </div>

        <div data-meta className="gutter grid gap-6 max-md:mt-4 md:absolute md:inset-x-0 md:bottom-0 md:grid-cols-12 md:items-end md:pb-10 md:text-white">
          <p className="type-label md:col-span-2">
            {num(project.order)} / {project.category}
          </p>
          <p className="max-w-[36ch] text-(length:--text-lead) leading-snug tracking-tight md:col-span-5">{project.summary}</p>
          <Stack items={project.stack} className="max-md:text-muted md:col-span-3 md:text-white/75" />
          <TLink to={to} curtain={project.theme.background} className="btn pointer-events-auto self-start md:col-span-2 md:justify-self-end md:border-white">
            Explore <span className="arrow">→</span>
          </TLink>
        </div>
      </div>
    </section>
  );
}

type Layout = "media-left" | "bleed" | "media-right";

/** Featured entry. Three compositions from one component so the page varies but stays a system. */
export function WorkFeature({ project, layout }: { project: Project; layout: Layout }) {
  const to = `/work/${project.slug}`;
  const titleId = `work-${project.slug}`;

  const media = (
    <ClipReveal>
      <TLink to={to} curtain={project.theme.background} data-cursor="View" aria-label={`${project.title}: view project`} className="block">
        <Clip
          clip={project.media.preview}
          poster={project.media.poster}
          alt={project.alts[0]}
          className="transition-transform duration-[1.2s] ease-(--ease-out-expo) group-hover/work:scale-[1.025]"
        />
      </TLink>
    </ClipReveal>
  );

  const title = (
    <h3
      id={titleId}
      className={`type-display transition-[letter-spacing] duration-700 ease-(--ease-out-expo) group-hover/work:tracking-[-0.03em] ${
        layout === "bleed" ? "text-(length:--text-display)" : "text-(length:--text-title) md:text-[clamp(2.75rem,6.2vw,8rem)]"
      }`}
    >
      <TLink to={to} curtain={project.theme.background}>
        {project.title}
      </TLink>
    </h3>
  );

  const details = (
    <>
      <p data-reveal-item className="type-label text-muted">
        {num(project.order)} / {project.category}
      </p>
      <p data-reveal-item className="max-w-[34ch] text-(length:--text-lead) leading-snug tracking-tight">
        {project.summary}
      </p>
      <Stack items={project.stack} className="text-muted" />
      <TLink data-reveal-item to={to} curtain={project.theme.background} className="type-label link-line arrow-host self-start py-1">
        Explore <span className="arrow">→</span>
      </TLink>
    </>
  );

  if (layout === "bleed") {
    return (
      <article aria-labelledby={titleId} className="group/work gutter">
        {media}
        <div className="mt-6 grid gap-6 md:mt-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">{title}</div>
          <Reveal className="flex flex-col gap-4 md:col-span-4 md:col-start-9">{details}</Reveal>
        </div>
      </article>
    );
  }

  const mediaFirst = layout === "media-left";
  return (
    <article aria-labelledby={titleId} className="group/work gutter grid gap-6 md:grid-cols-12 md:items-end md:gap-10">
      <div className={mediaFirst ? "md:col-span-8" : "md:order-2 md:col-span-8 md:col-start-5"}>{media}</div>
      <div className={`flex flex-col gap-5 ${mediaFirst ? "md:col-span-4" : "md:order-1 md:col-span-4"}`}>
        {title}
        <Reveal className="flex flex-col gap-4">{details}</Reveal>
      </div>
    </article>
  );
}

import { Contact } from "~/components/Contact";
import { TLink } from "~/components/Transition";
import { WorkList } from "~/components/WorkList";
import { featured, flagship, indexed, projects } from "~/data/projects";
import { site } from "~/data/site";
import { pageMeta, projectLd, websiteLd } from "~/lib/meta";
import { TextReveal } from "~/motion/Reveal";
import { Hero } from "~/sections/Hero";
import { Capabilities, Statement } from "~/sections/Studio";
import { Flagship, WorkFeature } from "~/sections/Work";

export const meta = () =>
  pageMeta({ title: site.title, description: site.description, path: "/", jsonLd: [websiteLd, ...projects.map(projectLd)] });

const layouts = ["media-left", "bleed", "media-right"] as const;

export default function Home() {
  return (
    <>
      <Hero />
      <Flagship project={flagship} />

      <div className="flex flex-col gap-[22vh] pt-[22vh]">
        {featured.map((p, i) => (
          <WorkFeature key={p.slug} project={p} layout={layouts[i % layouts.length]} />
        ))}
      </div>

      <section aria-labelledby="more-title" className="gutter pt-[24vh]">
        <div className="mb-8 flex items-end justify-between gap-6">
          <TextReveal as="h2" className="text-(length:--text-heading) leading-none font-medium tracking-[-0.035em]">
            <span id="more-title">More work</span>
          </TextReveal>
          <TLink to="/work" className="type-label link-line arrow-host py-1 whitespace-nowrap">
            All {projects.length} projects <span className="arrow">→</span>
          </TLink>
        </div>
        <WorkList projects={indexed} />
      </section>

      <Statement>We design digital experiences at the intersection of code and motion.</Statement>
      <Capabilities />
      <Contact />
    </>
  );
}

import { Contact } from "~/components/Contact";
import { WorkList } from "~/components/WorkList";
import { projects } from "~/data/projects";
import { absolute, breadcrumbLd, pageMeta } from "~/lib/meta";

export const meta = () =>
  pageMeta({
    title: "Work | Fazl Studio",
    description: "Every Fazl Studio project: 3D product stories, interactive scenes and motion-led brand sites, each with a live link.",
    path: "/work",
    jsonLd: [
      breadcrumbLd([
        { name: "Home", path: "/" },
        { name: "Work", path: "/work" },
      ]),
      {
        "@type": "ItemList",
        name: "Fazl Studio work",
        itemListElement: projects.map((p) => ({ "@type": "ListItem", position: p.order, name: p.title, url: absolute(`/work/${p.slug}`) })),
      },
    ],
  });

export default function Work() {
  return (
    <>
      <section aria-labelledby="work-title" className="gutter pt-[26vh]">
        <h1 id="work-title" className="type-display text-(length:--text-mega)">
          <span className="rise">
            <span>Work</span>
          </span>
        </h1>
        <p className="fade-in mt-6 mb-[10vh] max-w-[44ch] text-(length:--text-lead) leading-snug tracking-tight text-muted" style={{ "--i": 2 } as React.CSSProperties}>
          {projects.length} projects. Every one is live, and every page links to the real thing.
        </p>
        <WorkList projects={projects} headingLevel="h2" />
      </section>
      <Contact />
    </>
  );
}

import type { Project } from "~/data/projects";
import { site } from "~/data/site";

type PageMeta = {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  jsonLd?: Record<string, unknown>[];
};

export const absolute = (path: string) => (site.url ? `${site.url}${path}` : path);

const organization = {
  "@type": "Organization",
  "@id": absolute("/#studio"),
  name: site.name,
  url: absolute("/"),
  description: site.description,
  email: site.email,
  founder: { "@type": "Person", name: site.founder },
  sameAs: site.socials.map((s) => s.href),
};

/** Per-route metadata, present in the prerendered HTML (spec §13.2). */
export function pageMeta({ title, description, path, image = "/og/home.jpg", imageAlt, type = "website", jsonLd = [] }: PageMeta) {
  const alt = imageAlt ?? `${site.name}: ${site.tagline}`;
  return [
    { title },
    { name: "description", content: description },
    { name: "author", content: site.name },
    { name: "robots", content: "index, follow, max-image-preview:large" },
    { property: "og:type", content: type },
    { property: "og:site_name", content: site.name },
    { property: "og:locale", content: "en_US" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: absolute(image) },
    { property: "og:image:type", content: "image/jpeg" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: alt },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: absolute(image) },
    { name: "twitter:image:alt", content: alt },
    ...(site.url ? [{ property: "og:url", content: absolute(path) }, { tagName: "link", rel: "canonical", href: absolute(path) }] : []),
    { "script:ld+json": { "@context": "https://schema.org", "@graph": [organization, ...jsonLd] } },
  ];
}

export const websiteLd = {
  "@type": "WebSite",
  "@id": absolute("/#website"),
  name: site.name,
  url: absolute("/"),
  description: site.description,
  publisher: { "@id": absolute("/#studio") },
  inLanguage: "en",
};

export const projectLd = (p: Project) => ({
  "@type": "CreativeWork",
  name: p.title,
  headline: `${p.title}: ${p.category}`,
  description: p.summary,
  url: absolute(`/work/${p.slug}`),
  image: absolute(`/og/${p.slug}.jpg`),
  dateCreated: p.year,
  genre: p.category,
  keywords: [...p.stack, ...p.tags].join(", "),
  creator: { "@id": absolute("/#studio") },
  sameAs: p.liveUrl,
});

export const breadcrumbLd = (trail: { name: string; path: string }[]) => ({
  "@type": "BreadcrumbList",
  itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: absolute(t.path) })),
});

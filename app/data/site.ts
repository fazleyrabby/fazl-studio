// Contact details default to the ones already public on fazleyrabbi.xyz.
// Replace when the studio has its own domain and inbox (spec §2.2 #3).
export const site = {
  name: "Fazl Studio",
  tagline: "Creative Technology Studio",
  title: "Fazl Studio | Creative Technology, 3D & Interactive Experiences",
  description:
    "Fazl Studio creates immersive websites, 3D experiences, motion-driven interfaces and experimental digital experiences.",
  /** public origin, no trailing slash; empty in local builds (see scripts/site-url.mjs) */
  url: (import.meta.env.VITE_SITE_URL as string | undefined) ?? "",
  email: "fazley111@gmail.com",
  founder: "Fazley Rabbi",
  socials: [
    { label: "GitHub", href: "https://github.com/fazleyrabby" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/fazley-rabby" },
    { label: "X", href: "https://x.com/itsfazley" },
  ],
} as const;

export const mailto = `mailto:${site.email}?subject=${encodeURIComponent("Project enquiry")}`;

import type { Config } from "@react-router/dev/config";
import { projects } from "./app/data/projects";

// Static site: every route is prerendered to HTML so each URL carries its own
// metadata and OG tags (spec §14.1). No server at runtime.
export default {
  ssr: false,
  prerender: ["/", "/work", "/studio", ...projects.map((p) => `/work/${p.slug}`)],
} satisfies Config;

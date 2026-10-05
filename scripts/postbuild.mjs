// After `react-router build`: write sitemap.xml and point robots.txt at it.
import fs from "node:fs/promises";
import path from "node:path";
import { siteUrl } from "./site-url.mjs";

const out = path.resolve("build/client");
const url = siteUrl();

async function routes(dir, base = "") {
  const found = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && !["assets", "media", "og"].includes(entry.name)) found.push(...(await routes(path.join(dir, entry.name), `${base}/${entry.name}`)));
    else if (entry.name === "index.html") found.push(base || "/");
  }
  return found;
}

if (!url) {
  console.warn("postbuild: no site URL (set VITE_SITE_URL). Skipping sitemap.xml; canonical and OG URLs are relative.");
} else {
  const today = new Date().toISOString().slice(0, 10);
  const list = (await routes(out)).sort();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${list
    .map((r) => `  <url><loc>${url}${r === "/" ? "/" : r}</loc><lastmod>${today}</lastmod><priority>${r === "/" ? "1.0" : r.startsWith("/work/") ? "0.8" : "0.6"}</priority></url>`)
    .join("\n")}\n</urlset>\n`;
  await fs.writeFile(path.join(out, "sitemap.xml"), xml);
  await fs.appendFile(path.join(out, "robots.txt"), `\nSitemap: ${url}/sitemap.xml\n`);
  console.log(`postbuild: sitemap.xml with ${list.length} URLs for ${url}`);
}

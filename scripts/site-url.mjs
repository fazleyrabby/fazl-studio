// Public origin of the site, used for canonical URLs, absolute OG image URLs and
// the sitemap. Set VITE_SITE_URL once a custom domain exists; on Vercel it falls
// back to the project's production domain automatically.
export function siteUrl(env = process.env) {
  const explicit = env.VITE_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  if (env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "";
}

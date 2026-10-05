// Budget check against a built site (spec §12): what loads before first scroll,
// LCP and CLS, console errors. usage: node scripts/perf.mjs <baseUrl> <path...>
import { launch, sleep } from './lib.mjs';

const [base, ...routes] = process.argv.slice(2);
const browser = await launch();
for (const route of routes) {
  for (const [kind, vp] of Object.entries({ desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } })) {
    const ctx = await browser.newContext({ viewport: vp, isMobile: kind === 'mobile', hasTouch: kind === 'mobile', deviceScaleFactor: kind === 'mobile' ? 3 : 1 });
    const page = await ctx.newPage();
    const errors = [];
    const reqs = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
    page.on('response', async (r) => {
      const body = await r.body().catch(() => null);
      reqs.push({ url: r.url().replace(base, ''), status: r.status(), bytes: body ? body.length : 0, type: r.request().resourceType() });
    });
    await page.addInitScript(() => {
      window.__lcp = 0;
      window.__cls = 0;
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto(base + route, { waitUntil: 'load' });
    await sleep(4000);
    const m = await page.evaluate(() => ({ lcp: Math.round(window.__lcp), cls: Number(window.__cls.toFixed(4)) }));
    const media = reqs.filter((r) => /\.(mp4|webm)$/.test(r.url));
    const total = reqs.reduce((a, r) => a + r.bytes, 0);
    const by = (t) => Math.round(reqs.filter((r) => r.type === t).reduce((a, r) => a + r.bytes, 0) / 1024);
    console.log(`${route} ${kind}: LCP ${m.lcp}ms CLS ${m.cls} | before scroll: ${reqs.length} requests, ${Math.round(total / 1024)} KB uncompressed (script ${by('script')}, image ${by('image')}, font ${by('font')}, css ${by('stylesheet')}) | videos fetched: ${media.length} | bad: ${reqs.filter((r) => r.status >= 400).map((r) => r.url)} | errors: ${JSON.stringify(errors)}`);
    await ctx.close();
  }
}
await browser.close();

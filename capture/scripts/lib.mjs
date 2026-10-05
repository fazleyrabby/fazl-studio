// Shared capture helpers.
import { chromium } from 'playwright';
import { GPU_ARGS } from './projects.mjs';

export const launch = () => chromium.launch({ headless: true, args: GPU_ARGS });

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export async function openProject(browser, p, { width, height, dpr = 1, mobile = false }) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dpr, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  await page.goto(p.url, { waitUntil: 'load', timeout: 60000 });
  if (p.ready) await p.ready(page);
  else await page.waitForTimeout(5000);
  await page.mouse.move(width / 2, height / 2);
  return { ctx, page };
}

export const maxScroll = (page) => page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);

// Wheel toward an absolute scroll position in small steps so smooth-scroll
// libraries and ScrollTrigger timelines follow along.
export async function wheelTo(page, target) {
  let cur = await page.evaluate(() => window.scrollY);
  let guard = 0;
  while (Math.abs(target - cur) > 4 && guard++ < 600) {
    const d = Math.max(-240, Math.min(240, target - cur));
    await page.mouse.wheel(0, d);
    await page.waitForTimeout(40);
    const next = await page.evaluate(() => window.scrollY);
    if (next === cur && guard % 40 === 0) await page.evaluate((y) => window.scrollTo(0, y), target);
    cur = next;
  }
}

// Eased wheel scroll by `distance` px over `ms`, sent in real time for recording.
export async function glide(page, distance, ms) {
  const t0 = Date.now();
  let sent = 0;
  for (;;) {
    const t = Math.min(1, (Date.now() - t0) / ms);
    const want = distance * easeInOut(t);
    const d = want - sent;
    if (Math.abs(d) >= 1) {
      await page.mouse.wheel(0, d);
      sent += d;
    }
    if (t >= 1) break;
    await sleep(12);
  }
}

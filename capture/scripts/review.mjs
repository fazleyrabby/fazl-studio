// Review pass on the studio site itself: frames along the scroll at desktop and
// mobile sizes, plus console errors. usage: node scripts/review.mjs <baseUrl> <path> [steps]
import fs from 'node:fs/promises';
import path from 'node:path';
import { launch, wheelTo, sleep } from './lib.mjs';

const [base = 'http://localhost:5183', route = '/', stepsArg = '8', only] = process.argv.slice(2);
const steps = Number(stepsArg);
const name = route === '/' ? 'home' : route.replace(/^\//, '').replace(/\//g, '-');
const out = path.resolve('masters/review', name);
await fs.rm(out, { recursive: true, force: true });
await fs.mkdir(out, { recursive: true });

const sizes = { desktop: { width: 1440, height: 900, dpr: 1, mobile: false }, mobile: { width: 390, height: 844, dpr: 2, mobile: true } };
const browser = await launch();
for (const [kind, s] of Object.entries(sizes)) {
  if (only && only !== kind) continue;
  const ctx = await browser.newContext({ viewport: { width: s.width, height: s.height }, deviceScaleFactor: s.dpr, isMobile: s.mobile, hasTouch: s.mobile });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 300)));
  page.on('pageerror', (e) => errors.push('pageerror: ' + String(e).slice(0, 300)));
  page.on('response', (r) => r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
  await page.goto(base + route, { waitUntil: 'load' });
  await sleep(2500);
  await page.mouse.move(s.width * 0.7, s.height * 0.4);
  const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const n = kind === 'mobile' ? Math.min(steps, 11) : steps;
  for (let i = 0; i <= n; i++) {
    const y = Math.round((max * i) / n);
    if (s.mobile) await page.evaluate((v) => window.scrollTo(0, v), y);
    else await wheelTo(page, y);
    await sleep(1300);
    await page.screenshot({ path: path.join(out, `${kind}-${String(i).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 70 });
  }
  const overflowX = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  console.log(name, kind, 'scrollHeight', max + s.height, 'overflowX', overflowX, 'errors', JSON.stringify([...new Set(errors)]));
  await ctx.close();
}
await browser.close();

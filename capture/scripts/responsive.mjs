// Responsive sweep: each route at phone, tablet, laptop and large desktop sizes.
// Reports horizontal overflow and console errors, saves top / middle / end frames.
// usage: node scripts/responsive.mjs <baseUrl> <path...>
import fs from 'node:fs/promises';
import path from 'node:path';
import { launch, sleep } from './lib.mjs';

const [base, ...routes] = process.argv.slice(2);
const sizes = [
  ['phone-360', 360, 640, true],
  ['phone-390', 390, 844, true],
  ['tablet-768', 768, 1024, true],
  ['tablet-1024', 1024, 768, true],
  ['laptop-1280', 1280, 720, false],
  ['desktop-1920', 1920, 1080, false],
];
const out = path.resolve('masters/review/responsive');
await fs.rm(out, { recursive: true, force: true });
await fs.mkdir(out, { recursive: true });
const browser = await launch();
for (const route of routes) {
  const name = route === '/' ? 'home' : route.replace(/^\/|\/$/g, '').replace(/\//g, '-');
  for (const [label, width, height, touch] of sizes) {
    const ctx = await browser.newContext({ viewport: { width, height }, isMobile: touch, hasTouch: touch, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 160)));
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
    await page.goto(base + route, { waitUntil: 'load' });
    await sleep(1800);
    const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    const wide = [];
    for (const [i, f] of [0, 0.22, 0.5, 1].entries()) {
      await page.evaluate((y) => window.scrollTo(0, y), Math.round(max * f));
      await sleep(900);
      await page.screenshot({ path: path.join(out, `${name}-${label}-${i}.jpg`), type: 'jpeg', quality: 60 });
      const over = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        return [...document.querySelectorAll('main *, footer *, header *')]
          .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.right > vw + 2 && getComputedStyle(el).position !== 'fixed'; })
          .slice(0, 3).map((el) => `${el.tagName}.${String(el.className).slice(0, 40)}`);
      });
      wide.push(...over);
    }
    const overflowX = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    console.log(`${name} ${label}: overflowX ${overflowX} | past right edge: ${[...new Set(wide)].join(', ') || 'none'} | errors ${errors.length}`);
    await ctx.close();
  }
}
await browser.close();

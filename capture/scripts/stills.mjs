// Master stills: 1920×1080 @2x desktop and 390×844 @3x mobile (spec §5.1).
// usage: node scripts/stills.mjs [slug]
import fs from 'node:fs/promises';
import path from 'node:path';
import { projects } from './projects.mjs';
import { launch, openProject, wheelTo, maxScroll, sleep } from './lib.mjs';

const only = process.argv[2];

// Scroll fractions chosen from the audit frames; first desktop entry is the hero.
const plan = {
  halo: { desktop: [0.5, 0, 0.25, 0.64, 0.875, 1], mobile: [0, 0.4, 0.8] },
  stackd: { desktop: [0, 0.25, 0.375, 0.5, 0.75, 1], mobile: [0, 0.2, 0.5] },
  'field-theory': { desktop: [0, 0.125, 0.375, 0.5, 0.75, 0.875], mobile: [0, 0.2, 0.4] },
  villa: { desktop: [0.5, 0, 0.25, 0.625], mobile: [0, 0.2, 0.55] },
  portfolio: { desktop: [0, 0.125, 0.375, 0.5, 0.875], mobile: [0, 0.4, 0.8] },
  // park: the site draws its own compass cursor, so keep the pointer out of frame
  'pocket-atlas': { desktop: [0, 0.25, 0.375, 0.5, 0.625, 0.875], mobile: [0, 0.2, 0.6], park: true },
};
// Retro Desk has no scroll: each still is an object focus.
const deskObjects = { desktop: [null, 'crt', 'floppy', 'notebook', 'window', 'phone'], mobile: [null, 'crt', 'window'] };

const sizes = {
  desktop: { width: 1920, height: 1080, dpr: 2, mobile: false },
  mobile: { width: 390, height: 844, dpr: 3, mobile: true },
};

const browser = await launch();
for (const p of projects) {
  if (only && p.slug !== only) continue;
  for (const [kind, size] of Object.entries(sizes)) {
    const dir = path.resolve('masters', p.slug, 'stills');
    await fs.mkdir(dir, { recursive: true });
    const { ctx, page } = await openProject(browser, p, size);
    const name = (i) => path.join(dir, `${kind}-${String(i).padStart(2, '0')}.png`);

    if (p.slug === 'retro-desk') {
      let i = 0;
      for (const o of deskObjects[kind]) {
        if (o) {
          await page.locator(`[data-object="${o}"]`).click({ timeout: 4000 }).catch(() => page.locator(`[data-object="${o}"]`).dispatchEvent('click'));
          await sleep(3800);
        }
        await page.screenshot({ path: name(i++) });
        if (o) {
          await page.keyboard.press('Escape');
          await sleep(2400);
        }
      }
    } else {
      const max = await maxScroll(page);
      const fractions = plan[p.slug][kind];
      if (plan[p.slug].park) await page.mouse.move(size.width - 2, size.height - 2);
      // visit in scroll order, but keep file numbering in plan order
      const order = fractions.map((f, i) => ({ f, i })).sort((a, b) => a.f - b.f);
      for (const { f, i } of order) {
        await wheelTo(page, Math.round(max * f));
        await sleep(1800);
        await page.screenshot({ path: name(i) });
      }
    }
    console.log(p.slug, kind, 'done');
    await ctx.close();
  }
}
await browser.close();

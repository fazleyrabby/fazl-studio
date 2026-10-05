// Phase 1 audit pass: loads each live project at desktop and mobile sizes, records
// console errors, failed requests, transfer size and scroll length, and saves
// reference frames along the scroll for manual scoring.
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { projects, GPU_ARGS } from './projects.mjs';

const OUT = path.resolve('masters/audit');
const only = process.argv[2];
const viewports = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
  mobile: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

const browser = await chromium.launch({ headless: true, args: GPU_ARGS });
const report = [];

for (const p of projects) {
  if (only && p.slug !== only) continue;
  for (const [vpName, vp] of Object.entries(viewports)) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.deviceScaleFactor, isMobile: vp.isMobile, hasTouch: vp.hasTouch });
    const page = await ctx.newPage();
    const errors = [];
    const failed = [];
    let bytes = 0;
    let requests = 0;
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 300)));
    page.on('pageerror', (e) => errors.push('pageerror: ' + String(e).slice(0, 300)));
    page.on('requestfailed', (r) => failed.push(r.url().slice(0, 200) + ' — ' + r.failure()?.errorText));
    page.on('response', async (r) => {
      requests++;
      if (r.status() >= 400) failed.push(`${r.status()} ${r.url().slice(0, 200)}`);
      const len = Number(r.headers()['content-length'] || 0);
      bytes += len;
    });

    const t0 = Date.now();
    await page.goto(p.url, { waitUntil: 'load', timeout: 60000 });
    const loadMs = Date.now() - t0;
    if (p.ready) await p.ready(page);
    else await page.waitForTimeout(6000);
    const readyMs = Date.now() - t0;

    const info = await page.evaluate(() => {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl2') || c.getContext('webgl');
      const dbg = gl && gl.getExtension('WEBGL_debug_renderer_info');
      return {
        title: document.title,
        scrollHeight: document.documentElement.scrollHeight,
        innerHeight: window.innerHeight,
        overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
        canvases: document.querySelectorAll('canvas').length,
        videos: document.querySelectorAll('video').length,
        renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'none',
        h1: document.querySelector('h1')?.innerText?.slice(0, 120) ?? null,
      };
    });

    const dir = path.join(OUT, p.slug, vpName);
    await fs.mkdir(dir, { recursive: true });
    const steps = vpName === 'desktop' ? 8 : 5;
    const max = Math.max(0, info.scrollHeight - info.innerHeight);
    await page.mouse.move(vp.width / 2, vp.height / 2);
    for (let i = 0; i <= steps; i++) {
      const target = Math.round((max * i) / steps);
      // wheel in small increments so smooth-scroll libraries and ScrollTrigger follow
      let cur = await page.evaluate(() => window.scrollY);
      let guard = 0;
      while (cur < target - 4 && guard++ < 400) {
        await page.mouse.wheel(0, Math.min(240, target - cur));
        await page.waitForTimeout(40);
        const next = await page.evaluate(() => window.scrollY);
        if (next === cur && guard > 30 && guard % 30 === 0) await page.evaluate((y) => window.scrollTo(0, y), target);
        cur = next;
      }
      await page.waitForTimeout(1400);
      await page.screenshot({ path: path.join(dir, `scroll-${String(i).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 72 });
      if (max === 0) break;
    }

    report.push({ slug: p.slug, viewport: vpName, loadMs, readyMs, requests, transferKB: Math.round(bytes / 1024), ...info, errors: [...new Set(errors)].slice(0, 12), failed: [...new Set(failed)].slice(0, 12) });
    console.log(p.slug, vpName, 'load', loadMs, 'ms', 'ready', readyMs, 'ms', 'h', info.scrollHeight, 'err', errors.length, 'fail', failed.length, info.renderer);
    await ctx.close();
  }
}

await browser.close();
await fs.writeFile(path.join(OUT, only ? `report-${only}.json` : 'report.json'), JSON.stringify(report, null, 2));

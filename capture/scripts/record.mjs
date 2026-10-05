// Records one composed clip per project as timestamped screencast frames, then
// assembles a constant-30fps lossless-ish master with ffmpeg.
// usage: node scripts/record.mjs [slug]
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { projects } from './projects.mjs';
import { launch, openProject, glide, sleep, maxScroll } from './lib.mjs';

let W = 1920;
let H = 1080;
const only = process.argv[2];
// Heavy scenes drop frames at 1080p in the capture browser; record those smaller.
const sizes = { villa: [1280, 720] };

// Shot lists — one per project, written for that project (spec §5.2).
const shots = {
  halo: async (page) => {
    const max = await maxScroll(page);
    await sleep(1200);
    await glide(page, max * 0.5, 4200); // hero → three blades → exploded
    await sleep(500);
    await glide(page, max * 0.4, 4600); // blade fly-by → airflow
    await sleep(1500);
  },
  stackd: async (page) => {
    const vh = H;
    await sleep(1200);
    await glide(page, vh * 1.7, 3200); // into the layer explosion
    await sleep(1600);
    await glide(page, vh * 1.5, 2600); // signature carousel
    await sleep(1200);
    await glide(page, vh * 1.25, 2400); // menu cards
    await sleep(1000);
  },
  'field-theory': async (page) => {
    const max = await maxScroll(page);
    await sleep(1400);
    await glide(page, max * 0.13, 3200);
    await sleep(700);
    await glide(page, max * 0.26, 4600); // to the category list
    await sleep(400);
    await page.mouse.move(W * 0.3, H * 0.35, { steps: 20 });
    await page.mouse.move(W * 0.3, H * 0.75, { steps: 50 });
    await sleep(900);
  },
  'retro-desk': async (page) => {
    const focus = (o) => page.locator(`[data-object="${o}"]`).click({ timeout: 3000 });
    await sleep(1400);
    await focus('crt');
    await sleep(3400);
    await page.keyboard.press('Escape');
    await sleep(1700);
    await focus('floppy');
    await sleep(3000);
    await focus('window');
    await sleep(3400);
    await page.keyboard.press('Escape');
    await sleep(1800);
  },
  portfolio: async (page) => {
    const max = await maxScroll(page);
    await sleep(1400);
    await glide(page, max * 0.3, 4200); // dawn → midday
    await sleep(500);
    await glide(page, max * 0.32, 4600); // into dusk
    await sleep(500);
    await glide(page, max * 0.3, 3600); // night
    await sleep(1200);
  },
  villa: async (page) => {
    const max = await maxScroll(page);
    await sleep(1200);
    await glide(page, max * 0.13, 3800); // arrival → architecture
    await sleep(500);
    await glide(page, max * 0.14, 3800); // into the living room
    await sleep(900);
    await glide(page, max * 0.26, 4600); // out to the evening exterior
    await sleep(1500);
  },
};

const browser = await launch();
for (const p of projects) {
  if (only && p.slug !== only) continue;
  const dir = path.resolve('masters', p.slug, 'frames');
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });

  [W, H] = sizes[p.slug] ?? [1920, 1080];
  const { ctx, page } = await openProject(browser, p, { width: W, height: H });
  const cdp = await ctx.newCDPSession(page);
  const frames = [];
  const writes = [];
  cdp.on('Page.screencastFrame', (f) => {
    const name = `f${String(frames.length).padStart(5, '0')}.jpg`;
    frames.push({ name, t: f.metadata.timestamp });
    writes.push(fs.writeFile(path.join(dir, name), Buffer.from(f.data, 'base64')));
    cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 96, maxWidth: W, maxHeight: H, everyNthFrame: 1 });
  await shots[p.slug](page);
  await cdp.send('Page.stopScreencast');
  await Promise.all(writes);
  await ctx.close();

  // concat list with real frame durations → constant frame rate master
  let list = '';
  for (let i = 0; i < frames.length; i++) {
    const dur = i < frames.length - 1 ? frames[i + 1].t - frames[i].t : 1 / 30;
    list += `file '${path.join(dir, frames[i].name)}'\nduration ${Math.max(dur, 0.001).toFixed(4)}\n`;
  }
  const listFile = path.resolve('masters', p.slug, 'frames.txt');
  await fs.writeFile(listFile, list);
  const master = path.resolve('masters', p.slug, 'master.mp4');
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-crf', '12', '-preset', 'slow', '-an', master]);
  const secs = frames.length ? frames.at(-1).t - frames[0].t : 0;
  console.log(p.slug, frames.length, 'frames', secs.toFixed(1), 's', (frames.length / secs).toFixed(1), 'fps captured');
}
await browser.close();

// Overview film of a whole page: one continuous glide from the top to the
// footer, recorded as timestamped screencast frames and assembled with ffmpeg.
// usage: node scripts/overview.mjs <url> [seconds] [name]
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { launch, sleep, wheelTo, maxScroll } from './lib.mjs';

const [url = 'https://studio.fazleyrabbi.xyz/', secondsArg = '44', name = 'overview'] = process.argv.slice(2);
const W = 1920;
const H = 1080;
const travel = Number(secondsArg) * 1000;
const RAMP = 2200; // ms to reach and leave cruising speed

const dir = path.resolve('masters', name);
const frameDir = path.join(dir, 'frames');
await fs.rm(frameDir, { recursive: true, force: true });
await fs.mkdir(frameDir, { recursive: true });

const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'load', timeout: 60000 });
await sleep(3000);

// Warm-up pass so every lazy image and clip is fetched before the take.
const max = await maxScroll(page);
for (let i = 1; i <= 16; i++) {
  await wheelTo(page, Math.round((max * i) / 16));
  await sleep(1200);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.reload({ waitUntil: 'load' });
await sleep(3500);

const cdp = await ctx.newCDPSession(page);
const frames = [];
const writes = [];
cdp.on('Page.screencastFrame', (f) => {
  const file = `f${String(frames.length).padStart(5, '0')}.jpg`;
  frames.push({ file, t: f.metadata.timestamp });
  writes.push(fs.writeFile(path.join(frameDir, file), Buffer.from(f.data, 'base64')));
  cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
});
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 96, maxWidth: W, maxHeight: H, everyNthFrame: 1 });

// Trapezoid speed profile: ease up to a steady cruise, ease out at the footer.
const distance = await maxScroll(page);
const position = (ms) => {
  const cruise = distance / (travel - RAMP); // px per ms at full speed
  if (ms < RAMP) return (cruise * ms * ms) / (2 * RAMP);
  if (ms > travel - RAMP) {
    const left = travel - ms;
    return distance - (cruise * left * left) / (2 * RAMP);
  }
  return cruise * (ms - RAMP / 2);
};

await sleep(2200); // hold on the hero
const t0 = Date.now();
let sent = 0;
for (;;) {
  const ms = Math.min(travel, Date.now() - t0);
  const delta = position(ms) - sent;
  if (delta >= 1) {
    await page.mouse.wheel(0, delta);
    sent += delta;
  }
  if (ms >= travel) break;
  await sleep(8);
}
await sleep(2600); // let the smooth scroll settle on the footer

await cdp.send('Page.stopScreencast');
await Promise.all(writes);
await browser.close();

let list = '';
for (let i = 0; i < frames.length; i++) {
  const dur = i < frames.length - 1 ? frames[i + 1].t - frames[i].t : 1 / 60;
  list += `file '${path.join(frameDir, frames[i].file)}'\nduration ${Math.max(dur, 0.001).toFixed(4)}\n`;
}
const listFile = path.join(dir, 'frames.txt');
await fs.writeFile(listFile, list);
const secs = frames.at(-1).t - frames[0].t;
const gaps = frames.slice(1).map((f, i) => f.t - frames[i].t);
const slow = gaps.filter((g) => g > 0.05).length;
console.log(`${frames.length} frames over ${secs.toFixed(1)} s = ${(frames.length / secs).toFixed(1)} fps captured; gaps over 50 ms: ${slow}; scroll distance ${Math.round(distance)} px`);

const out = path.join(dir, `fazl-studio-${name}.mp4`);
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-vf', 'fps=60,format=yuv420p', '-c:v', 'libx264', '-crf', '17', '-preset', 'slow', '-movflags', '+faststart', '-an', out]);
console.log('wrote', out);

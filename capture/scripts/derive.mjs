// Builds web derivatives from masters into ../public/media/<slug>/ (spec §5.3)
// and writes ../app/data/media.json with real dimensions for the site.
// usage: node scripts/derive.mjs [slug]
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { projects } from './projects.mjs';

const only = process.argv[2];
const PUBLIC = path.resolve('../public/media');
const MANIFEST = path.resolve('../app/data/media.json');
const ff = (args) => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args]);
const probe = (file, entry) => execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', entry, '-of', 'csv=p=0', file]).toString().trim();
const kb = async (f) => Math.round((await fs.stat(f)).size / 1024);

async function image(src, outBase, widths, quality = { avif: 50, webp: 78 }) {
  const meta = await sharp(src).metadata();
  const out = [];
  for (const w of widths) {
    const width = Math.min(w, meta.width);
    const height = Math.round((meta.height / meta.width) * width);
    const pipeline = () => sharp(src).resize({ width });
    await pipeline().avif({ quality: quality.avif, effort: 5 }).toFile(`${outBase}-${w}.avif`);
    await pipeline().webp({ quality: quality.webp }).toFile(`${outBase}-${w}.webp`);
    out.push({ w, width, height });
  }
  return out;
}

async function clip(master, outBase, width, height, targetKB, seconds, start = 0) {
  const full = Number(probe(master, 'format=duration') || execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', master]).toString());
  const dur = seconds ? Math.min(seconds, full - start) : full - start;
  const trim = [...(start ? ['-ss', String(start)] : []), ...(seconds ? ['-t', String(dur)] : [])];
  const kbps = Math.floor((targetKB * 8) / dur);
  const vf = `scale=${width}:${height}:flags=lanczos,fps=30,format=yuv420p`;
  const log = path.join(os.tmpdir(), `ff2pass-${process.pid}`);
  ff([...trim, '-i', master, '-vf', vf, '-c:v', 'libx264', '-preset', 'slow', '-b:v', `${kbps}k`, '-pass', '1', '-passlogfile', log, '-an', '-f', 'mp4', '/dev/null']);
  ff([...trim, '-i', master, '-vf', vf, '-c:v', 'libx264', '-preset', 'slow', '-profile:v', 'high', '-b:v', `${kbps}k`, '-pass', '2', '-passlogfile', log, '-an', '-movflags', '+faststart', `${outBase}.mp4`]);
  ff([...trim, '-i', master, '-vf', vf, '-c:v', 'libvpx-vp9', '-b:v', `${kbps}k`, '-row-mt', '1', '-cpu-used', '2', '-pass', '1', '-passlogfile', log, '-an', '-f', 'null', '/dev/null']);
  ff([...trim, '-i', master, '-vf', vf, '-c:v', 'libvpx-vp9', '-b:v', `${kbps}k`, '-row-mt', '1', '-cpu-used', '2', '-pass', '2', '-passlogfile', log, '-an', `${outBase}.webm`]);
  return { width, height, duration: Number(dur.toFixed(2)), mp4KB: await kb(`${outBase}.mp4`), webmKB: await kb(`${outBase}.webm`) };
}

const manifest = existsSync(MANIFEST) ? JSON.parse(await fs.readFile(MANIFEST, 'utf8')) : {};

for (const p of projects) {
  if (only && p.slug !== only) continue;
  const src = path.resolve('masters', p.slug);
  const out = path.join(PUBLIC, p.slug);
  await fs.rm(out, { recursive: true, force: true });
  await fs.mkdir(path.join(out, 'gallery'), { recursive: true });
  const base = `/media/${p.slug}`;
  const entry = {};

  const master = path.join(src, 'master.mp4');
  const [mw, mh] = probe(master, 'stream=width,height').split(',').map(Number);

  // poster = first frame of the clip, so poster → video is seamless
  const posterPng = path.join(src, 'poster.png');
  const start = p.clipStart ?? 0;
  ff([...(start ? ['-ss', String(start)] : []), '-i', master, '-frames:v', '1', '-update', '1', posterPng]);
  await image(posterPng, path.join(out, 'poster'), [1280], { avif: 45, webp: 74 });
  entry.poster = { src: `${base}/poster-1280`, width: 1280, height: 720 };

  // a supplied screencast may be longer than a preview should be: the preview takes its opening seconds
  entry.preview = { src: `${base}/preview`, ...(await clip(master, path.join(out, 'preview'), 1280, 720, 1100, p.previewSeconds, start)) };
  if (mw >= 1920) entry.film = { src: `${base}/film`, ...(await clip(master, path.join(out, 'film'), 1920, 1080, 5400)) };
  else if (p.previewSeconds) entry.film = { src: `${base}/film`, ...(await clip(master, path.join(out, 'film'), mw, mh, 4200, undefined, start)) };

  const stills = (await fs.readdir(path.join(src, 'stills'))).sort();
  const desktop = stills.filter((f) => f.startsWith('desktop-'));
  const mobile = stills.filter((f) => f.startsWith('mobile-'));

  const [h] = await image(path.join(src, 'stills', desktop[0]), path.join(out, 'hero'), [1920, 960]);
  entry.hero = { src: `${base}/hero`, widths: [1920, 960], width: h.width, height: h.height };

  entry.gallery = [];
  for (const [i, f] of desktop.slice(1).entries()) {
    const n = String(i + 1).padStart(2, '0');
    const [g] = await image(path.join(src, 'stills', f), path.join(out, 'gallery', n), [1920, 960]);
    entry.gallery.push({ src: `${base}/gallery/${n}`, widths: [1920, 960], width: g.width, height: g.height });
  }
  entry.mobile = [];
  for (const [i, f] of mobile.entries()) {
    const n = String(i + 1).padStart(2, '0');
    const [m] = await image(path.join(src, 'stills', f), path.join(out, `mobile-${n}`), [780]);
    entry.mobile.push({ src: `${base}/mobile-${n}`, widths: [780], width: m.width, height: m.height });
  }

  manifest[p.slug] = entry;
  console.log(p.slug, 'preview', entry.preview.mp4KB, '/', entry.preview.webmKB, 'KB', entry.film ? `film ${entry.film.mp4KB} / ${entry.film.webmKB} KB` : 'no film');
}

await fs.mkdir(path.dirname(MANIFEST), { recursive: true });
await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');

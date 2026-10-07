// OpenGraph images, 1200×630, one template (spec §13.2):
// FAZL STUDIO · NN / TITLE over the project's strongest frame.
// usage: node scripts/og.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const OUT = path.resolve('../public/og');
await fs.mkdir(OUT, { recursive: true });

// order and titles mirror app/data/projects.ts
const cards = [
  { slug: 'halo', title: 'HALO' },
  { slug: 'stackd', title: 'STACKD' },
  { slug: 'retro-desk', title: 'RETRO DESK' },
  { slug: 'pocket-atlas', title: 'POCKET ATLAS' },
  { slug: 'field-theory', title: 'FIELD / THEORY' },
  { slug: 'portfolio', title: 'FAZLEYRABBI.XYZ' },
  { slug: 'villa', title: 'VILLA' },
];
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const font = `font-family="Helvetica Neue, Helvetica, Arial, sans-serif"`;

const overlay = (label, title, size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#050506" stop-opacity="0.55"/><stop offset="0.45" stop-color="#050506" stop-opacity="0.05"/><stop offset="1" stop-color="#050506" stop-opacity="0.9"/>
  </linearGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <text x="56" y="78" ${font} font-size="26" font-weight="700" fill="#ecebe8" letter-spacing="-0.5">FAZL STUDIO</text>
  <text x="1144" y="78" text-anchor="end" font-family="Menlo, monospace" font-size="20" fill="#ecebe8" letter-spacing="1.5">${esc(label)}</text>
  <text x="52" y="574" ${font} font-size="${size}" font-weight="700" fill="#ecebe8" letter-spacing="${-size * 0.045}">${esc(title)}</text>
</svg>`;

for (const [i, c] of cards.entries()) {
  const src = path.resolve('masters', c.slug, 'stills', 'desktop-00.png');
  const size = c.title.length > 10 ? 104 : 168;
  await sharp(src)
    .resize(1200, 630, { fit: 'cover' })
    .composite([{ input: Buffer.from(overlay(`${String(i + 1).padStart(2, '0')} / WORK`, c.title, size)) }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(OUT, `${c.slug}.jpg`));
}

// home card: type only on the studio ground
const home = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#0a0a0b"/>
  <text x="56" y="78" ${font} font-size="26" font-weight="700" fill="#ecebe8" letter-spacing="-0.5">FAZL STUDIO</text>
  <text x="1144" y="78" text-anchor="end" font-family="Menlo, monospace" font-size="20" fill="#8f8e8c" letter-spacing="1.5">CREATIVE TECHNOLOGY</text>
  <text x="50" y="430" ${font} font-size="150" font-weight="700" fill="#ecebe8" letter-spacing="-7">WE MAKE</text>
  <text x="50" y="570" ${font} font-size="150" font-weight="700" fill="#ecebe8" letter-spacing="-7">THE WEB MOVE.</text>
  <rect x="56" y="250" width="64" height="6" fill="#ff5a2b"/>
</svg>`;
await sharp(Buffer.from(home)).jpeg({ quality: 88, mozjpeg: true }).toFile(path.join(OUT, 'home.jpg'));
console.log('og images:', (await fs.readdir(OUT)).join(', '));

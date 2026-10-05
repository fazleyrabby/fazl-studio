// Source projects in scope (spec §3). Capture reads from the live deployments.
export const projects = [
  {
    slug: 'villa',
    folder: 'immersiveAirbnb',
    url: 'https://immersive-airbnb-ten.vercel.app',
    // ~35 MB of models and textures sit behind a loader
    ready: async (page) => {
      await page.waitForFunction(() => {
        const l = document.getElementById('loader');
        return !l || l.hidden || getComputedStyle(l).display === 'none' || getComputedStyle(l).opacity === '0' || getComputedStyle(l).visibility === 'hidden';
      }, null, { timeout: 120000 });
      await page.waitForTimeout(2500);
    },
  },
  { slug: 'stackd', folder: 'burgerSite', url: 'https://burger-site-olive.vercel.app' },
  { slug: 'field-theory', folder: 'OutDoorFashion', url: 'https://field-theory-kohl.vercel.app' },
  { slug: 'retro-desk', folder: '3dRetroDeskPortfolio', url: 'https://retro-desk-portfolio.vercel.app' },
  { slug: 'halo', folder: '3DFanLanding', url: 'https://halo-fan.vercel.app' },
  { slug: 'portfolio', folder: 'Sites/astro-portfolio', url: 'https://fazleyrabbi.xyz' },
];

export const GPU_ARGS = ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'];

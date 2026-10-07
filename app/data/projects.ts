import manifest from "./media.json";

export type Img = { src: string; widths: number[]; width: number; height: number };
export type Clip = { src: string; width: number; height: number; duration: number };
export type Tag = "3d" | "motion" | "interactive";

export type Project = {
  slug: string;
  title: string;
  kind: "work" | "experiment";
  tier: "flagship" | "featured" | "index";
  order: number;
  year: string;
  category: string;
  /** one sentence, ≤ 140 chars */
  summary: string;
  /** only what the project's dependencies prove */
  stack: string[];
  tags: Tag[];
  liveUrl: string;
  repoUrl?: string;
  theme: { accent: string; background: string; foreground: string };
  media: {
    poster: { src: string; width: number; height: number };
    hero: Img;
    mobile: Img[];
    gallery: Img[];
    preview: Clip;
    film?: Clip;
  };
  /** alt text for hero, then gallery frames in order */
  alts: string[];
  notes: { concept: string; motion: string; build: string };
  credits?: string[];
};

type Entry = Omit<Project, "media" | "order">;
const media = manifest as unknown as Record<string, Project["media"]>;

// Order here is the order on the site. Tiers come from audit/PROJECT_AUDIT.md.
const entries: Entry[] = [
  {
    slug: "halo",
    title: "Halo",
    kind: "work",
    tier: "flagship",
    year: "2026",
    category: "3D product story",
    summary: "A ceiling fan taken apart in mid-air. Scroll explodes the model, flies along one blade and draws the airflow.",
    stack: ["Three.js", "GLTF", "Bloom post-processing", "Vanilla JS"],
    tags: ["3d", "motion"],
    liveUrl: "https://halo-fan.vercel.app",
    theme: { accent: "#b9c7d6", background: "#0c0c0e", foreground: "#f1f1ef" },
    alts: [
      "Halo fan separated into hub, motor housing and blades against a dark studio backdrop",
      "Halo hero: a three-blade ceiling fan lit from below beside the headline Air, reimagined",
      "The fan seen from below with the line Three blades. One balanced system.",
      "Extreme close-up along the edge of a single brushed-metal blade",
      "White airflow lines spiralling out from the spinning blades",
      "The reassembled fan beside the closing line Feel the difference",
    ],
    notes: {
      concept:
        "A product page where the product is the navigation. One model stays on screen from first frame to last, and every scroll position is a camera angle and an exploded state.",
      motion:
        "Scroll scrubs a single timeline: orbit, separation, a fly-by along the blade edge, then airflow lines that trace how the blade moves air.",
      build:
        "Three.js loaded straight from an import map, no bundler. The fan is generated in Blender by script and shipped as GLTF, lit by an HDR environment with a bloom pass. Ready in about two seconds.",
    },
  },
  {
    slug: "stackd",
    title: "STACKD",
    kind: "work",
    tier: "featured",
    year: "2026",
    category: "Brand storefront",
    summary: "A burger brand that explains itself by pulling the burger apart. Nine layers, each labelled as it lifts off the stack.",
    stack: ["Next.js", "React", "GSAP", "Motion", "Lenis", "Tailwind CSS"],
    tags: ["motion", "interactive"],
    liveUrl: "https://burger-site-olive.vercel.app",
    theme: { accent: "#ffc629", background: "#14279b", foreground: "#f6ecd6" },
    alts: [
      "STACKD hero: Burgers stacked seriously right in cream and yellow type on blue beside an illustrated burger",
      "The burger pulled apart into nine labelled layers from brioche crown to brioche heel",
      "Signature Delights carousel on a red background with the Classic Stack in the centre",
      "Menu cards tilted like paper tickets, each with a burger on a different colour",
      "Level up your order: a combo builder with burger, fries and drink and a live price",
      "Footer with the STACKD wordmark in large red letters",
    ],
    notes: {
      concept:
        "Fast food sites show a photo and a price. STACKD shows the build: every layer of the burger separated, named and put back.",
      motion:
        "The hero burger pins and explodes on scroll while callouts draw in from both sides. A carousel, tilted menu cards and a combo builder with a live price keep the same bounce.",
      build:
        "No WebGL. The burger is layered illustration animated with GSAP and Motion, with cart state in Zustand and a static export from Next.js. It is a demo storefront, so no real orders are placed.",
    },
  },
  {
    slug: "retro-desk",
    title: "Retro Desk",
    kind: "work",
    tier: "featured",
    year: "2026",
    category: "Interactive 3D scene",
    summary: "A desk at night with rain on the window. Every object is a door: the CRT boots an OS, the disks hold projects.",
    stack: ["Three.js", "GSAP", "TypeScript", "Vite"],
    tags: ["3d", "interactive"],
    liveUrl: "https://retro-desk-portfolio.vercel.app",
    repoUrl: "https://github.com/fazleyrabby/retro-desk-portfolio",
    theme: { accent: "#f0a868", background: "#07141b", foreground: "#e6ecea" },
    alts: [
      "A lamp-lit desk at night with a CRT computer, keyboard, phone and fan, rain on the window behind",
      "Camera pushed into the CRT screen showing the Fazley OS menu",
      "Four labelled floppy disks under the desk lamp",
      "Two spiral notebooks labelled Work Log and Field Notes",
      "The window with rain running down the glass over wooded hills",
      "A red push-button desk phone seen up close",
    ],
    notes: {
      concept:
        "A portfolio with no pages. The whole site is one desk, and each object on it holds a different part of the story.",
      motion:
        "Choosing an object moves the camera to it and hands over to a small interface: a CRT operating system, labelled floppy disks, a notebook with turning pages. Escape always returns to the desk.",
      build:
        "Props are modelled in Blender and shipped as a single GLB. Rain, lamp light and ambient sound are optional layers on top of one Three.js scene.",
    },
  },
  {
    slug: "pocket-atlas",
    title: "Pocket Atlas",
    kind: "work",
    tier: "featured",
    year: "2026",
    category: "Illustrated travel site",
    summary: "Small-group trips sold like a picture book. Poke the map, pack the bag, drag the postcards, book a ticket.",
    stack: ["React", "GSAP", "Lenis", "React Router", "Tailwind CSS", "Vite"],
    tags: ["motion", "interactive"],
    liveUrl: "https://pocket-atlas-wander.vercel.app",
    theme: { accent: "#d24a1c", background: "#c6e4dc", foreground: "#1b2f44" },
    alts: [
      "Pocket Atlas hero: Pack light. Wander far. over an illustrated lake with pines, mountains and a canoeist",
      "An illustrated island map with six pins beside a card for the Lantern Lake Paddle trip",
      "Trips people brag about: three tilted trip cards with stamps reading New, Few spots and Guide pick",
      "Close view of the trip cards for Lantern Lake Paddle, Three Peaks Ramble and Heron Marsh Safari",
      "What do I bring: twelve packable items beside a backpack with a counter",
      "Postcards from travelers: a stack of postcards with a Next postcard button",
    ],
    notes: {
      concept:
        "A travel company for people who like maps, mud and a proper lunch. Everything is drawn: the lake, the island map, the trip cards, even the cursor, which is a compass.",
      motion:
        "Each section is something to do, not only something to read. Pins on the map open trips, twelve items tap into a backpack that counts them, postcards drag off a stack, and a booking ends with a stamped ticket.",
      build:
        "React with GSAP and Lenis. The illustrations are SVG written as components, so there is no photography and no image weight. It is a demo site and the places are invented.",
    },
  },
  {
    slug: "field-theory",
    title: "FIELD / THEORY",
    kind: "work",
    tier: "featured",
    year: "2026",
    category: "Editorial e-commerce",
    summary: "An outdoor label with the volume turned up. Condensed type at billboard scale over a lookbook, a drop and a journal.",
    stack: ["React", "Framer Motion", "React Router", "Tailwind CSS", "Vite"],
    tags: ["motion"],
    liveUrl: "https://field-theory-kohl.vercel.app",
    theme: { accent: "#b5432a", background: "#dcdcda", foreground: "#0d0d0d" },
    alts: [
      "FIELD / THEORY hero: Built for the wild in huge condensed type over a portrait of a hiker",
      "A photographer in red rock country beside the figures 1987, 26 and 100%",
      "Category list in oversized type: Outerwear, Fleece, Pants, Tees, Accessories",
      "The Weekend Drop on black, marked drop 03 and available now",
      "Lookbook spread with three portraits in outdoor clothing",
      "Field Notes journal with three article cards",
    ],
    notes: {
      concept:
        "Outdoor brands usually whisper. This one sets its headlines at billboard size and lets photography and product share the page like a magazine spread.",
      motion:
        "Type and images reveal on scroll, category rows open onto photography on hover, and the page shifts from light to dark for the limited drop.",
      build:
        "A React storefront with collections, lookbook, journal, wishlist and cart state. Photography is stock and credited below.",
    },
    credits: ["Photography: Unsplash and Pexels contributors"],
  },
  {
    slug: "portfolio",
    title: "fazleyrabbi.xyz",
    kind: "work",
    tier: "index",
    year: "2026",
    category: "Scroll-driven portfolio",
    summary: "One day at a port. The sky moves from dawn to night as a career story scrolls past the cranes.",
    stack: ["Astro", "GSAP", "Lenis", "Tailwind CSS"],
    tags: ["motion", "interactive"],
    liveUrl: "https://fazleyrabbi.xyz",
    repoUrl: "https://github.com/fazleyrabby/astro-portfolio",
    theme: { accent: "#ff9d7a", background: "#0f1438", foreground: "#f2efe6" },
    alts: [
      "Portfolio hero at dawn: an illustrated port with cranes, containers and a lighthouse under a pink sky",
      "Morning chapter: an arcade of small browser games and experiments on a cream panel",
      "Dusk chapter: featured projects over a purple and orange harbour sky",
      "A project case study with an interface screenshot at dusk",
      "Night chapter: the blog list and contact prompt over a starlit harbour",
    ],
    notes: {
      concept:
        "A backend engineer's portfolio told as a single day at the port. Each chapter of the career is a time of day.",
      motion:
        "Scrolling moves the sun. Sky, water and harbour lights shift from dawn through midday and dusk to night, while a rail on the right tracks the chapter.",
      build:
        "Astro with GSAP and Lenis, in English and Bengali. It includes case studies, a request-through-the-stack demo and an arcade of browser experiments.",
    },
  },
  {
    slug: "villa",
    title: "Villa",
    kind: "work",
    tier: "index",
    year: "2026",
    category: "Scroll-driven 3D tour",
    summary: "A house you walk through by scrolling. Eleven chapters from the garden path to the pool at night.",
    stack: ["Three.js", "GSAP", "Lenis", "Vite"],
    tags: ["3d", "motion"],
    liveUrl: "https://immersive-airbnb-ten.vercel.app",
    theme: { accent: "#a9c2a2", background: "#1b1c1a", foreground: "#f0f0ea" },
    alts: [
      "The villa at dusk seen from the terrace, interior lights on and the pool glowing",
      "Arrival view of a low stone villa with palms on a green plot",
      "Living room with a sofa facing a lit fireplace and floor-to-ceiling glass",
      "Aerial night view of the villa and its pool",
    ],
    notes: {
      concept:
        "A rental listing rebuilt as a walk-through. Instead of a photo grid, the camera arrives, steps inside and moves from room to room.",
      motion:
        "Scroll drives the camera along a fixed path through eleven chapters while the light moves from day to evening. Hotspots mark details like the fireplace and the pool.",
      build:
        "A Three.js scene authored in Blender with a level-of-detail pipeline. Work in progress: the live build still carries placeholder copy and takes around half a minute to load.",
    },
  },
];

export const projects: Project[] = entries.map((e, i) => ({ ...e, order: i + 1, media: media[e.slug] }));

export const flagship = projects.find((p) => p.tier === "flagship")!;
export const featured = projects.filter((p) => p.tier === "featured");
export const indexed = projects.filter((p) => p.tier === "index");
export const bySlug = (slug?: string) => projects.find((p) => p.slug === slug);
export const nextOf = (p: Project) => projects[p.order % projects.length];
export const num = (n: number) => String(n).padStart(2, "0");

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Reveal, TextReveal } from "~/motion/Reveal";
import { gsap, SplitText, prefersReducedMotion } from "~/lib/scroll";

/** One sentence at display size. Words come into focus at reading pace as it scrolls (spec §7.1). */
export function Statement({ children, id }: { children: string; id?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const split = SplitText.create(el, {
        type: "words",
        autoSplit: true,
        onSplit: (self) =>
          gsap.fromTo(
            self.words,
            { opacity: 0.16 },
            { opacity: 1, ease: "none", stagger: 0.12, scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 48%", scrub: true } },
          ),
      });
      return () => split.revert();
    },
    { scope: ref },
  );
  return (
    <section className="gutter py-[22vh]">
      <p id={id} ref={ref} className="max-w-[18ch] text-(length:--text-title) leading-[0.95] font-medium tracking-[-0.04em] md:ml-[8.333%]">
        {children}
      </p>
    </section>
  );
}

// Only capabilities the included work demonstrates (spec §7.7).
const capabilities = [
  { title: "Immersive web", terms: ["Three.js", "WebGL", "Shaders"] },
  { title: "Motion design", terms: ["GSAP", "ScrollTrigger", "Motion systems"] },
  { title: "3D experiences", terms: ["Interactive environments", "Product visualisation", "Spatial interfaces"] },
  { title: "Creative development", terms: ["Creative coding", "Generative systems", "GLSL"] },
  { title: "Interactive storytelling", terms: ["Scroll narratives", "Cinematic transitions", "Experimental interfaces"] },
];

export function Capabilities() {
  return (
    <section aria-labelledby="capabilities-title" className="gutter pb-[10vh]">
      <div className="grid gap-10 md:grid-cols-12">
        <TextReveal as="h2" className="type-label text-muted md:col-span-3">
          <span id="capabilities-title">What we do</span>
        </TextReveal>
        <Reveal as="ul" className="md:col-span-9">
          {capabilities.map((c, i) => (
            <li key={c.title} data-reveal-item className="group/cap grid gap-2 border-t border-line py-6 md:grid-cols-9 md:items-baseline md:py-8">
              <span className="type-label text-muted md:col-span-1">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="text-(length:--text-heading) leading-none font-medium tracking-[-0.035em] transition-transform duration-700 ease-(--ease-out-expo) group-hover/cap:translate-x-3 md:col-span-5">
                {c.title}
              </h3>
              <ul className="type-label flex flex-wrap gap-x-4 gap-y-1 text-muted md:col-span-3 md:flex-col">
                {c.terms.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

import { useEffect, useRef, useState } from "react";
import { TLink } from "./Transition";
import { num, type Project } from "~/data/projects";
import { gsap, hasFinePointer, prefersReducedMotion } from "~/lib/scroll";

/**
 * Editorial index (spec §7.4): numbered rows. On fine pointers a preview
 * frame follows the cursor; on touch each row carries its own thumbnail.
 */
export function WorkList({ projects, headingLevel = "h3" }: { projects: Project[]; headingLevel?: "h2" | "h3" }) {
  const list = useRef<HTMLUListElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const Heading = headingLevel;

  useEffect(() => {
    const el = preview.current;
    const host = list.current;
    if (!el || !host || !hasFinePointer() || prefersReducedMotion()) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
    let placed = false;
    const move = (e: PointerEvent) => {
      if (!placed) {
        // first contact: jump to the pointer instead of flying in from the corner
        placed = true;
        gsap.set(el, { x: e.clientX, y: e.clientY });
      }
      xTo(e.clientX);
      yTo(e.clientY);
    };
    const leave = () => {
      placed = false;
    };
    host.addEventListener("pointerleave", leave);
    host.addEventListener("pointermove", move, { passive: true });
    return () => {
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <>
      <ul ref={list} onPointerLeave={() => setActive(null)} className="group/list border-b border-line">
        {projects.map((p, i) => (
          <li key={p.slug} className="border-t border-line transition-opacity duration-500 group-hover/list:opacity-45 hover:opacity-100!">
            <TLink
              to={`/work/${p.slug}`}
              curtain={p.theme.background}
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className="arrow-host grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 gap-y-3 py-5 md:grid-cols-12 md:py-7"
            >
              <span className="type-label text-muted md:col-span-1">{num(p.order)}</span>
              <Heading className="type-display text-[clamp(1.9rem,5.4vw,6rem)] md:col-span-6">{p.title}</Heading>
              <span className="type-label col-start-2 text-muted max-md:row-start-2 md:col-span-3 md:col-start-auto">{p.category}</span>
              <span className="type-label hidden text-muted md:col-span-1 md:block">{p.year}</span>
              <span className="arrow justify-self-end text-xl max-md:col-start-3 max-md:row-start-1 md:col-span-1" aria-hidden="true">
                →
              </span>
              <img
                src={`${p.media.poster.src}.webp`}
                width={p.media.poster.width}
                height={p.media.poster.height}
                alt=""
                loading="lazy"
                decoding="async"
                className="col-span-3 mt-1 aspect-video w-full object-cover md:hidden"
              />
            </TLink>
          </li>
        ))}
      </ul>

      <div
        ref={preview}
        aria-hidden="true"
        className={`pointer-events-none fixed top-0 left-0 z-(--z-index-media) hidden transition-opacity duration-300 md:block ${active === null ? "opacity-0" : "opacity-100"}`}
      >
        <div className="relative aspect-video w-[26vw] max-w-md translate-x-8 -translate-y-1/2 overflow-hidden bg-wash">
          {projects.map((p, i) => (
            <img
              key={p.slug}
              src={`${p.media.poster.src}.webp`}
              width={p.media.poster.width}
              height={p.media.poster.height}
              alt=""
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 size-full object-cover transition-opacity duration-300 ${active === i ? "opacity-100" : "opacity-0"}`}
            />
          ))}
        </div>
      </div>
    </>
  );
}

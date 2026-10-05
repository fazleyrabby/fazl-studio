import { useRef, type ElementType, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, prefersReducedMotion } from "~/lib/scroll";

// Motion primitives (spec §10.3). Initial states are set by JS only, so the
// prerendered HTML is fully visible if scripts never run.

type Common = { as?: ElementType; className?: string; children: ReactNode };

/** Lines rise out of a mask when the block scrolls into view. For headings and statements. */
export function TextReveal({ as: Tag = "div", className, children, delay = 0 }: Common & { delay?: number }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const split = SplitText.create(el, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 108,
            duration: 1,
            ease: "expo.out",
            stagger: 0.08,
            delay,
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          }),
      });
      return () => split.revert();
    },
    { scope: ref },
  );
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

/** Fade and lift on enter. Children with [data-reveal-item] stagger. */
export function Reveal({ as: Tag = "div", className, children, y = 28 }: Common & { y?: number }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const items = el.querySelectorAll("[data-reveal-item]");
      gsap.from(items.length ? items : el, {
        y,
        opacity: 0,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.07,
        scrollTrigger: { trigger: el, start: "top 86%", once: true },
      });
    },
    { scope: ref },
  );
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

/** Container opens with clip-path while its content settles from a slight zoom. */
export function ClipReveal({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const inner = el.firstElementChild;
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 84%", once: true } });
      tl.from(el, { clipPath: "inset(100% 0% 0% 0%)", duration: 1.1, ease: "expo.out" });
      if (inner) tl.from(inner, { scale: 1.15, duration: 1.4, ease: "expo.out" }, 0);
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={`overflow-hidden ${className ?? ""}`}>
      {children}
    </div>
  );
}

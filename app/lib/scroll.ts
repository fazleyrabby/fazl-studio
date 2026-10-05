import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

const isBrowser = typeof window !== "undefined";

if (isBrowser) gsap.registerPlugin(ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText };

export const prefersReducedMotion = () => isBrowser && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const hasFinePointer = () => isBrowser && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/** Media query for choreography that needs room and consent: pins, scrubs, parallax. */
export const MOTION_OK = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

let lenis: Lenis | null = null;

/** Lenis driven from GSAP's ticker so scroll and ScrollTrigger share one rAF loop (spec §10.2). */
export function startSmoothScroll() {
  if (!isBrowser || lenis || prefersReducedMotion() || !hasFinePointer()) return () => {};
  lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1 });
  lenis.on("scroll", ScrollTrigger.update);
  const tick = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  };
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else if (isBrowser) window.scrollTo(0, 0);
}

export function scrollToElement(el: Element | null) {
  if (!el) return;
  if (lenis) lenis.scrollTo(el as HTMLElement, { duration: 1.2 });
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

export function lockScroll(locked: boolean) {
  if (lenis) locked ? lenis.stop() : lenis.start();
  else if (isBrowser) document.documentElement.style.overflow = locked ? "hidden" : "";
}

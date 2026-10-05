import { useEffect, useRef } from "react";
import { gsap, hasFinePointer, prefersReducedMotion } from "~/lib/scroll";

/**
 * Pointer follower (spec §9.3). Fine pointers only. The native cursor stays
 * visible; this adds a dot that grows into a label over [data-cursor] targets.
 */
export function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    const text = label.current;
    if (!el || !text || !hasFinePointer() || prefersReducedMotion()) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3" });
    let shown = false;
    let current = "";

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      xTo(e.clientX);
      yTo(e.clientY);
      if (!shown) {
        shown = true;
        gsap.set(el, { x: e.clientX, y: e.clientY });
        el.dataset.visible = "true";
      }
      const target = (e.target as Element | null)?.closest<HTMLElement>("[data-cursor]");
      const next = target?.dataset.cursor ?? "";
      if (next !== current) {
        current = next;
        if (next) text.textContent = next;
        el.dataset.active = next ? "true" : "false";
      }
    };
    const leave = () => {
      shown = false;
      el.dataset.visible = "false";
    };

    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div
      ref={root}
      aria-hidden="true"
      data-visible="false"
      data-active="false"
      className="group pointer-events-none fixed top-0 left-0 z-(--z-index-cursor) opacity-0 transition-opacity duration-300 data-[visible=true]:opacity-100"
    >
      <div className="flex size-24 -translate-x-1/2 -translate-y-1/2 scale-[0.09] items-center justify-center rounded-full bg-fg text-bg transition-transform duration-500 ease-(--ease-out-expo) group-data-[active=true]:scale-100">
        <span
          ref={label}
          className="type-label opacity-0 transition-opacity duration-200 group-data-[active=true]:opacity-100 group-data-[active=true]:delay-150"
        />
      </div>
    </div>
  );
}

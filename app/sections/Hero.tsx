import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import type { HeroScene } from "~/three/heroScene";
import { gsap, MOTION_OK, prefersReducedMotion, scrollToElement } from "~/lib/scroll";

/**
 * Hero (spec §7.2). The copy is plain prerendered HTML; the WebGL field loads
 * after first paint and fades in behind it. On desktop the hero pins for half
 * a viewport while the headline leaves and the field dives into the work.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<HeroScene | null>(null);
  const [sceneState, setSceneState] = useState<"idle" | "ready" | "failed">("idle");

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) {
      setSceneState("failed");
      return;
    }
    let cancelled = false;
    const load = () =>
      import("~/three/heroScene").then(({ mountHeroScene }) => {
        if (cancelled) return;
        scene.current = mountHeroScene(el, {
          reducedMotion: prefersReducedMotion(),
          onReady: () => setSceneState("ready"),
          onFail: () => setSceneState("failed"),
        });
      });
    // after first paint, so the scene never competes with the headline
    const timer = window.setTimeout(load, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      scene.current?.dispose();
      scene.current = null;
    };
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=50%",
            pin: true,
            scrub: true,
            onUpdate: (self) => scene.current?.setProgress(self.progress),
          },
        });
        tl.to("[data-hero-line]", { yPercent: -70, opacity: 0, stagger: 0.06, ease: "power2.in" }, 0)
          .to("[data-hero-aside]", { opacity: 0, y: -24, ease: "power1.in" }, 0)
          .fromTo("[data-hero-next]", { opacity: 0, letterSpacing: "0.5em" }, { opacity: 1, letterSpacing: "-0.045em", ease: "power2.out" }, 0.45);
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="hero-title" className="relative flex min-h-[100dvh] flex-col justify-end overflow-hidden">
      <canvas
        ref={canvas}
        aria-hidden="true"
        className={`absolute inset-0 size-full transition-opacity duration-1000 ${sceneState === "ready" ? "opacity-100" : "opacity-0"}`}
      />

      {/* arrives as the headline leaves: the hand-off into the work */}
      <p
        data-hero-next
        aria-hidden="true"
        className="type-display pointer-events-none absolute inset-0 hidden items-center justify-center text-(length:--text-title) opacity-0 md:flex"
      >
        Selected work
      </p>

      <div className="gutter relative grid gap-8 pt-24 pb-8 md:grid-cols-12 md:items-end md:pb-10">
        <h1 id="hero-title" aria-label="We make the web move." className="type-display text-[19vw] md:col-span-12 md:text-(length:--text-display)">
          <span aria-hidden="true" data-hero-line className="rise" style={{ "--i": 0 } as React.CSSProperties}>
            <span>We make</span>
          </span>
          <span aria-hidden="true" data-hero-line className="rise" style={{ "--i": 1 } as React.CSSProperties}>
            <span>
              The web<span className="max-md:hidden"> move.</span>
            </span>
          </span>
          <span aria-hidden="true" data-hero-line className="rise md:hidden" style={{ "--i": 2 } as React.CSSProperties}>
            <span>Move.</span>
          </span>
        </h1>

        <div data-hero-aside className="flex flex-col gap-6 md:col-span-12 md:flex-row md:items-end md:justify-between">
          <p className="fade-in max-w-[34ch] text-(length:--text-lead) leading-snug tracking-tight text-muted" style={{ "--i": 4 } as React.CSSProperties}>
            Interactive websites, 3D experiences and motion-driven digital worlds.
          </p>
          <a
            href="#work"
            onClick={(e) => {
              e.preventDefault();
              scrollToElement(document.getElementById("work"));
            }}
            className="btn fade-in self-start md:self-auto"
            style={{ "--i": 5 } as React.CSSProperties}
          >
            See the work <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
    </section>
  );
}

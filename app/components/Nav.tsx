import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { TLink } from "./Transition";
import { mailto } from "~/data/site";
import { ScrollTrigger, lockScroll } from "~/lib/scroll";

const links = [
  { to: "/work", label: "Work" },
  { to: "/studio", label: "Studio" },
];

/** Wide transparent header that compacts into a small floating bar after the first screen (spec §10.6). */
export function Nav() {
  const bar = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const trigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        el.dataset.compact = self.scroll() > 120 ? "true" : "false";
      },
    });
    return () => trigger.kill();
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    lockScroll(open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lockScroll(false);
    };
  }, [open]);

  return (
    <>
      <a
        href="#main"
        className="type-label fixed top-3 left-3 z-(--z-index-curtain) -translate-y-20 bg-fg px-4 py-3 text-bg focus-visible:translate-y-0"
      >
        Skip to content
      </a>

      <header className="pointer-events-none fixed inset-x-0 top-0 z-(--z-index-nav) flex justify-center">
        <div
          ref={bar}
          data-compact="false"
          className="group pointer-events-auto mt-0 flex h-16 w-full items-center justify-between gap-6 border border-transparent px-[clamp(1rem,2.6vw,3rem)] transition-[width,height,margin,background-color,border-color,padding] duration-700 ease-(--ease-out-expo) data-[compact=true]:mt-3 data-[compact=true]:h-12 data-[compact=true]:w-[min(44rem,calc(100%-1.5rem))] data-[compact=true]:border-line data-[compact=true]:bg-[color-mix(in_oklab,var(--bg)_78%,transparent)] data-[compact=true]:px-4 data-[compact=true]:backdrop-blur-md"
        >
          <TLink to="/" className="text-[0.95rem] font-semibold tracking-tight whitespace-nowrap uppercase" aria-label="Fazl Studio, home">
            Fazl Studio
          </TLink>

          <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <TLink
                key={l.to}
                to={l.to}
                aria-current={pathname.startsWith(l.to) ? "page" : undefined}
                className="type-label link-line py-1 aria-[current=page]:bg-size-[100%_1px]"
              >
                {l.label}
              </TLink>
            ))}
            <a href={mailto} className="btn px-4! py-2.5! group-data-[compact=true]:border-transparent group-data-[compact=true]:bg-fg group-data-[compact=true]:text-bg">
              Start a project <span className="arrow">↗</span>
            </a>
          </nav>

          <button
            type="button"
            className="type-label -mr-2 px-2 py-3 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!open}
        className="gutter fixed inset-0 z-(--z-index-menu) flex flex-col justify-end gap-10 bg-bg pt-24 pb-10 md:hidden"
      >
        <nav aria-label="Mobile" className="flex flex-col">
          {[{ to: "/", label: "Home" }, ...links].map((l) => (
            <TLink key={l.to} to={l.to} className="type-display border-t border-line py-4 text-[16vw]">
              {l.label}
            </TLink>
          ))}
        </nav>
        <a href={mailto} className="btn btn-solid justify-between">
          Start a project <span className="arrow">↗</span>
        </a>
      </div>
    </>
  );
}

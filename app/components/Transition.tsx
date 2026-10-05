import { createContext, useCallback, useContext, useEffect, useRef, useState, type ComponentProps, type MouseEvent } from "react";
import { Link, useLocation, useNavigate, useNavigationType } from "react-router";
import { gsap, ScrollTrigger, prefersReducedMotion, scrollToTop } from "~/lib/scroll";

type Go = (to: string, color?: string) => void;
const TransitionContext = createContext<Go>(() => {});

/**
 * Page transition (spec §10.4): a curtain covers the outgoing page, the route
 * swaps underneath, the curtain lifts. Cover + reveal stay under 800ms.
 */
export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();
  const curtain = useRef<HTMLDivElement>(null);
  const state = useRef({ busy: false, covered: false, first: true });
  const [announcement, setAnnouncement] = useState("");

  const go = useCallback<Go>(
    (to, color) => {
      const s = state.current;
      if (s.busy) return;
      if (to === location.pathname) {
        scrollToTop();
        return;
      }
      const el = curtain.current;
      if (!el || prefersReducedMotion()) {
        navigate(to);
        return;
      }
      s.busy = true;
      el.style.background = color ?? "var(--ink)";
      gsap.set(el, { visibility: "visible", clipPath: "inset(100% 0% 0% 0%)" });
      gsap.to(el, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.36,
        ease: "power3.inOut",
        onComplete: () => {
          s.covered = true;
          navigate(to);
        },
      });
    },
    [location.pathname, navigate],
  );

  useEffect(() => {
    const s = state.current;
    if (s.first) {
      s.first = false;
      return;
    }
    if (navigationType !== "POP") scrollToTop();
    requestAnimationFrame(() => ScrollTrigger.refresh());

    // move focus to the new page and announce it
    const h1 = document.querySelector<HTMLElement>("main h1");
    if (h1) {
      h1.tabIndex = -1;
      h1.focus({ preventScroll: true });
    }
    setAnnouncement(document.title);

    const el = curtain.current;
    if (s.covered && el) {
      gsap.to(el, {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 0.4,
        delay: 0.04,
        ease: "power3.inOut",
        onComplete: () => {
          gsap.set(el, { visibility: "hidden" });
          s.busy = false;
          s.covered = false;
        },
      });
    } else {
      s.busy = false;
    }
  }, [location.pathname, navigationType]);

  return (
    <TransitionContext.Provider value={go}>
      {children}
      <div ref={curtain} aria-hidden="true" className="pointer-events-none invisible fixed inset-0 z-(--z-index-curtain)" />
      <div aria-live="polite" role="status" className="sr-only">
        {announcement}
      </div>
    </TransitionContext.Provider>
  );
}

export const usePageTransition = () => useContext(TransitionContext);

type TLinkProps = Omit<ComponentProps<typeof Link>, "to"> & { to: string; curtain?: string };

/** Internal link that plays the page transition. Falls back to a normal navigation for modified clicks. */
export function TLink({ to, curtain, onClick, ...rest }: TLinkProps) {
  const go = usePageTransition();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    go(to, curtain);
  };
  return <Link to={to} prefetch="intent" onClick={handle} {...rest} />;
}

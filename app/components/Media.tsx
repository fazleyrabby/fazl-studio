import { useEffect, useRef, useState } from "react";
import type { Clip as ClipData, Img } from "~/data/projects";
import { prefersReducedMotion } from "~/lib/scroll";

type PictureProps = {
  image: Img;
  alt: string;
  sizes: string;
  eager?: boolean;
  className?: string;
};

const srcSet = (image: Img, ext: string) => image.widths.map((w) => `${image.src}-${w}.${ext} ${w}w`).join(", ");

/** AVIF with WebP fallback, explicit dimensions so nothing shifts on load (spec §11.4). */
export function Picture({ image, alt, sizes, eager, className }: PictureProps) {
  const smallest = Math.min(...image.widths);
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(image, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(image, "webp")} sizes={sizes} />
      <img
        src={`${image.src}-${smallest}.webp`}
        width={image.width}
        height={image.height}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "high" : undefined}
        className={className}
      />
    </picture>
  );
}

// Only one clip plays at a time across the page (spec §11.2).
let playing: HTMLVideoElement | null = null;

type ClipProps = {
  clip: ClipData;
  /** lighter encode used below 768px, so phones never pull the 1080p film */
  smallClip?: ClipData;
  poster: { src: string; width: number; height: number };
  alt: string;
  /** show a pause / play control (used on project films) */
  controls?: boolean;
  eager?: boolean;
  /** fill the parent instead of reserving the poster's aspect ratio */
  fill?: boolean;
  className?: string;
};

/**
 * Poster first, video attached only when the element nears the viewport and
 * played only while it is mostly visible. If autoplay is refused the poster
 * simply stays.
 */
export function Clip({ clip, smallClip, poster, alt, controls, eager, fill, className }: ClipProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [armed, setArmed] = useState(false);
  const [source, setSource] = useState(clip);
  const [live, setLive] = useState(false);
  const [paused, setPaused] = useState(false);
  const userPaused = useRef(false);
  const visible = useRef(false);

  const play = () => {
    const v = video.current;
    if (!v || userPaused.current) return;
    if (playing && playing !== v) playing.pause();
    playing = v;
    v.play().catch(() => {});
  };

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    if (reduced) {
      userPaused.current = true;
      setPaused(true);
    }

    const near = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (smallClip && window.innerWidth < 768) setSource(smallClip);
          setArmed(true);
          near.disconnect();
        }
      },
      { rootMargin: "60% 0px" },
    );
    const inView = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
        if (entry.isIntersecting) play();
        else video.current?.pause();
      },
      { threshold: 0.45 },
    );
    near.observe(el);
    inView.observe(el);
    return () => {
      near.disconnect();
      inView.disconnect();
      if (playing === video.current) playing = null;
    };
  }, []);

  // sources mount after `armed`; start if we are already on screen
  useEffect(() => {
    if (armed && visible.current) play();
  }, [armed]);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      userPaused.current = false;
      setPaused(false);
      setArmed(true);
      play();
    } else {
      userPaused.current = true;
      setPaused(true);
      v.pause();
    }
  };

  return (
    <div ref={wrap} className={`relative overflow-hidden bg-wash ${className ?? ""}`} style={fill ? undefined : { aspectRatio: `${poster.width} / ${poster.height}` }}>
      <picture>
        <source type="image/avif" srcSet={`${poster.src}.avif`} />
        <img
          src={`${poster.src}.webp`}
          width={poster.width}
          height={poster.height}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="absolute inset-0 size-full object-cover"
        />
      </picture>
      <video
        ref={video}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
        onPlaying={() => setLive(true)}
        className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${live ? "opacity-100" : "opacity-0"}`}
      >
        {armed && (
          <>
            <source src={`${source.src}.webm`} type="video/webm" />
            <source src={`${source.src}.mp4`} type="video/mp4" />
          </>
        )}
      </video>
      {controls && (
        <button
          type="button"
          onClick={toggle}
          aria-pressed={!paused}
          className="type-label absolute right-3 bottom-3 border border-white/40 bg-black/55 px-3 py-2 text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-black"
        >
          {paused ? "Play" : "Pause"}
        </button>
      )}
    </div>
  );
}

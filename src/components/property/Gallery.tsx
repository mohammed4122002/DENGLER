"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { SmartImage } from "@/components/site/SmartImage";
import { ArrowIcon, CloseIcon } from "@/components/ui/Icons";
import type { PropertyImage } from "@/lib/types";

/**
 * Editorial gallery: a large lead frame with a filmstrip beneath, and a
 * full-screen lightbox with keyboard navigation.
 *
 * Only the first two frames are eagerly loaded; the strip lazy-loads, which
 * keeps the detail page's LCP to a single image even on a ten-frame set.
 */
export function Gallery({
  images,
  title,
}: {
  images: PropertyImage[];
  title: string;
}) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const count = images.length;
  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + count) % count),
    [count],
  );

  useEffect(() => {
    if (!lightbox) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(false);
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, go]);

  if (count === 0) return null;

  const active = images[index];

  return (
    <>
      <div className="space-y-3">
        <div className="group relative aspect-[16/10] overflow-hidden bg-cream">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <SmartImage
                src={active.image_url}
                alt={active.alt || `${title} — image ${index + 1}`}
                fill
                priority={index === 0}
                sizes="(min-width:1024px) 62vw, 100vw"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="absolute inset-0 cursor-zoom-in"
            aria-label={`Open ${title} gallery full screen`}
          />

          {count > 1 && (
            <>
              <NavButton side="start" onClick={() => go(-1)} label="Previous image" />
              <NavButton side="end" onClick={() => go(1)} label="Next image" />
            </>
          )}

          <p className="pointer-events-none absolute bottom-4 end-4 rounded-full bg-ink/70 px-3 py-1 text-[11px] tracking-[0.14em] text-paper backdrop-blur-md">
            {index + 1} / {count}
          </p>
        </div>

        {count > 1 && (
          <ul className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
            {images.map((image, i) => (
              <li key={image.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show image ${i + 1}`}
                  aria-current={i === index}
                  className={`relative block h-20 w-28 overflow-hidden transition-opacity duration-500 md:h-24 md:w-36 ${
                    i === index ? "opacity-100" : "opacity-45 hover:opacity-80"
                  }`}
                >
                  <SmartImage
                    src={image.image_url}
                    alt=""
                    fill
                    loading={i < 2 ? undefined : "lazy"}
                    sizes="144px"
                    className="object-cover"
                  />
                  {i === index && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gold" aria-hidden />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* --- Lightbox ------------------------------------------------------ */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[80] flex flex-col bg-ink/97 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${title} gallery`}
          >
            <div className="flex items-center justify-between px-5 py-5 md:px-10">
              <p className="font-display text-xl text-paper">{title}</p>
              <button
                type="button"
                onClick={() => setLightbox(false)}
                className="grid h-11 w-11 place-items-center rounded-full border border-paper/25 text-paper transition-colors hover:border-gold-soft hover:text-gold-soft"
                aria-label="Close gallery"
                autoFocus
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <div className="relative flex-1">
              <SmartImage
                key={active.id}
                src={active.image_url}
                alt={active.alt || `${title} — image ${index + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>

            <div className="flex items-center justify-center gap-8 px-5 py-6 text-paper">
              <button
                type="button"
                onClick={() => go(-1)}
                className="grid h-11 w-11 place-items-center rounded-full border border-paper/25 transition-colors hover:border-gold-soft hover:text-gold-soft"
                aria-label="Previous image"
              >
                <ArrowIcon size={16} className="rotate-180" />
              </button>
              <span className="text-xs tracking-[0.2em] text-paper/60">
                {index + 1} / {count}
              </span>
              <button
                type="button"
                onClick={() => go(1)}
                className="grid h-11 w-11 place-items-center rounded-full border border-paper/25 transition-colors hover:border-gold-soft hover:text-gold-soft"
                aria-label="Next image"
              >
                <ArrowIcon size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavButton({
  side,
  onClick,
  label,
}: {
  side: "start" | "end";
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={side === "start" ? { insetInlineStart: "1rem" } : { insetInlineEnd: "1rem" }}
      className="absolute top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-ink/35 text-white opacity-0 backdrop-blur-md transition-all duration-500 hover:border-gold-soft hover:text-gold-soft focus-visible:opacity-100 group-hover:opacity-100"
    >
      <ArrowIcon size={16} className={side === "start" ? "rotate-180" : ""} />
    </button>
  );
}

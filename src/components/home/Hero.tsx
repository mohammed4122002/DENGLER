"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

import { HeroSearch } from "@/components/home/HeroSearch";
import { SmartImage } from "@/components/site/SmartImage";
import { ArrowIcon, PinIcon } from "@/components/ui/Icons";
import { photo } from "@/lib/data/images";
import { isRtl, localePath, type Dictionary, type Locale } from "@/lib/i18n";

/**
 * A light hero: the photograph bleeds from the trailing edge and is washed to
 * white under the copy, which is set in the brand navy.
 *
 * The previous version was the opposite — a full-bleed dusk plate with white
 * type over four scrim passes, three of which existed only to guarantee the
 * headline stayed readable over a photograph an editor could swap at any time.
 * Washing the copy side to near-white instead makes legibility a property of
 * the layout rather than a bet on the image: the gradient ends at white, so
 * the worst case is navy on white rather than navy on whatever got uploaded.
 * `tests/e2e.mjs` still measures it off rendered pixels, now against a forced
 * near-black photograph rather than a near-white one.
 *
 * Timeline (seconds from mount):
 *   0.0  the plate is already pushing in — a 20s scale from 1.10 → 1.00 that
 *        never visibly stops, so the frame is alive before anything else is
 *   0.15 eyebrow
 *   0.35 the headline reveals line by line from behind a mask
 *   0.85 lead, then the search bar, then the actions
 *   1.15 the floating property card arrives from the trailing edge
 *
 * Depth is two layers drifting against the pointer at different rates, spring
 * damped so the scene drifts rather than tracks.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero({
  locale,
  t,
  countries,
}: {
  locale: Locale;
  t: Dictionary;
  countries: string[];
}) {
  const reduce = useReducedMotion();
  const rtl = isRtl(locale);
  const sectionRef = useRef<HTMLElement>(null);

  // --- Pointer parallax -----------------------------------------------------
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 42, damping: 22, mass: 0.9 });
  const smoothY = useSpring(pointerY, { stiffness: 42, damping: 22, mass: 0.9 });

  // The sign flips in RTL so the scene parallaxes with the reading direction.
  const d = rtl ? -1 : 1;
  const plateX = useTransform(smoothX, [-1, 1], [22 * d, -22 * d]);
  const plateY = useTransform(smoothY, [-1, 1], [14, -14]);
  const cardX = useTransform(smoothX, [-1, 1], [-10 * d, 10 * d]);
  const cardY = useTransform(smoothY, [-1, 1], [-7, 7]);

  // --- Scroll hand-off into the next section --------------------------------
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const plateScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.72], [1, 0]);

  useEffect(() => {
    if (reduce) return;

    // Pointer only — a touch drag should scroll the page, not pan the scene.
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointerX.set((event.clientX / window.innerWidth) * 2 - 1);
      pointerY.set((event.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [pointerX, pointerY, reduce]);

  const stage = (delay: number) =>
    reduce
      ? { initial: false as const, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 22 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay, ease: EASE },
        };

  return (
    <section
      ref={sectionRef}
      className="relative isolate w-full overflow-hidden bg-paper pt-[var(--nav-h)]"
      aria-label={t.hero.ariaLabel}
    >
      {/* ── The plate ──────────────────────────────────────────────────── */}
      <motion.div
        className="absolute inset-[-5%] -z-20"
        style={reduce ? undefined : { x: plateX, y: plateY, scale: plateScale }}
        aria-hidden
      >
        <motion.div
          className="relative h-full w-full"
          initial={reduce ? false : { scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 20, ease: "linear" }}
        >
          <SmartImage
            src={photo("heroVillaDusk", 2400)}
            alt=""
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            quality={80}
            className="object-cover object-[65%_50%]"
          />
        </motion.div>
      </motion.div>

      {/* ── The wash ───────────────────────────────────────────────────────
          What makes the copy readable, rather than the photograph being dark
          enough. The first stop is fully opaque on purpose: a wash that only
          reaches 85% leaves the headline sitting on a tinted photograph, which
          is a contrast figure that moves every time the catalogue changes.

          It runs along a different axis per breakpoint, because the copy does.
          Above `lg` the copy takes the leading half and the photograph the
          trailing half, so the wash is horizontal. Below it the copy is
          full-width — a horizontal wash left the last third of every line
          sitting on raw photograph, which is exactly the bug the measured
          contrast check exists to catch, so the small-screen wash runs top to
          bottom and the photograph reads as a footer to the section. */}
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,#ffffff_0%,#ffffff_62%,rgba(255,255,255,0.88)_78%,rgba(255,255,255,0.55)_92%,rgba(255,255,255,0.3)_100%)] lg:hidden"
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10 hidden bg-[linear-gradient(to_var(--wash-to),#ffffff_0%,#ffffff_26%,rgba(255,255,255,0.92)_42%,rgba(255,255,255,0.55)_62%,rgba(255,255,255,0.12)_82%,transparent_100%)] lg:block"
        style={{ ["--wash-to" as string]: rtl ? "left" : "right" }}
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-[linear-gradient(to_top,#ffffff,transparent)]"
        aria-hidden
      />

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="shell relative z-10 grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[minmax(0,1fr)_auto] lg:py-28">
        <motion.div
          className="w-full max-w-2xl"
          style={reduce ? undefined : { y: copyY, opacity: copyOpacity }}
        >
          <motion.p className="eyebrow !text-gold-deep" {...stage(0.15)}>
            {t.hero.eyebrow}
          </motion.p>

          <h1 className="mt-4 text-ink display-xl">
            <MaskedLine delay={0.35} reduce={!!reduce}>
              {t.hero.titleLineOne}
            </MaskedLine>
            <MaskedLine delay={0.48} reduce={!!reduce}>
              {t.hero.titleLineTwo}
            </MaskedLine>
          </h1>

          <motion.p
            className="mt-6 max-w-lg text-base leading-relaxed text-graphite"
            {...stage(0.85)}
          >
            {t.hero.lead}
          </motion.p>

          <motion.div className="mt-8" {...stage(1)}>
            <HeroSearch countries={countries} locale={locale} t={t} />
          </motion.div>

          <motion.div
            className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"
            {...stage(1.12)}
          >
            <Link
              href={localePath(locale, "/properties")}
              className="btn btn-solid group"
            >
              {t.common.exploreProperties}
              <ArrowIcon size={14} className="rtl-flip transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1" />
            </Link>
            <Link
              href={localePath(locale, "/investments")}
              className="btn btn-outline"
            >
              {t.common.investmentOpportunities}
            </Link>
          </motion.div>
        </motion.div>

        {/* ── Floating property card, trailing edge ─────────────────────
            The reference's floating rail, but pointing somewhere real: it is
            a link to an actual listing rather than three buttons for features
            this catalogue does not have. */}
        <motion.div
          className="hidden lg:block"
          style={reduce ? undefined : { x: cardX, y: cardY }}
          initial={reduce ? false : { opacity: 0, x: rtl ? -28 : 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 1.15, ease: EASE }}
        >
          <Link
            href={localePath(locale, "/properties/palm-residence-dubai")}
            className="card card-hover group block w-[19rem] overflow-hidden"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-cream">
              <SmartImage
                src={photo("villaPalmModern", 900)}
                alt=""
                fill
                sizes="304px"
                className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
              />
              <span className="badge badge-gold absolute start-3 top-3">
                {t.hero.nowShowing}
              </span>
            </div>
            <div className="p-4">
              <p className="flex items-center gap-1.5 text-xs text-muted">
                <PinIcon size={12} className="shrink-0" />
                {t.hero.captionMeta}
              </p>
              <p className="mt-1.5 font-display text-lg font-bold leading-tight text-ink">
                {t.hero.captionTitle}
              </p>
              <span className="mt-3 inline-flex items-center gap-2 text-[0.8125rem] font-semibold text-gold-deep">
                {t.common.viewProperty}
                <ArrowIcon
                  size={13}
                  className="rtl-flip transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
                />
              </span>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* ── Scroll cue ─────────────────────────────────────────────────── */}
      <motion.p
        className="relative z-10 hidden items-center justify-center gap-3 pb-10 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-muted md:flex rtl:tracking-normal rtl:normal-case"
        {...stage(1.4)}
        aria-hidden
      >
        {t.hero.scrollCue}
        <motion.span
          className="grid h-8 w-8 place-items-center rounded-full border border-hairline bg-paper text-ink shadow-[var(--shadow-raised)]"
          animate={reduce ? undefined : { y: [0, 5, 0] }}
          transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="11" height="12" viewBox="0 0 11 12" fill="none">
            <path d="M5.5 0v10M1 6l4.5 4.5L10 6" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </motion.span>
      </motion.p>
    </section>
  );
}

/** A headline line that rises out from behind its own mask. */
function MaskedLine({
  children,
  delay,
  reduce,
}: {
  children: React.ReactNode;
  delay: number;
  reduce: boolean;
}) {
  if (reduce) return <span className="block">{children}</span>;

  return (
    // The mask clips at the line box, so it needs room below the baseline for
    // the script's descenders — more in Arabic than in Latin. Both values are
    // measured: `fontcheck` compares each line's ink extents, taken from
    // canvas text metrics, against this box.
    <span className="block overflow-hidden pb-[0.1em] rtl:pb-[0.16em]">
      <motion.span
        className="block"
        initial={{ y: "108%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 1, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

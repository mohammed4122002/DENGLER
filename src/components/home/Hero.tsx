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
import { AreaIcon, ArrowIcon, HomeIcon, PinIcon } from "@/components/ui/Icons";
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
            /* The plate is 2.16:1 and the section is near enough the same, so
               there is almost nothing to crop; centring is right.

               `rtl:-scale-x-100` mirrors it in Arabic. The layout mirrors —
               copy to the right, photograph to the left — but a photograph
               does not, so unmirrored the terrace ended up under the wash and
               the hero read as a plain hazy skyline with its subject erased.
               Flipping the plate puts the terrace back on the photo side and
               the sun back under the copy, which is the composition the wash
               is cut for. It is applied to the image rather than to either
               wrapper because both of those carry motion transforms, and a
               className transform would be overwritten by the inline one.

               The crop moves at `lg`, and only horizontally, because only the
               horizontal is cropped: at 390 the plate is 2.16:1 in a box taller
               than it is wide, so the full height shows and a 23% vertical
               slice is taken from the middle. On this plate the middle is haze
               — the sky between the terrace and the tower — which is why the
               phone hero still looked washed out after the wash itself was
               thin. 62% puts the tower and the lit city in that slice
               instead — a subject you can name, rather than the gap between
               two of them. The mirror flips the offset along with the image, so
               Arabic gets the same content on the other side. */
            className="object-cover object-[62%_center] rtl:-scale-x-100 lg:object-center"
          />
        </motion.div>
      </motion.div>

      {/* ── The wash ───────────────────────────────────────────────────────
          A haze over the photograph, not a panel beside it. No stop is fully
          opaque any more: the plate reads edge to edge, and the copy sits on
          the sky rather than on a white column that happens to touch it.

          Both are anchored to the top leading corner — top-left in English,
          top-right in Arabic — because that is where the copy starts. A
          gradient with one axis puts its white along a whole edge; this one
          puts it in the corner the eye enters from and lets it fall away in
          every other direction, so the bottom of the section is photograph
          rather than fog. `--wash-x` is the only thing the two directions
          differ by.

          The two ellipses are shaped very differently, and that is not a
          styling flourish. Above `lg` the copy takes the leading half and the
          photograph the trailing half, so the ellipse can be roughly as wide as
          it is tall and the corner reads as a corner. Below `lg` the copy runs
          the full width, and a corner-shaped falloff left the last third of
          every line sitting on raw photograph — the exact bug the measured
          contrast check exists to catch. Stretching the mobile ellipse to 250%
          of the viewport keeps the ramp almost horizontal across a line while
          still leaning into the leading corner. The search bar is frosted
          rather than opaque precisely so it can sit over the skyline rather
          than hiding it.

          What sets the numbers is one measurement: with the wash switched off
          entirely, the darkest pixel behind the copy is #b6 under the headline
          and #51 under the lead at 1440 — the lead runs to 41% of the viewport,
          which is where the skyline's towers start. Ink needs #91 to clear
          4.5:1, so 0.46 at that stop lifts #51 to #a0 and the rest of the ramp
          is free. That is the whole argument: the copy was darkened so the
          wash could be thin, rather than the wash thickened so the copy could
          stay pale.

          The mobile ramp is the one place where the two goals actually fight.
          Moving the phone crop to 62% is what put a recognisable tower behind
          the copy instead of haze, and the same move put the city's dark
          windows there: the eyebrow fell to 3.61:1 and the lead to 3.51:1 the
          moment the crop changed. So the top of this ramp is heavier than the
          desktop one and the bottom is lighter — it is carrying the copy over
          a darker plate, then getting out of the way by half height, which is
          where most of the photograph a phone shows actually is.

          The previous ramp held 0.7 there and reached 0.97 at the leading edge.
          It was carrying a check against a photograph forced to pure black,
          which this plate cannot become — it is a constant in
          `src/lib/data/images.ts`, not something an editor can upload. The
          suite now measures this plate and a white one instead, and says so. */}
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(250%_92%_at_var(--wash-x)_0%,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.78)_28%,rgba(255,255,255,0.56)_45%,rgba(255,255,255,0.3)_62%,rgba(255,255,255,0.1)_78%,transparent_92%)] lg:hidden"
        style={{ ["--wash-x" as string]: rtl ? "100%" : "0%" }}
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10 hidden bg-[radial-gradient(100%_140%_at_var(--wash-x)_0%,rgba(255,255,255,0.93)_0%,rgba(255,255,255,0.75)_28%,rgba(255,255,255,0.58)_46%,rgba(255,255,255,0.46)_58%,rgba(255,255,255,0.18)_72%,transparent_88%)] lg:block"
        style={{ ["--wash-x" as string]: rtl ? "100%" : "0%" }}
        aria-hidden
      />

      {/* ── Aurora ───────────────────────────────────────────────────────
          Two blurred blooms under the copy and over the plate. They do the job
          a grey scrim used to do — lift the headline off the photograph — but
          in the brand's own colours and while moving, so the frame reads as
          alive before anything animates into it. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-[5] overflow-hidden">
        <span className="aurora aurora--gold start-[-8%] top-[-18%] h-[46rem] w-[46rem]" />
        <span className="aurora aurora--navy start-[18%] top-[34%] h-[34rem] w-[34rem]" />
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      {/* The copy takes the leading half and the photograph the trailing
          half, which is what the wash is cut to. The column is a grid track
          rather than a `max-w`, so the two always meet at the same seam
          whatever the headline does in either language. */}
      <div className="shell relative z-10 grid items-center gap-12 pb-24 pt-12 md:pb-28 md:pt-16 lg:grid-cols-[minmax(0,32rem)_minmax(0,1fr)] lg:pb-28 lg:pt-20">
        <motion.div
          className="w-full"
          style={reduce ? undefined : { y: copyY, opacity: copyOpacity }}
        >
          {/* The gold is a mark, not the type. `gold-deep` is 3.14:1 on pure
              white at its very best, and this line is 11px uppercase with
              0.2em tracking — the hardest thing on the page to read. It
              measured 2.63:1 as published, which is why the eyebrow is now
              part of what `tests/e2e.mjs` measures. The dot keeps the brand
              colour in the composition at a size where contrast is not a
              legibility question. */}
          <motion.p
            className="eyebrow flex items-center gap-2.5 !text-graphite"
            {...stage(0.15)}
          >
            <span
              className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gold-deep"
              aria-hidden
            />
            {t.hero.eyebrow}
          </motion.p>

          <h1 className="mt-3 text-ink display-xl">
            <MaskedLine delay={0.35} reduce={!!reduce}>
              {t.hero.titleLineOne}
            </MaskedLine>
            <MaskedLine delay={0.48} reduce={!!reduce}>
              {t.hero.titleLineTwo}
            </MaskedLine>
          </h1>

          <motion.p
            /* Ink rather than graphite, and that is what pays for the
               photograph. At 15px this is body text, so it owes 4.5:1, and
               graphite needs a background of at least #be to get there while
               ink clears it at #91. Sixty-odd levels of grey is the difference
               between a wash you look through and a wash you look at. */
            className="mt-5 max-w-lg text-[0.9375rem] leading-relaxed text-ink"
            {...stage(0.85)}
          >
            {t.hero.lead}
          </motion.p>

          {/* Wider than the copy track on purpose, and allowed to overflow
              it. Three labelled selects and a button do not fit in a measure
              set for a headline — squeezed into 32rem every value truncated to
              "Any mark…". In the reference the bar is visibly wider than the
              heading above it, and it has to be. */}
          <motion.div className="mt-7 lg:w-[40rem] lg:max-w-none" {...stage(1)}>
            <HeroSearch countries={countries} locale={locale} t={t} />
          </motion.div>

          <motion.div
            className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"
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

      </div>

      {/* ── Category rail, trailing edge ─────────────────────────────────
          The reference's floating pill stack, pointing at the three things
          this catalogue actually holds rather than at three features it does
          not. `-translate-y-1/2` off the section's own midpoint keeps it
          centred on the plate whatever the copy does in either language. */}
      <motion.nav
        aria-label={t.nav.properties}
        className="absolute top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-1.5 rounded-[16px] border border-white/20 bg-[rgba(7,22,40,0.55)] p-1.5 backdrop-blur-md lg:flex"
        style={{ insetInlineEnd: "clamp(1rem, 2.2vw, 2rem)" }}
        initial={reduce ? false : { opacity: 0, x: rtl ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1.3, ease: EASE }}
      >
        {[
          { href: "/villas", label: t.nav.villas, icon: <HomeIcon size={15} /> },
          { href: "/hotels", label: t.nav.hotels, icon: <AreaIcon size={15} /> },
          { href: "/land", label: t.nav.land, icon: <PinIcon size={15} /> },
        ].map((item) => (
          <Link
            key={item.href}
            href={localePath(locale, item.href)}
            className="flex w-[4.75rem] flex-col items-center gap-1 rounded-[11px] px-2 py-2.5 text-[0.6875rem] font-semibold text-white/85 transition-colors duration-300 hover:bg-white/15 hover:text-white"
          >
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </motion.nav>

      {/* ── Scroll cue ───────────────────────────────────────────────────
          Split, as in the reference: the target sits on the plate where the
          eye already is, and the words sit out of the way on the trailing
          edge. One `motion.div` so both halves share the entrance. */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-6 z-10 hidden md:block"
        {...stage(1.4)}
        aria-hidden
      >
        <div className="shell flex items-center justify-between gap-4">
          <span />
          <motion.span
            className="grid h-10 w-10 place-items-center rounded-full border border-hairline bg-paper text-ink shadow-[var(--shadow-raised)]"
            animate={reduce ? undefined : { y: [0, 5, 0] }}
            transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="12" height="13" viewBox="0 0 11 12" fill="none">
              <path d="M5.5 0v10M1 6l4.5 4.5L10 6" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </motion.span>
          {/* On its own backing, not on the photograph. The plate here is a
              hazy sunrise and the label would have been white on pale sky;
              tinting it to suit this image would only move the problem to the
              next image an editor uploads. */}
          <span className="rounded-full bg-paper/85 px-3.5 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-graphite backdrop-blur-sm rtl:tracking-normal rtl:normal-case">
            {t.hero.scrollCue}
          </span>
        </div>
      </motion.div>

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

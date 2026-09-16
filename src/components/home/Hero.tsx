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

import { SmartImage } from "@/components/site/SmartImage";
import { photo } from "@/lib/data/images";

/**
 * The hero is staged as a short film rather than a banner.
 *
 * Timeline (seconds from mount):
 *   0.0  the plate is already pushing in — a 20s scale from 1.14 → 1.00 that
 *        never visibly stops, so the frame is alive before anything else is
 *   0.3  grade and vignette settle
 *   0.8  DENGLER wordmark fades up
 *   1.4  the headline reveals line by line from behind a mask
 *   2.2  a gold light sweep crosses the building
 *   2.6  sub-line and actions
 *   3.2  the property caption slides in from the trailing edge
 *
 * Depth comes from four layers moving at different rates against the pointer:
 * sky (slowest) → building → light → foreground planting (fastest, inverted).
 * Everything is spring-damped so it drifts rather than tracks.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // --- Pointer parallax -----------------------------------------------------
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springConfig = { stiffness: 42, damping: 22, mass: 0.9 };
  const smoothX = useSpring(pointerX, springConfig);
  const smoothY = useSpring(pointerY, springConfig);

  // Each layer gets its own travel budget, in pixels.
  const skyX = useTransform(smoothX, [-1, 1], [12, -12]);
  const skyY = useTransform(smoothY, [-1, 1], [8, -8]);
  const buildingX = useTransform(smoothX, [-1, 1], [26, -26]);
  const buildingY = useTransform(smoothY, [-1, 1], [16, -16]);
  const lightX = useTransform(smoothX, [-1, 1], [-70, 70]);
  const foreX = useTransform(smoothX, [-1, 1], [-52, 52]);
  const foreY = useTransform(smoothY, [-1, 1], [-14, 14]);
  const copyX = useTransform(smoothX, [-1, 1], [8, -8]);

  // --- Scroll hand-off into the next section --------------------------------
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const plateScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.62], [1, 0]);
  const veil = useTransform(scrollYProgress, [0, 1], [0, 0.55]);

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
          initial: { opacity: 0, y: 26 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 1.1, delay, ease: EASE },
        };

  return (
    <section
      ref={sectionRef}
      className="relative h-[100svh] min-h-[620px] w-full overflow-hidden bg-ink"
      aria-label="DENGLER — invest in what lasts"
    >
      {/* ── Layer 0 · sky ──────────────────────────────────────────────── */}
      <motion.div
        className="absolute inset-[-4%]"
        style={reduce ? undefined : { x: skyX, y: skyY }}
        aria-hidden
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#1b2a3a_0%,#41485a_38%,#a2765a_72%,#d9a06a_100%)]" />
        {/* Two cloud banks drifting at different speeds — the slowest visual
            cue in the scene, and the one that reads as "this is live". */}
        <div className="cloud-bank cloud-bank--far" />
        <div className="cloud-bank cloud-bank--near" />
      </motion.div>

      {/* ── Layer 1 · the building ─────────────────────────────────────── */}
      <motion.div
        className="absolute inset-[-6%]"
        style={reduce ? undefined : { x: buildingX, y: buildingY, scale: plateScale }}
        aria-hidden
      >
        <motion.div
          className="relative h-full w-full"
          initial={reduce ? false : { scale: 1.14 }}
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
            quality={78}
            className="object-cover object-[50%_58%]"
          />
        </motion.div>
      </motion.div>

      {/* ── Layer 2 · grade + vignette ─────────────────────────────────── */}
      <div
        className="absolute inset-0 bg-[radial-gradient(120%_85%_at_50%_35%,transparent_20%,rgba(10,9,8,0.55)_78%,rgba(10,9,8,0.85)_100%)]"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[60%] bg-[linear-gradient(to_top,rgba(10,9,8,0.92)_2%,rgba(10,9,8,0.45)_45%,transparent_100%)]"
        aria-hidden
      />

      {/* ── Layer 3 · gold light sweep across the façade ───────────────── */}
      {!reduce && (
        <motion.div
          className="absolute inset-y-0 -inset-x-1/4"
          style={{ x: lightX }}
          aria-hidden
        >
          <motion.div
            className="gold-sweep"
            initial={{ x: "-65%", opacity: 0 }}
            animate={{ x: ["-65%", "65%"], opacity: [0, 0.95, 0] }}
            transition={{
              duration: 3.6,
              delay: 2.2,
              ease: [0.4, 0, 0.2, 1],
              repeat: Infinity,
              repeatDelay: 9,
            }}
          />
        </motion.div>
      )}

      {/* ── Layer 4 · foreground planting ──────────────────────────────── */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[44%]"
        style={reduce ? undefined : { x: foreX, y: foreY }}
        aria-hidden
      >
        <PalmSilhouettes />
      </motion.div>

      <div className="absolute inset-0 grain" aria-hidden />

      {/* Darkens on scroll so the hero dissolves into the section below
          instead of being cut off by it. */}
      <motion.div
        className="pointer-events-none absolute inset-0 bg-paper"
        style={{ opacity: veil }}
        aria-hidden
      />

      {/* ── Content ────────────────────────────────────────────────────── */}
      <motion.div
        className="shell relative z-20 flex h-full flex-col justify-end pb-16 md:pb-24"
        style={reduce ? undefined : { x: copyX, y: copyY, opacity: copyOpacity }}
      >
        <motion.p
          className="eyebrow !text-white/60"
          {...stage(0.8)}
        >
          DENGLER · Premium Real Estate &amp; Investment
        </motion.p>

        <h1 className="mt-5 max-w-5xl text-white display-xl">
          <MaskedLine delay={1.4} reduce={!!reduce}>
            INVEST IN
          </MaskedLine>
          <MaskedLine delay={1.58} reduce={!!reduce}>
            <span className="italic text-gold-soft">WHAT LASTS.</span>
          </MaskedLine>
        </h1>

        <motion.p
          className="mt-8 max-w-xl text-base leading-relaxed text-white/72 md:text-lg"
          {...stage(2.6)}
        >
          Exceptional villas, hotels and land opportunities curated for ambitious
          investors.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
          {...stage(2.78)}
        >
          <Link href="/properties" className="btn btn-ghost-light">
            Explore Properties
            <Arrow />
          </Link>
          <Link href="/investments" className="btn btn-ghost-light">
            Investment Opportunities
          </Link>
        </motion.div>
      </motion.div>

      {/* ── Property caption, trailing edge ────────────────────────────── */}
      <motion.figure
        className="absolute bottom-16 z-20 hidden max-w-[17rem] border-s border-white/25 ps-5 text-white/75 lg:block md:bottom-24"
        style={{ insetInlineEnd: "clamp(1.25rem, 4vw, 4rem)" }}
        initial={reduce ? false : { opacity: 0, x: 32 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.1, delay: 3.2, ease: EASE }}
      >
        <figcaption>
          <p className="eyebrow !text-gold-soft">Now showing</p>
          <p className="mt-2 font-display text-2xl leading-tight text-white">
            DENGLER Palm Residence
          </p>
          <p className="mt-1 text-xs tracking-wide text-white/55">
            Palm Jumeirah, Dubai · 620 m² · 4 bedrooms
          </p>
          <Link
            href="/properties/dengler-palm-residence-dubai"
            className="nav-link mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-gold-soft"
          >
            View property
            <Arrow />
          </Link>
        </figcaption>
      </motion.figure>

      <style jsx>{`
        .cloud-bank {
          position: absolute;
          inset-inline: -50%;
          height: 55%;
          top: 0;
          background-repeat: repeat-x;
          opacity: 0.5;
          will-change: transform;
        }
        .cloud-bank--far {
          background-image: radial-gradient(
              closest-side at 20% 60%,
              rgba(255, 244, 228, 0.5),
              transparent
            ),
            radial-gradient(closest-side at 58% 40%, rgba(255, 240, 220, 0.4), transparent),
            radial-gradient(closest-side at 86% 66%, rgba(255, 236, 214, 0.35), transparent);
          background-size: 48% 70%;
          animation: drift 190s linear infinite;
        }
        .cloud-bank--near {
          height: 42%;
          opacity: 0.32;
          background-image: radial-gradient(
              closest-side at 34% 55%,
              rgba(255, 228, 199, 0.55),
              transparent
            ),
            radial-gradient(closest-side at 72% 38%, rgba(255, 220, 190, 0.45), transparent);
          background-size: 62% 62%;
          animation: drift 120s linear infinite reverse;
        }
        @keyframes drift {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-33%, 0, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .cloud-bank { animation: none; }
        }
      `}</style>
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
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span
        className="block"
        initial={{ y: "108%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 1.25, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/**
 * Foreground planting, drawn rather than photographed so it can sway
 * independently of the plate. Two fronds at each edge, each on its own
 * slightly different period so the motion never looks looped.
 */
function PalmSilhouettes() {
  return (
    <svg
      viewBox="0 0 1200 400"
      preserveAspectRatio="xMidYMax slice"
      className="h-full w-full"
      aria-hidden
    >
      <g fill="rgba(8,7,6,0.88)">
        <g className="frond frond--a" style={{ transformOrigin: "40px 400px" }}>
          <path d="M40 400 C 30 300 20 240 4 196 C 60 216 96 268 112 330 C 104 358 74 392 40 400 Z" />
          <path d="M60 400 C 76 322 120 258 186 214 C 168 292 130 356 84 400 Z" />
        </g>
        <g className="frond frond--b" style={{ transformOrigin: "150px 400px" }}>
          <path d="M150 400 C 158 330 196 268 258 230 C 244 306 210 364 172 400 Z" />
        </g>
        <g className="frond frond--c" style={{ transformOrigin: "1160px 400px" }}>
          <path d="M1160 400 C 1170 300 1180 240 1196 196 C 1140 216 1104 268 1088 330 C 1096 358 1126 392 1160 400 Z" />
          <path d="M1140 400 C 1124 322 1080 258 1014 214 C 1032 292 1070 356 1116 400 Z" />
        </g>
        <g className="frond frond--d" style={{ transformOrigin: "1050px 400px" }}>
          <path d="M1050 400 C 1042 330 1004 268 942 230 C 956 306 990 364 1028 400 Z" />
        </g>
        {/* A low bank of planting to seat the fronds on the ground plane. */}
        <path
          d="M0 400 C 120 372 240 388 360 378 C 500 366 640 384 780 374 C 920 364 1060 384 1200 372 L1200 400 Z"
          opacity="0.9"
        />
      </g>
      <style>{`
        .frond { animation: sway 11s ease-in-out infinite; }
        .frond--b { animation-duration: 8.5s;  animation-delay: -2s; }
        .frond--c { animation-duration: 12.5s; animation-delay: -4s; }
        .frond--d { animation-duration: 9.5s;  animation-delay: -1s; }
        @keyframes sway {
          0%, 100% { transform: rotate(-0.9deg); }
          50%      { transform: rotate(1.1deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .frond { animation: none; }
        }
      `}</style>
    </svg>
  );
}

function Arrow() {
  return (
    <svg
      width="14"
      height="10"
      viewBox="0 0 14 10"
      fill="none"
      className="rtl-flip transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
      aria-hidden
    >
      <path d="M0 5h12M8.5 1L12.5 5l-4 4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

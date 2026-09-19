"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";

import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { Wordmark } from "@/components/site/Wordmark";
import { navLinks, SITE } from "@/lib/site";
import { isRtl, localePath, type Dictionary, type Locale } from "@/lib/i18n";
import type { NavSurface } from "@/lib/nav-surface";

/**
 * No background at all at the top of a page; a floating pane of glass once you
 * scroll.
 *
 * The page shows through the bar, which means the bar has two colour states
 * and something has to decide between them. That decision is `navSurface`, and
 * it is a fact about layout rather than a guess: interior pages open with
 * `PageHeader`, a photograph under a near-black scrim, so the controls go
 * white; the home page and a property's own page open light, so they stay
 * navy. Get it wrong and the navigation is not dim, it is invisible — which is
 * why `tests/e2e.mjs` measures the links at the top of both kinds of route and
 * not only over the glass.
 *
 * Scrolling collapses the distinction. The glass is 78% paper, so the darkest
 * thing that can sit behind it lands at #cdcdce measured and the links read at
 * 5.30:1 as navy — there is no light state once the pane is there, on any
 * route.
 *
 * Everything that moves is a transform or an opacity, so none of it can cost
 * the page a reflow: the glass springs in on `scale` and `y`, the wordmark
 * settles a little smaller on `scale`, and the reading line is a `scaleX`.
 * Colour is the one thing that cross-fades on its own clock — a 300ms tint
 * rather than a spring, because type that springs between two colours reads as
 * a glitch.
 *
 * The bar's own height is the single exception to transform-only, and it is
 * transitioned rather than sprung — a fixed element is out of flow, so its
 * height reflows its own ten nodes and nothing else on the page.
 */
export function Navbar({
  locale,
  t,
  surface = "dark",
}: {
  locale: Locale;
  t: Dictionary;
  surface?: NavSurface;
}) {
  const pathname = usePathname();
  const links = navLinks(locale, t);
  const rtl = isRtl(locale);
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /* Two thresholds, not one. A single 40px line means a trackpad resting at
     exactly 40 flips the bar back and forth on every stray pixel; the state
     only turns on above 48 and only off again below 12. */
  useEffect(() => {
    const onScroll = () =>
      setScrolled((was) => (was ? window.scrollY > 12 : window.scrollY > 48));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* The reading line along the bottom of the glass. `useScroll` reports
     progress unsmoothed, which reads as a twitch on a trackpad, so it is run
     through the same spring the rest of the bar uses. */
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 32,
    restDelta: 0.001,
  });

  // The drawer covers the page in paper, so while it is open the bar is over a
  // light surface whatever the route is and wherever the page is scrolled to.
  const glass = scrolled && !menuOpen;

  /* White controls, and the only state that has them. Both the glass and the
     open drawer put paper behind the bar, so either one ends it. */
  const onDark = surface === "dark" && !scrolled && !menuOpen;
  const tone = onDark ? ("light" as const) : ("dark" as const);

  const spring = reduce
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 240, damping: 28, mass: 0.9 };

  // Close the drawer on navigation. Adjusting state during render is the
  // documented way to react to a changed prop without an effect — an effect
  // here would render the open drawer once on the new route before closing it.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  // Lock the page behind the drawer while it is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 transition-[height] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ height: glass ? "calc(var(--nav-h) - 0.5rem)" : "var(--nav-h)" }}
      >
        {/* The glass, which is the bar's only background. It is inset on
            all four sides so the bar stops touching the viewport — that gap is
            most of what reads as "floating", more than the shadow does. The
            width is over-constrained on purpose: `inset-x` sets both edges and
            `max-w` clamps them, which leaves `mx-auto` to centre what is left
            on a display wider than the content ever gets. */}
        <motion.div
          className="absolute inset-y-1.5 inset-x-2 mx-auto max-w-[92rem] overflow-hidden rounded-[var(--radius-pill)] border border-hairline bg-paper/[0.78] shadow-float backdrop-blur-2xl backdrop-saturate-150 md:inset-x-5 xl:inset-x-9"
          initial={false}
          animate={
            glass
              ? { opacity: 1, scale: 1, y: 0 }
              : { opacity: 0, scale: 0.97, y: -10 }
          }
          transition={spring}
          aria-hidden
        >
          {/* The reading line. Anchored to the leading edge, which flips with
              the writing direction — a progress bar that fills right-to-left
              in English would read as a bar draining. */}
          <motion.span
            className="absolute inset-x-0 bottom-0 block h-px bg-[linear-gradient(to_right,transparent,var(--color-gold),transparent)]"
            style={{
              scaleX: progress,
              transformOrigin: rtl ? "right" : "left",
            }}
          />
        </motion.div>

        <nav
          className="shell relative flex h-full items-center justify-between gap-6"
          aria-label="Primary"
        >
          <Link
            href={localePath(locale, "/")}
            className="transition-opacity duration-500 hover:opacity-80"
            aria-label={`${SITE.name} — ${t.nav.home}`}
          >
            {/* The wordmark settles a little smaller once the bar is glass, so
                the two states differ by more than a background. `scale` keeps
                that free — a font-size change here would relayout the row. */}
            <motion.span
              className="block origin-left rtl:origin-right"
              initial={false}
              animate={{ scale: glass ? 0.92 : 1 }}
              transition={spring}
            >
              <Wordmark locale={locale} tone={tone} />
            </motion.span>
          </Link>

          {/* Centred, the way a product's nav is — the logo and the actions
              hold the two ends and the destinations sit between them. */}
          <ul
            className={`hidden items-center gap-8 text-[0.875rem] font-medium transition-colors duration-300 lg:flex ${
              onDark ? "text-paper/85" : "text-graphite"
            }`}
          >
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="nav-link transition-colors duration-300 hover:text-gold"
                  data-active={
                    pathname === link.href || pathname.startsWith(`${link.href}/`)
                  }
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            <LanguageSwitcher
              locale={locale}
              tone={tone}
              label={t.common.switchLanguage}
            />

            <Link
              href={localePath(locale, "/contact")}
              className="btn btn-gold hidden !px-5 !py-2.5 !text-[0.8125rem] md:inline-flex"
            >
              {t.common.contactUs}
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? t.common.closeMenu : t.common.openMenu}
              className={`relative z-50 flex h-11 w-11 flex-col items-center justify-center gap-[6px] transition-colors duration-300 lg:hidden ${
                onDark ? "text-paper" : "text-ink"
              }`}
            >
              <span
                className={`block h-0.5 w-6 rounded-full bg-current transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  menuOpen ? "translate-y-[4px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-6 rounded-full bg-current transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  menuOpen ? "-translate-y-[4px] -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile drawer — a full-height sheet, not a shrunken desktop menu. */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 bg-paper lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="shell flex h-full flex-col justify-between pt-[calc(var(--nav-h)+2rem)] pb-12">
              <ul className="flex flex-col gap-1">
                {links.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.06 + i * 0.05,
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="border-b border-hairline"
                  >
                    <Link
                      href={link.href}
                      className="block py-5 font-display text-3xl font-bold text-ink"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="space-y-6">
                <Link
                  href={localePath(locale, "/contact")}
                  className="btn btn-gold w-full"
                >
                  {t.common.contactUs}
                </Link>
                <LanguageSwitcher
                  locale={locale}
                  label={t.common.switchLanguage}
                />
                <p className="text-xs text-muted">
                  {SITE.address[locale]} · {SITE.email}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

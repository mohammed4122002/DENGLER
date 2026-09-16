"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { Wordmark } from "@/components/site/Wordmark";
import { navLinks, SITE } from "@/lib/site";
import { localePath, type Dictionary, type Locale } from "@/lib/i18n";

/**
 * The navbar starts transparent over the hero and resolves to a solid bar once
 * you scroll past it. On any page that isn't the home page it starts solid,
 * because there is no cinematic plate behind it to sit on.
 */
export function Navbar({ locale, t }: { locale: Locale; t: Dictionary }) {
  const pathname = usePathname();
  const links = navLinks(locale, t);
  const isHome = pathname === localePath(locale, "/");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const solid = scrolled || !isHome || menuOpen;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          solid
            ? "border-b border-hairline bg-paper/85 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <nav
          className="shell flex h-[var(--nav-h)] items-center justify-between gap-6"
          aria-label="Primary"
        >
          <Link
            href={localePath(locale, "/")}
            className="transition-opacity duration-500 hover:opacity-80"
            aria-label={`${SITE.name} — ${t.nav.home}`}
          >
            <Wordmark locale={locale} tone={solid ? "dark" : "light"} />
          </Link>

          <ul
            className={`hidden items-center gap-9 text-[0.8125rem] lg:flex ${
              solid ? "text-graphite" : "text-white/85"
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
              tone={solid ? "dark" : "light"}
              label={t.common.switchLanguage}
            />

            <Link
              href={localePath(locale, "/contact")}
              className={`btn hidden md:inline-flex ${
                solid ? "btn-outline" : "btn-ghost-light"
              } !py-3 !px-6 !text-[0.6875rem]`}
            >
              {t.common.contactUs}
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? t.common.closeMenu : t.common.openMenu}
              className={`relative z-50 flex h-11 w-11 flex-col items-center justify-center gap-[6px] lg:hidden ${
                solid ? "text-ink" : "text-white"
              }`}
            >
              <span
                className={`block h-px w-6 bg-current transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  menuOpen ? "translate-y-[3.5px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-px w-6 bg-current transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  menuOpen ? "-translate-y-[3.5px] -rotate-45" : ""
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
                      className="block py-5 font-display text-4xl text-ink"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="space-y-6">
                <Link
                  href={localePath(locale, "/contact")}
                  className="btn btn-solid w-full"
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

import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import {
  Bodoni_Moda,
  Jost,
  Reem_Kufi,
  Tajawal,
} from "next/font/google";

import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";
import { PageTransition } from "@/components/site/PageTransition";
import { SITE } from "@/lib/site";
import {
  getDictionary,
  getDirection,
  isLocale,
  LOCALES,
  LOCALE_META,
  localePath,
  type Locale,
} from "@/lib/i18n";

import "@/styles/globals.css";

/* ------------------------------------------------------------------ *
 * Typefaces
 *
 * Each script gets a display face and a text face, and the two pairings are
 * chosen to sit at the same weight on the page: Bodoni Moda ↔ Reem Kufi (both
 * high-contrast and geometric — a Didone and a modern Kufi, which are the same
 * idea worked out in two scripts), Jost ↔ Tajawal (both geometric sans faces
 * built on the circle and the straight stem).
 *
 * Bodoni Moda is loaded with its `opsz` axis. CSS applies `font-optical-sizing:
 * auto` by default, so the browser moves along that axis with the font size on
 * its own: hairlines thicken in a 1rem card title and thin out again in an
 * 8rem headline. That is the whole reason to choose a Didone with real optical
 * sizing over one without — an unsized Didone either disappears at small sizes
 * or looks blunt at large ones.
 *
 * Its lightest weight is 400, and `font-synthesis-weight: none` means the
 * `font-weight: 300` on headings resolves to it rather than being faked
 * thinner. That is intentional: the headings carry more presence than the
 * previous pairing gave them.
 *
 * All four variables are always defined; `globals.css` swaps which pair
 * `--font-display` and `--font-sans` point at based on `[dir]`, so a mixed
 * paragraph — an Arabic sentence containing "CRETE ROOTS" — renders both
 * scripts in their intended face rather than falling back.
 * ------------------------------------------------------------------ */

const displayLatin = Bodoni_Moda({
  subsets: ["latin"],
  weight: "variable",
  /* The real italic, not a synthesised one. A Didone italic is a separate
     design — a sloped cursive with different letterforms — so shearing the
     roman, which is what the browser does when the italic is absent, reads as
     a rendering fault rather than as emphasis. The hero's accent line is set
     in it. */
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-display-latin",
  display: "swap",
});

const sansLatin = Jost({
  subsets: ["latin"],
  variable: "--font-sans-latin",
  display: "swap",
});

const displayArabic = Reem_Kufi({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display-arabic",
  display: "swap",
});

const sansArabic = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-sans-arabic",
  display: "swap",
});

const FONT_VARIABLES = [
  displayLatin.variable,
  sansLatin.variable,
  displayArabic.variable,
  sansArabic.variable,
].join(" ");

/** Pre-render both language trees at build time. */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};

  const locale = raw;
  const t = getDictionary(locale);

  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: `${SITE.name} — ${t.meta.tagline}`,
      template: `%s · ${SITE.name}`,
    },
    description: t.meta.description,
    applicationName: SITE.name,
    keywords: [...t.meta.keywords],
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: LOCALE_META[locale].tag,
      alternateLocale: LOCALES.filter((l) => l !== locale).map(
        (l) => LOCALE_META[l].tag,
      ),
      title: `${SITE.name} — ${t.meta.tagline}`,
      description: t.meta.description,
      url: `${SITE.url}${localePath(locale, "/")}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE.name} — ${t.meta.tagline}`,
      description: t.meta.description,
    },
    robots: { index: true, follow: true },
    alternates: {
      canonical: localePath(locale, "/"),
      languages: Object.fromEntries([
        ...LOCALES.map((l) => [LOCALE_META[l].hreflang, localePath(l, "/")]),
        ["x-default", localePath("en", "/")],
      ]),
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#fdfcfa",
  width: "device-width",
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale: Locale = raw;
  const t = getDictionary(locale);

  return (
    <html
      lang={LOCALE_META[locale].tag}
      dir={getDirection(locale)}
      className={FONT_VARIABLES}
    >
      <body>
        {/* Positioning belongs to the `focus:` variant only — applied
            unconditionally it would place the 1px sr-only box outside the
            viewport, which in RTL shows up as a horizontally scrolling page. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          {t.common.skipToContent}
        </a>
        <Navbar locale={locale} t={t} />
        <PageTransition>
          <main id="main">{children}</main>
        </PageTransition>
        <Footer locale={locale} t={t} />
      </body>
    </html>
  );
}

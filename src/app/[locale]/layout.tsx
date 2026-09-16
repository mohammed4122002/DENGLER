import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import {
  Amiri,
  Cormorant_Garamond,
  IBM_Plex_Sans_Arabic,
  Inter,
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
 * chosen to sit at the same weight on the page: Cormorant Garamond ↔ Amiri
 * (both high-contrast, both with generous counters), Inter ↔ IBM Plex Sans
 * Arabic (both neutral grotesques from the same design lineage).
 *
 * All four variables are always defined; `globals.css` swaps which pair
 * `--font-display` and `--font-sans` point at based on `[dir]`, so a mixed
 * paragraph — an Arabic sentence containing "DENGLER" — renders both scripts
 * in their intended face rather than falling back.
 * ------------------------------------------------------------------ */

const displayLatin = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-display-latin",
  display: "swap",
});

const sansLatin = Inter({
  subsets: ["latin"],
  variable: "--font-sans-latin",
  display: "swap",
});

const displayArabic = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-display-arabic",
  display: "swap",
});

const sansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600"],
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

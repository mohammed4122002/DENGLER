import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Tajawal } from "next/font/google";

import { SiteChrome } from "@/components/site/SiteChrome";
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
 * Typeface
 *
 * Tajawal, and only Tajawal — headings, body, fields, buttons, figures, both
 * scripts. It is one of the few families that draws Arabic and Latin as one
 * design rather than bolting a Latin fallback onto an Arabic face, which is
 * what makes a single-family site possible here at all: a mixed line —
 * "CRETE ROOTS" inside an Arabic sentence — stays in one voice instead of
 * switching mid-phrase.
 *
 * Four weights are loaded and no more. Every distinction the page needs is
 * made with those four plus size: 400 for body, 500 for labels and controls,
 * 700 for headings, 800 for the wordmark and the figures. A fifth weight would
 * be another file on the critical path for a difference nobody can name.
 *
 * This replaced a four-family system (Manrope ↔ Cairo, Plus Jakarta Sans ↔
 * Noto Sans Arabic). One family is two fewer font files on the wire and, more
 * to the point, removes the whole class of bug where the two scripts drift out
 * of step — different x-heights, different optical sizes, different amounts of
 * leading needed for the same block of copy.
 * ------------------------------------------------------------------ */

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
  display: "swap",
});

const FONT_VARIABLES = tajawal.variable;

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
        <SiteChrome locale={locale} t={t}>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}

/** Brand constants, navigation and contact details. */

import { publicEnv } from "@/lib/env";
import { localePath, type Dictionary, type Locale } from "@/lib/i18n";

export const SITE = {
  /**
   * The formal name, used in page titles, structured data and the copyright
   * line. In running prose the dictionaries use the short form — a company
   * refers to itself as "Crete Roots" in a sentence and "Crete Roots Company"
   * on the door.
   */
  name: "Crete Roots Company",

  /**
   * The wordmark, set as a two-line lockup by `<Wordmark/>`.
   *
   * "CRETE ROOTS" stays Latin in both locales — it is a mark, not a word to
   * translate — while the descriptor under it is localised, which is how
   * bilingual signage in the Gulf is normally set. To use the Latin lockup on
   * the Arabic site too, make `descriptor.ar` read "COMPANY".
   */
  wordmark: "CRETE ROOTS",
  descriptor: {
    en: "COMPANY",
    ar: "شركة",
  } satisfies Record<Locale, string>,

  url: publicEnv.siteUrl,
  email: "invest@creteroots.example",
  phone: "+971 4 000 0000",
  /** City names are place names, so they get a proper Arabic form. */
  address: {
    en: "Dubai · Zurich · Lisbon",
    ar: "دبي · زيورخ · لشبونة",
  } satisfies Record<Locale, string>,
  social: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "LinkedIn", href: "https://linkedin.com" },
    { label: "X", href: "https://x.com" },
  ],
} as const;

/** Primary navigation, resolved for a locale. */
export function navLinks(locale: Locale, t: Dictionary) {
  return [
    { label: t.nav.properties, href: localePath(locale, "/properties") },
    { label: t.nav.villas, href: localePath(locale, "/villas") },
    { label: t.nav.hotels, href: localePath(locale, "/hotels") },
    { label: t.nav.land, href: localePath(locale, "/land") },
    { label: t.nav.investments, href: localePath(locale, "/investments") },
    { label: t.nav.about, href: localePath(locale, "/about") },
  ];
}

export function legalLinks(locale: Locale, t: Dictionary) {
  return [
    { label: t.footer.privacy, href: localePath(locale, "/legal/privacy") },
    { label: t.footer.terms, href: localePath(locale, "/legal/terms") },
    { label: t.footer.disclosures, href: localePath(locale, "/legal/disclosures") },
  ];
}

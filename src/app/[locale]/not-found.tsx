"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SmartImage } from "@/components/site/SmartImage";
import { photo } from "@/lib/data/images";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, localePath } from "@/lib/i18n/config";

/**
 * The in-locale 404.
 *
 * `not-found.tsx` cannot read route params, and reading a cookie here would
 * make every page under `[locale]` dynamic — it sits on the segment, so any
 * dynamic API it touches opts the whole tree out of static rendering. Reading
 * the locale off the pathname on the client costs nothing and keeps the rest
 * of the site prerendered.
 */
export default function NotFound() {
  const pathname = usePathname() ?? "";
  const segment = pathname.split("/")[1] ?? "";
  const locale = isLocale(segment) ? segment : DEFAULT_LOCALE;
  const t = getDictionary(locale);

  return (
    <section className="relative flex min-h-[85svh] items-center overflow-hidden bg-ink pt-[var(--nav-h)]">
      <SmartImage
        src={photo("detailSunset", 1800)}
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-40"
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_50%,rgba(10,9,8,0.6),rgba(10,9,8,0.94))]"
        aria-hidden
      />
      <div className="absolute inset-0 grain" aria-hidden />

      <div className="shell relative z-10 py-24 text-center">
        <p className="eyebrow !text-gold-soft">{t.notFound.eyebrow}</p>
        <h1 className="mx-auto mt-6 max-w-2xl display-lg text-paper">
          {t.notFound.titleLineOne}
          <br />
          <span className="italic text-gold-soft">{t.notFound.titleLineTwo}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-[0.9375rem] leading-relaxed text-paper/60">
          {t.notFound.lead}
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={localePath(locale, "/properties")}
            className="btn btn-ghost-light"
          >
            {t.notFound.browse}
          </Link>
          <Link href={localePath(locale, "/contact")} className="btn btn-ghost-light">
            {t.common.speakToAdvisor}
          </Link>
        </div>
      </div>
    </section>
  );
}

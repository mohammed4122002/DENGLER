"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOut } from "@/app/actions/admin";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { localePath, type Dictionary, type Locale } from "@/lib/i18n";

/**
 * The dashboard's sidebar: a card on wide screens, a scrolling pill rail above
 * the content on narrow ones.
 *
 * It carries its own sign-out and language controls rather than leaving them
 * to a top bar, because on a phone the rail is the only chrome the dashboard
 * has — the top bar collapses to the wordmark and the "view site" link.
 */
export function AdminNav({ locale, t }: { locale: Locale; t: Dictionary }) {
  const pathname = usePathname();

  const links = [
    { href: localePath(locale, "/admin"), label: t.admin.overview, exact: true },
    { href: localePath(locale, "/admin/properties"), label: t.admin.properties },
    { href: localePath(locale, "/admin/leads"), label: t.admin.leads },
    { href: localePath(locale, "/admin/settings"), label: t.admin.settings },
  ];

  // `signOut` takes the locale so it can redirect back into the same tree.
  const signOutWithLocale = signOut.bind(null, locale);

  return (
    <nav className="lg:w-56 lg:shrink-0" aria-label={t.admin.dashboard}>
      <div className="card p-2 lg:sticky lg:top-6 lg:p-3">
        <ul className="no-scrollbar flex gap-1.5 overflow-x-auto lg:flex-col lg:overflow-visible">
          {links.map((link) => {
            const active = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);

            return (
              <li key={link.href} className="shrink-0">
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`block whitespace-nowrap rounded-[10px] px-3.5 py-2.5 text-sm font-medium transition-colors duration-200 lg:w-full ${
                    active
                      ? "bg-ink text-white"
                      : "text-graphite hover:bg-cream hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-2 hidden border-t border-hairline pt-2 lg:block">
          <form action={signOutWithLocale}>
            <button
              type="submit"
              className="block w-full rounded-[10px] px-3.5 py-2.5 text-start text-sm font-medium text-muted transition-colors duration-200 hover:bg-cream hover:text-ink"
            >
              {t.admin.signOut}
            </button>
          </form>
          <div className="px-3.5 py-2.5">
            <LanguageSwitcher locale={locale} label={t.common.switchLanguage} />
          </div>
        </div>
      </div>

      {/* Below `lg` the card above is a horizontal rail with no room for these,
          so they sit under it. */}
      <div className="mt-3 flex items-center justify-between gap-4 lg:hidden">
        <form action={signOutWithLocale}>
          <button
            type="submit"
            className="text-sm font-medium text-muted transition-colors hover:text-ink"
          >
            {t.admin.signOut}
          </button>
        </form>
        <LanguageSwitcher locale={locale} label={t.common.switchLanguage} />
      </div>
    </nav>
  );
}

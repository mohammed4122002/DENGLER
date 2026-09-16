"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOut } from "@/app/actions/admin";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { localePath, type Dictionary, type Locale } from "@/lib/i18n";

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
    <nav className="lg:w-52 lg:shrink-0" aria-label={t.admin.dashboard}>
      <p className="eyebrow">{t.admin.dashboard}</p>

      <ul className="no-scrollbar mt-5 flex gap-6 overflow-x-auto border-b border-hairline pb-3 lg:flex-col lg:gap-1 lg:overflow-visible lg:border-b-0 lg:pb-0">
        {links.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);

          return (
            <li key={link.href} className="shrink-0">
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`block whitespace-nowrap py-2 text-sm transition-colors duration-300 lg:border-s lg:ps-4 ${
                  active
                    ? "text-ink lg:border-gold"
                    : "text-muted hover:text-gold lg:border-hairline"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <form action={signOutWithLocale} className="mt-8 hidden lg:block">
        <button
          type="submit"
          className="nav-link text-xs uppercase tracking-[0.16em] text-muted transition-colors hover:text-gold rtl:tracking-normal rtl:normal-case"
        >
          {t.admin.signOut}
        </button>
      </form>

      <Link
        href={localePath(locale, "/")}
        className="nav-link mt-4 hidden text-xs uppercase tracking-[0.16em] text-muted transition-colors hover:text-gold lg:block rtl:tracking-normal rtl:normal-case"
      >
        {t.admin.viewSite}
      </Link>

      <div className="mt-6 hidden lg:block">
        <LanguageSwitcher locale={locale} label={t.common.switchLanguage} />
      </div>
    </nav>
  );
}

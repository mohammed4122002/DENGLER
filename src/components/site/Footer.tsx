import Link from "next/link";

import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { legalLinks, navLinks, SITE } from "@/lib/site";
import { localePath, type Dictionary, type Locale } from "@/lib/i18n";

export function Footer({ locale, t }: { locale: Locale; t: Dictionary }) {
  const year = new Date().getFullYear();
  const links = navLinks(locale, t);
  const legal = legalLinks(locale, t);

  return (
    <footer className="relative mt-px overflow-hidden bg-ink text-paper grain">
      <div className="shell relative z-10 py-20 md:py-28">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <p
              lang="en"
              className="font-display text-[2.5rem] leading-none tracking-[0.3em]"
              style={{ fontFamily: "var(--font-display-latin), serif" }}
            >
              {SITE.name}
            </p>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-paper/55">
              {t.meta.description}
            </p>
            <div className="mt-8">
              <LanguageSwitcher
                locale={locale}
                tone="light"
                label={t.common.switchLanguage}
              />
            </div>
          </div>

          <nav className="md:col-span-3" aria-label={t.footer.footerNav}>
            <p className="eyebrow !text-paper/40">{t.footer.navigate}</p>
            <ul className="mt-5 space-y-3 text-sm text-paper/70">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="nav-link transition-colors duration-300 hover:text-gold-soft"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-2">
            <p className="eyebrow !text-paper/40">{t.footer.contact}</p>
            <ul className="mt-5 space-y-3 text-sm text-paper/70">
              <li>
                <a href={`mailto:${SITE.email}`} className="nav-link hover:text-gold-soft">
                  {SITE.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                  className="nav-link hover:text-gold-soft"
                  dir="ltr"
                >
                  {SITE.phone}
                </a>
              </li>
              <li className="text-paper/45">{SITE.address[locale]}</li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="eyebrow !text-paper/40">{t.footer.follow}</p>
            <ul className="mt-5 space-y-3 text-sm text-paper/70">
              {SITE.social.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="nav-link hover:text-gold-soft"
                    lang="en"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-5 border-t border-paper/10 pt-8 text-xs text-paper/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE.name}. {t.footer.rights}
          </p>
          <ul className="flex flex-wrap gap-6">
            {legal.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="nav-link hover:text-gold-soft">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={localePath(locale, "/admin")}
                className="nav-link hover:text-gold-soft"
              >
                {t.nav.admin}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

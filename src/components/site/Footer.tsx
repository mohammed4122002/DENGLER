import Link from "next/link";

import { FOOTER_LEGAL, NAV_LINKS, SITE } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-px overflow-hidden bg-ink text-paper grain">
      <div className="shell relative z-10 py-20 md:py-28">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-[2.5rem] leading-none tracking-[0.3em]">
              {SITE.name}
            </p>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-paper/55">
              {SITE.description}
            </p>
          </div>

          <nav className="md:col-span-3" aria-label="Footer navigation">
            <p className="eyebrow !text-paper/40">Navigate</p>
            <ul className="mt-5 space-y-3 text-sm text-paper/70">
              {NAV_LINKS.map((link) => (
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
            <p className="eyebrow !text-paper/40">Contact</p>
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
                >
                  {SITE.phone}
                </a>
              </li>
              <li className="text-paper/45">{SITE.address}</li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="eyebrow !text-paper/40">Follow</p>
            <ul className="mt-5 space-y-3 text-sm text-paper/70">
              {SITE.social.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="nav-link hover:text-gold-soft"
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
            © {year} {SITE.name}. A demonstration platform — all inventory shown
            is fictional.
          </p>
          <ul className="flex flex-wrap gap-6">
            {FOOTER_LEGAL.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="nav-link hover:text-gold-soft">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/admin" className="nav-link hover:text-gold-soft">
                Admin
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

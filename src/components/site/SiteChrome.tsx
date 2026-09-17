"use client";

import { usePathname } from "next/navigation";

import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";
import { PageTransition } from "@/components/site/PageTransition";
import { localePath, type Dictionary, type Locale } from "@/lib/i18n";

/**
 * The public site's chrome — marketing navigation and footer — around
 * everything that is not the dashboard.
 *
 * The dashboard lives under the same `[locale]` layout, and a parent layout
 * cannot be removed by a child, so without this it inherited a marketing
 * navbar it has no use for and a five-column footer twice the height of the
 * page it sat under. The alternative is a route group, which means moving
 * every public page on the site into `(site)/` to change what wraps one
 * branch; a path check is one file.
 *
 * It also skips the page transition: the dashboard is a tool, and a 340ms
 * fade between saving a property and seeing the list is latency the person
 * using it has to sit through several times a minute.
 */
export function SiteChrome({
  locale,
  t,
  children,
}: {
  locale: Locale;
  t: Dictionary;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const adminRoot = localePath(locale, "/admin");
  const isAdmin = pathname === adminRoot || pathname.startsWith(`${adminRoot}/`);

  if (isAdmin) return <main id="main">{children}</main>;

  return (
    <>
      <Navbar locale={locale} t={t} />
      <PageTransition>
        <main id="main">{children}</main>
      </PageTransition>
      <Footer locale={locale} t={t} />
    </>
  );
}

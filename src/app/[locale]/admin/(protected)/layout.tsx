import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AdminNav } from "@/components/admin/AdminNav";
import { Wordmark } from "@/components/site/Wordmark";
import { ArrowIcon } from "@/components/ui/Icons";
import { checkAdminAccess } from "@/lib/auth";
import { isDemoMode } from "@/lib/store";
import { getDictionary, isLocale, localePath, type Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  return {
    title: isLocale(raw) ? getDictionary(raw).admin.dashboard : "Dashboard",
    robots: { index: false, follow: false },
  };
}

/**
 * The dashboard is rendered per-request — a cached admin page would be a way
 * to leak unpublished inventory.
 */
export const dynamic = "force-dynamic";

export default async function AdminLayout({
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
  const access = await checkAdminAccess();

  if (!access.ok) redirect(localePath(locale, "/admin/login"));

  return (
    /* `bg-cream` rather than `bg-paper`: every panel in here is a white card,
       and white cards on a white page are invisible. */
    <div className="min-h-screen bg-cream">
      {/* The dashboard's own bar. The marketing navigation does not belong on
          a tool — `SiteChrome` keeps it off this branch — but the wordmark and
          a way back to the public site do. */}
      <header className="sticky top-0 z-40 border-b border-hairline bg-paper/90 backdrop-blur-xl">
        <div className="shell flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Wordmark locale={locale} />
            <span className="badge badge-paper hidden border border-hairline sm:inline-flex">
              {t.admin.dashboard}
            </span>
          </div>
          <Link
            href={localePath(locale, "/")}
            className="group inline-flex items-center gap-2 text-[0.8125rem] font-semibold text-graphite transition-colors hover:text-ink"
          >
            {t.admin.viewSite}
            <ArrowIcon
              size={14}
              className="rtl-flip text-gold-deep transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
            />
          </Link>
        </div>
      </header>

      {access.via === "dev-open" && (
        <p className="bg-ink px-5 py-2.5 text-center text-xs text-paper">
          <strong className="font-semibold">{t.admin.devBannerStrong}</strong>{" "}
          {t.admin.devBanner}
        </p>
      )}

      {isDemoMode && (
        <p className="border-b border-hairline bg-gold/12 px-5 py-2.5 text-center text-xs text-graphite">
          {t.admin.demoBanner}{" "}
          <Link
            href={localePath(locale, "/admin/settings")}
            className="font-semibold text-gold-deep underline underline-offset-2"
          >
            {t.admin.demoBannerLink}
          </Link>{" "}
          {t.admin.demoBannerEnd}
        </p>
      )}

      <div className="shell flex flex-col gap-6 py-6 lg:flex-row lg:gap-8 lg:py-8">
        <AdminNav locale={locale} t={t} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

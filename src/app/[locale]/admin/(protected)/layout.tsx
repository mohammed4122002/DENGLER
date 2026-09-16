import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AdminNav } from "@/components/admin/AdminNav";
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
    <div className="min-h-screen bg-paper pt-[var(--nav-h)]">
      {access.via === "dev-open" && (
        <p className="bg-plum px-5 py-2.5 text-center text-xs text-paper">
          <strong className="font-medium">{t.admin.devBannerStrong}</strong>{" "}
          {t.admin.devBanner}
        </p>
      )}

      {isDemoMode && (
        <p className="border-b border-hairline bg-cream px-5 py-2.5 text-center text-xs text-graphite">
          {t.admin.demoBanner}{" "}
          <Link
            href={localePath(locale, "/admin/settings")}
            className="nav-link text-gold-deep"
          >
            {t.admin.demoBannerLink}
          </Link>{" "}
          {t.admin.demoBannerEnd}
        </p>
      )}

      <div className="shell flex flex-col gap-10 py-10 lg:flex-row lg:gap-16 lg:py-14">
        <AdminNav locale={locale} t={t} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

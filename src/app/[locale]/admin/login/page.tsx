import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/LoginForm";
import { Wordmark } from "@/components/site/Wordmark";
import { checkAdminAccess } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { getDictionary, isLocale, localePath, type Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  return {
    title: isLocale(raw) ? getDictionary(raw).admin.signIn : "Sign in",
    robots: { index: false, follow: false },
  };
}

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale: Locale = raw;
  const t = getDictionary(locale);
  const access = await checkAdminAccess();
  if (access.ok) redirect(localePath(locale, "/admin"));

  return (
    /* No top padding for a navbar: `SiteChrome` keeps the marketing bar off
       the whole `/admin` branch, this page included. */
    <div className="flex min-h-screen items-center justify-center bg-cream px-5 py-12">
      <div className="card w-full max-w-md p-8 shadow-[var(--shadow-float)] md:p-10">
        <Wordmark locale={locale} size="footer" />
        <h1 className="mt-6 font-display text-[1.75rem] font-bold leading-none text-ink">
          {t.admin.dashboard}
        </h1>

        {access.reason === "not-configured" ? (
          <div className="mt-8 rounded-[var(--radius-sm)] border border-gold/30 bg-gold/[0.07] p-5 text-sm leading-relaxed text-graphite">
            <p className="font-semibold text-gold-deep">{t.admin.notConfigured}</p>
            <p className="mt-2">{t.admin.notConfiguredBody}</p>
          </div>
        ) : (
          <>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {access.reason === "not-admin"
                ? t.admin.notAdmin
                : isSupabaseConfigured
                  ? t.admin.signInPrompt
                  : t.admin.passwordPrompt}
            </p>

            <div className="mt-7">
              <LoginForm withEmail={isSupabaseConfigured} locale={locale} t={t} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

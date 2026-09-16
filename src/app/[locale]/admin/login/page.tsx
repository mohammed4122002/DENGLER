import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/LoginForm";
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
    <div className="flex min-h-screen items-center justify-center bg-cream/40 px-5 pt-[var(--nav-h)]">
      <div className="w-full max-w-md border border-hairline bg-paper p-9 md:p-11">
        <p className="eyebrow" lang="en">
          DENGLER
        </p>
        <h1 className="mt-4 font-display text-4xl leading-none text-ink">
          {t.admin.dashboard}
        </h1>

        {access.reason === "not-configured" ? (
          <div className="mt-8 border border-plum/30 bg-plum/[0.05] p-5 text-sm leading-relaxed text-graphite">
            <p className="font-medium text-plum">{t.admin.notConfigured}</p>
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

            <div className="mt-9">
              <LoginForm withEmail={isSupabaseConfigured} locale={locale} t={t} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

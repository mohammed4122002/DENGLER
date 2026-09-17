import { notFound } from "next/navigation";

import { StatsForm } from "@/components/admin/StatsForm";
import { isSupabaseConfigured } from "@/lib/env";
import { store } from "@/lib/store";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale: Locale = raw;
  const t = getDictionary(locale);
  const stats = await store.listStats();

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <p className="eyebrow">{t.admin.configuration}</p>
        <h1 className="mt-1.5 font-display text-[1.75rem] font-bold leading-none text-ink">
          {t.admin.settings}
        </h1>
      </header>

      <section aria-labelledby="stats-heading" className="card p-6">
        <h2 id="stats-heading" className="font-display text-[1.0625rem] font-bold text-ink">
          {t.admin.homeFigures}
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          {t.admin.homeFiguresLead}
        </p>
        <div className="mt-6">
          <StatsForm stats={stats} locale={locale} t={t} />
        </div>
      </section>

      <section aria-labelledby="storage-heading" className="card p-6">
        <h2 id="storage-heading" className="font-display text-[1.0625rem] font-bold text-ink">
          {t.admin.dataSource}
        </h2>

        {isSupabaseConfigured ? (
          <div className="mt-5 rounded-[var(--radius-sm)] border border-gold/30 bg-gold/[0.07] p-5 text-sm leading-relaxed text-graphite">
            <p className="font-semibold text-gold-deep">
              {t.admin.supabaseConnected}
            </p>
            <p className="mt-2">{t.admin.supabaseConnectedBody}</p>
          </div>
        ) : (
          <div className="mt-5 space-y-5 rounded-[var(--radius-sm)] border border-hairline bg-cream p-5 text-sm leading-relaxed text-graphite">
            <p>
              <span className="font-semibold text-ink">{t.admin.demoModeStrong}</span>{" "}
              {t.admin.demoModeBody}
            </p>
            <ol className="ms-5 list-decimal space-y-2 text-[0.8125rem] text-muted">
              {t.admin.setupSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        )}
      </section>
    </div>
  );
}

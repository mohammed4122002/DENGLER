import { StatsForm } from "@/components/admin/StatsForm";
import { isSupabaseConfigured } from "@/lib/env";
import { store } from "@/lib/store";

export default async function AdminSettingsPage() {
  const stats = await store.listStats();

  return (
    <div className="max-w-3xl space-y-14">
      <header>
        <p className="eyebrow">Configuration</p>
        <h1 className="mt-3 font-display text-4xl leading-none text-ink">
          Settings
        </h1>
      </header>

      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="font-display text-2xl text-ink">
          Home page figures
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          The four headline numbers in the trust bar. These are stated as fact
          to every visitor, so keep them defensible.
        </p>
        <div className="mt-8">
          <StatsForm stats={stats} />
        </div>
      </section>

      <section aria-labelledby="storage-heading" className="border-t border-hairline pt-12">
        <h2 id="storage-heading" className="font-display text-2xl text-ink">
          Data source
        </h2>

        {isSupabaseConfigured ? (
          <div className="mt-5 border border-gold/30 bg-gold/[0.05] p-6 text-sm leading-relaxed text-graphite">
            <p className="font-medium text-gold-deep">Supabase connected.</p>
            <p className="mt-2">
              Properties, images, features, enquiries and these figures are
              persisted to Postgres, with Row Level Security enforcing public
              read of published inventory only.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-5 border border-hairline bg-cream/40 p-6 text-sm leading-relaxed text-graphite">
            <p>
              <span className="font-medium text-ink">Running on demo data.</span>{" "}
              Everything in the dashboard works, but changes live in the server
              process and reset on restart.
            </p>
            <ol className="ms-5 list-decimal space-y-2 text-[0.8125rem] text-muted">
              <li>
                Create a Supabase project and run{" "}
                <code className="font-mono text-xs text-graphite">
                  supabase/migrations/0001_init.sql
                </code>
                .
              </li>
              <li>
                Copy <code className="font-mono text-xs text-graphite">.env.example</code>{" "}
                to <code className="font-mono text-xs text-graphite">.env.local</code> and
                fill in the project URL, the anon key and the service role key.
              </li>
              <li>
                Load the demo catalogue with{" "}
                <code className="font-mono text-xs text-graphite">npm run seed</code>.
              </li>
              <li>
                Create a user, then set that row&rsquo;s{" "}
                <code className="font-mono text-xs text-graphite">profiles.role</code> to{" "}
                <code className="font-mono text-xs text-graphite">admin</code>.
              </li>
            </ol>
          </div>
        )}
      </section>
    </div>
  );
}

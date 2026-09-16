import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/LoginForm";
import { checkAdminAccess } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const access = await checkAdminAccess();
  if (access.ok) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream/40 px-5 pt-[var(--nav-h)]">
      <div className="w-full max-w-md border border-hairline bg-paper p-9 md:p-11">
        <p className="eyebrow">DENGLER</p>
        <h1 className="mt-4 font-display text-4xl leading-none text-ink">
          Dashboard
        </h1>

        {access.reason === "not-configured" ? (
          <div className="mt-8 border border-plum/30 bg-plum/[0.05] p-5 text-sm leading-relaxed text-graphite">
            <p className="font-medium text-plum">Access is not configured.</p>
            <p className="mt-2">
              Set <code className="font-mono text-xs">ADMIN_PASSWORD</code> and{" "}
              <code className="font-mono text-xs">ADMIN_SESSION_SECRET</code> in
              the environment, or connect Supabase and sign in with a user whose
              profile role is <code className="font-mono text-xs">admin</code>.
            </p>
          </div>
        ) : (
          <>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {access.reason === "not-admin"
                ? "That account is signed in but is not an administrator."
                : isSupabaseConfigured
                  ? "Sign in with your DENGLER administrator account."
                  : "Enter the dashboard password to continue."}
            </p>

            <div className="mt-9">
              <LoginForm withEmail={isSupabaseConfigured} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

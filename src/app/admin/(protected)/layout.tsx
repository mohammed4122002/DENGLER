import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminNav } from "@/components/admin/AdminNav";
import { checkAdminAccess } from "@/lib/auth";
import { isDemoMode } from "@/lib/store";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

/**
 * The dashboard is rendered per-request — a cached admin page would be a way
 * to leak unpublished inventory.
 */
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await checkAdminAccess();

  if (!access.ok) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-paper pt-[var(--nav-h)]">
      {access.via === "dev-open" && (
        <p className="bg-plum px-5 py-2.5 text-center text-xs text-paper">
          <strong className="font-medium">Development mode.</strong> No{" "}
          <code className="font-mono">ADMIN_PASSWORD</code> is set, so this
          dashboard is unlocked. It is blocked automatically in production
          builds — set the variable before deploying.
        </p>
      )}

      {isDemoMode && (
        <p className="border-b border-hairline bg-cream px-5 py-2.5 text-center text-xs text-graphite">
          Running on the bundled demo catalogue. Edits are real but live in
          memory only and reset when the server restarts —{" "}
          <Link href="/admin/settings" className="nav-link text-gold-deep">
            connect Supabase
          </Link>{" "}
          to persist them.
        </p>
      )}

      <div className="shell flex flex-col gap-10 py-10 lg:flex-row lg:gap-16 lg:py-14">
        <AdminNav />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

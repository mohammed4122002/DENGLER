"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOut } from "@/app/actions/admin";

const LINKS = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/properties", label: "Properties" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:w-52 lg:shrink-0" aria-label="Dashboard">
      <p className="eyebrow">DENGLER Dashboard</p>

      <ul className="no-scrollbar mt-5 flex gap-6 overflow-x-auto border-b border-hairline pb-3 lg:flex-col lg:gap-1 lg:overflow-visible lg:border-b-0 lg:pb-0">
        {LINKS.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);

          return (
            <li key={link.href} className="shrink-0">
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`block whitespace-nowrap py-2 text-sm transition-colors duration-300 lg:border-s lg:ps-4 ${
                  active
                    ? "text-ink lg:border-gold"
                    : "text-muted hover:text-gold lg:border-hairline"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <form action={signOut} className="mt-8 hidden lg:block">
        <button
          type="submit"
          className="nav-link text-xs uppercase tracking-[0.16em] text-muted transition-colors hover:text-gold"
        >
          Sign out
        </button>
      </form>

      <Link
        href="/"
        className="nav-link mt-4 hidden text-xs uppercase tracking-[0.16em] text-muted transition-colors hover:text-gold lg:block"
      >
        View site
      </Link>
    </nav>
  );
}

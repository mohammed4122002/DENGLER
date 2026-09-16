import Link from "next/link";

import { PropertyForm } from "@/components/admin/PropertyForm";

export default function NewPropertyPage() {
  return (
    <div className="max-w-4xl space-y-10">
      <header>
        <Link
          href="/admin/properties"
          className="nav-link text-xs uppercase tracking-[0.16em] text-muted hover:text-gold"
        >
          ← Properties
        </Link>
        <h1 className="mt-5 font-display text-4xl leading-none text-ink">
          New property
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          Create it as a draft first. Images can be reordered and the cover
          chosen once the record exists.
        </p>
      </header>

      <PropertyForm />
    </div>
  );
}

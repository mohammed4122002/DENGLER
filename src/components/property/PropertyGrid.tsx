import { PropertyCard } from "./PropertyCard";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { LocalizedProperty } from "@/lib/types";

export function PropertyGrid({
  properties,
  locale,
  t,
  columns = 3,
  priorityCount = 0,
}: {
  properties: LocalizedProperty[];
  locale: Locale;
  t: Dictionary;
  columns?: 2 | 3 | 4;
  priorityCount?: number;
}) {
  if (properties.length === 0) {
    return (
      <div className="border border-dashed border-hairline py-24 text-center">
        <p className="font-display text-3xl text-ink">{t.search.empty.title}</p>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
          {t.search.empty.copy}
        </p>
      </div>
    );
  }

  return (
    <ul
      className={`grid gap-5 lg:gap-6 ${
        columns === 2
          ? "sm:grid-cols-2"
          : columns === 4
            ? "sm:grid-cols-2 xl:grid-cols-4"
            : "sm:grid-cols-2 xl:grid-cols-3"
      }`}
    >
      {properties.map((property, index) => (
        <li key={property.id}>
          <PropertyCard
            property={property}
            locale={locale}
            t={t}
            priority={index < priorityCount}
            sizes={
              columns === 2
                ? "(min-width:768px) 45vw, 92vw"
                : columns === 4
                  ? "(min-width:1280px) 23vw, (min-width:640px) 45vw, 92vw"
                  : "(min-width:1280px) 30vw, (min-width:640px) 45vw, 92vw"
            }
          />
        </li>
      ))}
    </ul>
  );
}

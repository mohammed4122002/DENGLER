import { PropertyCard } from "./PropertyCard";
import type { Property } from "@/lib/types";

export function PropertyGrid({
  properties,
  columns = 3,
  priorityCount = 0,
}: {
  properties: Property[];
  columns?: 2 | 3;
  priorityCount?: number;
}) {
  if (properties.length === 0) {
    return (
      <div className="border border-dashed border-hairline py-24 text-center">
        <p className="font-display text-3xl text-ink">Nothing matches yet</p>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
          Widen the price range, clear a filter, or tell us what you are looking
          for and we will source it off-market.
        </p>
      </div>
    );
  }

  return (
    <ul
      className={`grid gap-x-8 gap-y-16 ${
        columns === 2
          ? "sm:grid-cols-2"
          : "sm:grid-cols-2 xl:grid-cols-3"
      }`}
    >
      {properties.map((property, index) => (
        <li key={property.id}>
          <PropertyCard
            property={property}
            priority={index < priorityCount}
            sizes={
              columns === 2
                ? "(min-width:768px) 45vw, 92vw"
                : "(min-width:1280px) 30vw, (min-width:640px) 45vw, 92vw"
            }
          />
        </li>
      ))}
    </ul>
  );
}

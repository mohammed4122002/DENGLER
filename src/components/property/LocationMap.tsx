import { PinIcon } from "@/components/ui/Icons";
import type { Property } from "@/lib/types";

/**
 * Location, without shipping a mapping SDK to every visitor.
 *
 * An embedded OpenStreetMap frame is lazy-loaded and costs nothing until it
 * scrolls into view — meaningfully cheaper than Mapbox or Google Maps, which
 * would each add a few hundred KB of JS and an API key to the critical path.
 * Swap the `src` for a keyed provider if you need custom styling later.
 */
export function LocationMap({ property }: { property: Property }) {
  const { latitude, longitude, location, title } = property;

  if (latitude === null || longitude === null) {
    return (
      <section className="border border-hairline p-7">
        <h2 className="font-display text-[1.75rem] text-ink">Location</h2>
        <p className="mt-3 flex items-center gap-2 text-sm text-muted">
          <PinIcon size={14} />
          {location}
        </p>
      </section>
    );
  }

  // A ~0.02° box gives roughly neighbourhood-level context at most latitudes.
  const delta = 0.02;
  const bbox = [
    longitude - delta,
    latitude - delta,
    longitude + delta,
    latitude + delta,
  ].join("%2C");

  const embedSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  const fullSrc = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=14/${latitude}/${longitude}`;

  return (
    <section aria-labelledby="location-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="location-heading" className="font-display text-[1.75rem] text-ink">
            Location
          </h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted">
            <PinIcon size={14} />
            {location}
          </p>
        </div>
        <a
          href={fullSrc}
          target="_blank"
          rel="noreferrer noopener"
          className="nav-link text-xs uppercase tracking-[0.16em] text-graphite transition-colors hover:text-gold"
        >
          Open full map
        </a>
      </div>

      <div className="mt-6 aspect-[16/9] w-full overflow-hidden border border-hairline bg-cream">
        <iframe
          src={embedSrc}
          title={`Map showing the location of ${title}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full grayscale-[35%] contrast-[1.05]"
        />
      </div>

      <p className="mt-3 text-xs text-muted">
        Marker shows the approximate area. Exact coordinates are shared at
        viewing stage.
      </p>
    </section>
  );
}

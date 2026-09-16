import { addImage, moveImage, removeImage } from "@/app/actions/admin";
import { SmartImage } from "@/components/site/SmartImage";
import type { Property } from "@/lib/types";

/**
 * Gallery management: upload by URL, reorder, delete.
 *
 * Server-rendered with bound server actions rather than a drag-and-drop
 * client widget — it works without JavaScript, it is keyboard-operable by
 * default, and the order it shows is always the order the database holds.
 * Position 1 is the cover.
 */
export function ImageManager({ property }: { property: Property }) {
  const images = property.images;

  return (
    <section className="border border-hairline p-6 md:p-8" aria-labelledby="images-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="images-heading" className="font-display text-2xl text-ink">
            Images
          </h2>
          <p className="mt-2 text-xs text-muted">
            {images.length} in the gallery. Position 1 is used as the cover.
          </p>
        </div>

        <form
          action={addImage.bind(null, property.id)}
          className="flex w-full items-end gap-3 sm:w-auto"
        >
          <label className="flex-1 sm:w-80">
            <span className="eyebrow block">Add by URL</span>
            <input
              name="image_url"
              type="url"
              required
              placeholder="https://…"
              className="field mt-1 font-mono text-xs"
            />
          </label>
          <button type="submit" className="btn btn-outline !py-2.5 !px-5 !text-[10px]">
            Add
          </button>
        </form>
      </div>

      {images.length === 0 ? (
        <p className="mt-7 border border-dashed border-hairline p-8 text-center text-sm text-muted">
          No images yet.
        </p>
      ) : (
        <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <li key={image.id} className="border border-hairline">
              <div className="relative aspect-[4/3] bg-cream">
                <SmartImage
                  src={image.image_url}
                  alt={image.alt}
                  fill
                  sizes="(min-width:1024px) 220px, 45vw"
                  className="object-cover"
                />
                {index === 0 && (
                  <span className="absolute start-2 top-2 rounded-full bg-gold px-2.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-paper">
                    Cover
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 p-2.5">
                <span className="text-[11px] text-muted">{index + 1}</span>

                <div className="flex items-center gap-1.5">
                  <IconAction
                    action={moveImage.bind(null, property.id, index, -1)}
                    label={`Move image ${index + 1} earlier`}
                    disabled={index === 0}
                  >
                    ↑
                  </IconAction>
                  <IconAction
                    action={moveImage.bind(null, property.id, index, 1)}
                    label={`Move image ${index + 1} later`}
                    disabled={index === images.length - 1}
                  >
                    ↓
                  </IconAction>
                  <IconAction
                    action={removeImage.bind(null, property.id, index)}
                    label={`Remove image ${index + 1}`}
                    destructive
                  >
                    ×
                  </IconAction>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-xs leading-relaxed text-muted">
        Reordering here rewrites the gallery order and the cover. To batch-edit
        the whole list, paste URLs into the Media field in the form below.
      </p>
    </section>
  );
}

function IconAction({
  action,
  label,
  children,
  disabled = false,
  destructive = false,
}: {
  action: () => Promise<void>;
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <form action={action}>
      <button
        type="submit"
        disabled={disabled}
        aria-label={label}
        title={label}
        className={`grid h-7 w-7 place-items-center border border-hairline text-sm transition-colors disabled:opacity-30 ${
          destructive
            ? "text-plum hover:border-plum"
            : "text-graphite hover:border-gold hover:text-gold"
        }`}
      >
        {children}
      </button>
    </form>
  );
}

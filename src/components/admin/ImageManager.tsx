import { addImage, moveImage, removeImage } from "@/app/actions/admin";
import { SmartImage } from "@/components/site/SmartImage";
import { fill, type Dictionary } from "@/lib/i18n";
import type { Property } from "@/lib/types";

/**
 * Gallery management: upload by URL, reorder, delete.
 *
 * Server-rendered with bound server actions rather than a drag-and-drop
 * client widget — it works without JavaScript, it is keyboard-operable by
 * default, and the order it shows is always the order the database holds.
 * Position 1 is the cover.
 */
export function ImageManager({
  property,
  t,
}: {
  property: Property;
  t: Dictionary;
}) {
  const images = property.images;

  return (
    <section className="border border-hairline p-6 md:p-8" aria-labelledby="images-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="images-heading" className="font-display text-2xl text-ink">
            {t.admin.images}
          </h2>
          <p className="mt-2 text-xs text-muted">
            {fill(t.admin.imagesCount, { n: images.length })}
          </p>
        </div>

        <form
          action={addImage.bind(null, property.id)}
          className="flex w-full items-end gap-3 sm:w-auto"
        >
          <label className="flex-1 sm:w-80">
            <span className="eyebrow block">{t.admin.addByUrl}</span>
            <input
              name="image_url"
              type="url"
              required
              placeholder="https://…"
              dir="ltr"
              className="field mt-1 font-mono text-xs"
            />
          </label>
          <button type="submit" className="btn btn-outline !py-2.5 !px-5 !text-[10px]">
            {t.admin.add}
          </button>
        </form>
      </div>

      {images.length === 0 ? (
        <p className="mt-7 border border-dashed border-hairline p-8 text-center text-sm text-muted">
          {t.admin.noImages}
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
                  <span className="absolute start-2 top-2 rounded-full bg-gold px-2.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-paper rtl:tracking-normal rtl:normal-case">
                    {t.admin.cover}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 p-2.5">
                <span className="text-[11px] text-muted tabular-nums">{index + 1}</span>

                <div className="flex items-center gap-1.5">
                  <IconAction
                    action={moveImage.bind(null, property.id, index, -1)}
                    label={fill(t.admin.moveEarlier, { n: index + 1 })}
                    disabled={index === 0}
                  >
                    ↑
                  </IconAction>
                  <IconAction
                    action={moveImage.bind(null, property.id, index, 1)}
                    label={fill(t.admin.moveLater, { n: index + 1 })}
                    disabled={index === images.length - 1}
                  >
                    ↓
                  </IconAction>
                  <IconAction
                    action={removeImage.bind(null, property.id, index)}
                    label={fill(t.admin.removeImage, { n: index + 1 })}
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

      <p className="mt-6 text-xs leading-relaxed text-muted">{t.admin.imagesNote}</p>
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

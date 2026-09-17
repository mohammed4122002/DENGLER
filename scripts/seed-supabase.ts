/**
 * Loads the Crete Roots demo catalogue into a Supabase project.
 *
 *   npm run seed
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the
 * environment (a .env.local is read automatically). The service-role key
 * bypasses RLS, which is why this is a local script and never a route.
 *
 * Re-running is safe: properties are upserted on `slug`, and each property's
 * images and features are replaced rather than appended.
 */
import { createClient } from "@supabase/supabase-js";
import { SEED_INQUIRIES, SEED_PROPERTIES, SEED_STATS } from "../src/lib/data/seed";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Copy .env.example to .env.local and fill them in first.",
  );
  process.exit(1);
}

const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log(`Seeding ${SEED_PROPERTIES.length} properties…`);

  for (const property of SEED_PROPERTIES) {
    const { id: _seedId, images, features, ...row } = property;

    const { data, error } = await db
      .from("properties")
      .upsert(row, { onConflict: "slug" })
      .select("id")
      .single();

    if (error) {
      console.error(`  ✗ ${property.slug}: ${error.message}`);
      continue;
    }

    const propertyId = data.id as string;

    await db.from("property_images").delete().eq("property_id", propertyId);
    if (images.length) {
      await db.from("property_images").insert(
        images.map((image, sort_order) => ({
          property_id: propertyId,
          image_url: image.image_url,
          alt: image.alt,
          sort_order,
        })),
      );
    }

    await db.from("property_features").delete().eq("property_id", propertyId);
    if (features.length) {
      await db
        .from("property_features")
        .insert(features.map((feature) => ({ property_id: propertyId, feature })));
    }

    console.log(`  ✓ ${property.slug}`);
  }

  console.log("\nSeeding site stats…");
  await db.from("site_stats").delete().neq("label", "");
  const { error: statsError } = await db
    .from("site_stats")
    .insert(SEED_STATS.map(({ id: _id, ...stat }) => stat));
  if (statsError) console.error(`  ✗ ${statsError.message}`);
  else console.log(`  ✓ ${SEED_STATS.length} stats`);

  console.log("\nSeeding example inquiries…");
  for (const inquiry of SEED_INQUIRIES) {
    const { data: match } = await db
      .from("properties")
      .select("id")
      .eq("title", inquiry.property_title ?? "")
      .maybeSingle();

    const { error } = await db.from("inquiries").insert({
      property_id: match?.id ?? null,
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      message: inquiry.message,
      status: inquiry.status,
    });
    if (error) console.error(`  ✗ ${inquiry.name}: ${error.message}`);
    else console.log(`  ✓ ${inquiry.name}`);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

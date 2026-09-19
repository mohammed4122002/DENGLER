/**
 * Crete Roots image registry.
 *
 * Every demo image in the platform resolves through this one file, so the
 * whole catalogue can be repointed at a different source (your own CDN,
 * Supabase Storage, a different stock library) by editing this map alone —
 * no component and no seed row needs to change.
 *
 * The defaults are Pexels CDN URLs. The Pexels licence permits commercial use
 * without attribution, but each entry carries its photographer anyway: an
 * image whose provenance isn't recorded is an image nobody can safely reuse
 * later. `note` is the photographer's own description, kept so a human picking
 * a replacement can see what the slot is meant to show.
 *
 * Pexels transforms server-side (`w`, `auto=compress`), so we never ship a
 * 7000px original, and Next.js re-encodes to AVIF/WebP on top of that. Every
 * id here was resolved through the Pexels API rather than typed from memory.
 *
 * Run `npm run verify:images` to confirm every URL in this file resolves.
 */

const PEXELS = "https://images.pexels.com/photos";

/** Build a bandwidth-sane Pexels URL. Width only, so the native aspect ratio
 *  survives — every consumer crops with `object-fit`, and cropping twice
 *  (once at the CDN, once in the browser) is how faces and horizons get cut
 *  off. All ids are landscape originals. */
export function pexels(id: number, width = 1600): string {
  return `${PEXELS}/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=${width}`;
}

/**
 * Served from /public, so it always resolves — used as the `onError` fallback
 * and as the blur placeholder behind every remote image.
 */
export const FALLBACK_IMAGE = "/media/placeholder.svg";

/**
 * The `blurDataURL` behind every remote photograph.
 *
 * Graded dark-to-warm rather than cream: property photography here is mostly
 * dusk and interiors, so a mid-dark blur is closer to what resolves on top of
 * it, and — more importantly — white hero type stays readable during the swap
 * instead of disappearing against a pale panel for a beat.
 */
export const BLUR_DATA_URL =
  "data:image/svg+xml;base64," +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="7"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#23262c"/><stop offset="60%" stop-color="#4a4038"/><stop offset="100%" stop-color="#7d6248"/></linearGradient></defs><rect width="10" height="7" fill="url(#g)"/></svg>`,
  ).toString("base64");

/**
 * Semantic keys → photographs. Swap the values, keep the keys.
 *
 * An entry is either a Pexels id or a file you own:
 *
 *     heroVillaDusk: { id: 15533154, by: "…", note: "…" }
 *     heroVillaDusk: { file: "/media/hero.jpg", by: "…", note: "…" }
 *
 * The `file` form exists so that buying or shooting a photograph is a drop —
 * put the file in `public/media/`, change one line here — rather than a code
 * change. A local file is served as-is: it is not resized or re-encoded by a
 * CDN, so export it at about 2400px wide and compress it before committing.
 * Next still re-encodes it to AVIF/WebP and serves it at the right size.
 */
export const PHOTO_IDS = {
  // --- Hero plates (cinematic, wide, dark enough to carry white type) ---
  heroVillaDusk: { file: "/media/hero-dubai.webp", by: "Supplied by the site owner", note: "Penthouse terrace at golden hour, the Burj Khalifa and downtown Dubai beyond." },
  heroSky: { id: 5577693, by: "Aleksandar Pasaric", note: "Nighttime view of Dubai's skyline with the iconic Burj Khalifa lit up." },
  heroCoastal: { id: 28350363, by: "Fabio Oliveira", note: "The towering skyscrapers of Dubai Marina reflecting in the water." },

  // --- Villas ---
  villaPalmModern: { id: 36134147, by: "Vika Glitter", note: "Aerial view of Palm Jumeirah and the Atlantis hotel in Dubai." },
  villaGlassPool: { id: 31817160, by: "Ahmet ÇÖTÜR", note: "Stunning luxury villa overlooking the ocean with an infinity pool at sunset." },
  villaMediterranean: { id: 5720658, by: "Daniel Dorfer", note: "Minimalist terrace with wooden table and stools overlooking the Aegean Sea in Santorini." },
  villaCliff: { id: 30310508, by: "✰ Saul Bandera Brotheridge", note: "Elegant villa perched on a cliff in Costa Brava, framed by trees against a clear sky." },
  villaDesertStone: { id: 10610733, by: "alleksana", note: "Stunning modern villa with glass facade and unique olive tree landscape." },
  villaTropical: { id: 36418268, by: "Mark Direen", note: "Luxurious villa pool surrounded by lush tropical greenery in Bali, Indonesia." },
  villaWhiteMinimal: { id: 8134816, by: "Max Vakhtbovych", note: "Contemporary two-story house with clean lines surrounded by green grass and blue sky." },
  villaLakeside: { id: 7114136, by: "cottonbro studio", note: "Wooden deck with seating and plants, offering a serene view over a tranquil body of water." },
  villaAlpine: { id: 7746555, by: "Max Vakhtbovych", note: "Beautiful snow-covered chalet nestled in the winter mountains, surrounded by nature." },
  villaMarina: { id: 4471207, by: "Aleksandar Pasaric", note: "Dubai Marina, skyscrapers over calm reflective water." },

  // --- Hotels ---
  hotelResortPool: { id: 261101, by: "Pixabay", note: "Relaxing tropical poolside scene with palm trees, gazebo, and clear blue water at a luxury re…" },
  hotelLobby: { id: 30047554, by: "Amir Ghoorchiani", note: "Dubai Marina's night skyline seen through a luxury hotel window." },
  hotelBoutique: { id: 10573397, by: "Zakaria HANIF", note: "Charming pool courtyard of a traditional riad in Ouarzazate, Morocco, with lush plants and in…" },
  hotelUrbanTower: { id: 35541845, by: "Amine M'Siouri", note: "Abu Dhabi's skyline at night, reflected on the water." },
  hotelIslandRetreat: { id: 3293192, by: "Asad Photo Maldives", note: "Splendid overwater villas in Maldives offering a serene and luxurious vacation experience." },

  // --- Land ---
  landCoastalPlot: { id: 1459508, by: "Felix Mittermeier", note: "A stunning view of a dramatic coastal cliff overlooking the calm sea and cloudy sky." },
  landDesertParcel: { id: 14743568, by: "Kaique Rocha", note: "Figures silhouetted in the Dubai desert at golden hour." },
  landHillside: { id: 28080408, by: "Levent Simsek", note: "Tranquil rural landscape featuring open fields, rolling hills, and a distant village under a…" },
  landVineyard: { id: 23441099, by: "Wolfgang Weiser", note: "A scenic vineyard in Siena, Tuscany, showcasing lush vines under a dramatic cloudy sky." },
  landIsland: { id: 32737290, by: "Septimiu Lupea", note: "Stunning aerial view of rocky shoreline with clear turquoise waters in Greece." },
  landUrbanLot: { id: 36094167, by: "Vika Glitter", note: "The Burj Al Arab behind construction cranes — Dubai under development." },
  landForest: { id: 38712295, by: "Radoslaw Sikorski", note: "Captivating aerial view of a dense pine forest segmented by a straight road under clear skies." },
  landRiverfront: { id: 20378874, by: "Helena Jankovičová Kováčová", note: "Aerial view of a peaceful autumn landscape featuring a winding river through rural fields at…" },
  landPlateau: { id: 37684071, by: "pierre matile", note: "Stunning view of the Atlas Mountains under a cloudy sky in Morocco's rugged terrain." },
  landMountain: { id: 27539299, by: "Marco Milanesi", note: "Majestic view of rugged Dolomites in summer evening light, perfect for travel inspiration." },

  // --- Interiors / detail (gallery filler) ---
  interiorLiving: { id: 37126401, by: "Waqas ilyas", note: "Spacious and bright minimalist living room with a city view, featuring large windows and a co…" },
  interiorKitchen: { id: 8142459, by: "Max Vakhtbovych", note: "Modern kitchen with a black marble island and wooden cabinets." },
  interiorBedroom: { id: 14750392, by: "Quang Nguyen Vinh", note: "Spacious modern bedroom with elegant decor in a luxury suite." },
  interiorBath: { id: 8146150, by: "Max Vakhtbovych", note: "Marble bathroom with a modern bathtub and a city view." },
  interiorStair: { id: 36272645, by: "Jan van der Wolf", note: "Minimalist concrete staircase featuring terrazzo texture and sleek metal railings." },
  interiorTerrace: { id: 30606279, by: "Kelly", note: "Terrace overlooking an urban skyline, sky reflected in the glass." },
  detailPool: { id: 36134177, by: "Vika Glitter", note: "A rooftop infinity pool with a view over the Dubai skyline." },
  detailGarden: { id: 7174115, by: "Max Vakhtbovych", note: "Modern house near backyard with wooden path near green grass and plants with trees under blue…" },
  detailFacade: { id: 13762561, by: "Nothing Ahead", note: "Close-up of a contemporary building facade with vertical geometric design." },
  detailSunset: { id: 12376868, by: "Serg Alesenko", note: "A breathtaking view of the sun setting over the ocean, creating an orange sky." },
} as const;

export type PhotoKey = keyof typeof PHOTO_IDS;

type PhotoEntry =
  | { readonly id: number; readonly by: string; readonly note: string }
  | { readonly file: string; readonly by: string; readonly note: string };

/** Resolve a semantic key to a ready-to-render URL.
 *
 *  A local file ignores `width`: there is no CDN in front of it to resize it,
 *  and appending a width it cannot honour would be a URL that lies. */
export function photo(key: PhotoKey, width = 1600): string {
  const entry = PHOTO_IDS[key] as PhotoEntry;
  if ("file" in entry) return entry.file;
  return pexels(entry.id, width);
}

/** Photographer credits, keyed the same way — for a credits page or an audit. */
export function credit(key: PhotoKey): { by: string; url: string | null } {
  const entry = PHOTO_IDS[key] as PhotoEntry;
  if ("file" in entry) return { by: entry.by, url: null };
  return { by: entry.by, url: `https://www.pexels.com/photo/${entry.id}/` };
}

export const ALL_PHOTO_KEYS = Object.keys(PHOTO_IDS) as PhotoKey[];

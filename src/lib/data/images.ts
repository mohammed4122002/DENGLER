/**
 * DENGLER image registry.
 *
 * Every demo image in the platform resolves through this one file, so the
 * whole catalogue can be repointed at a different source (your own CDN,
 * Supabase Storage, a different stock library) by editing this map alone —
 * no component and no seed row needs to change.
 *
 * The defaults are Unsplash CDN URLs, which are free to use commercially
 * under the Unsplash licence. They are transformed server-side by Unsplash
 * (`w`, `q`, `fm`) so we never ship a 6000px original, and Next.js re-encodes
 * them to AVIF/WebP on top of that.
 *
 * Run `npm run verify:images` to confirm every URL in this file resolves.
 */

const UNSPLASH = "https://images.unsplash.com";

/** Build a bandwidth-sane Unsplash URL. */
export function unsplash(id: string, width = 1600): string {
  return `${UNSPLASH}/${id}?auto=format&fit=crop&w=${width}&q=72`;
}

/**
 * Served from /public, so it always resolves — used as the `onError` fallback
 * and as the blur placeholder behind every remote image.
 */
export const FALLBACK_IMAGE = "/media/placeholder.svg";

/**
 * A 10px SVG data URI used as the `blurDataURL` for every remote photograph.
 * Keeps first paint warm (cream, not grey) instead of flashing an empty box.
 */
export const BLUR_DATA_URL =
  "data:image/svg+xml;base64," +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="7"><rect width="10" height="7" fill="#ece4d8"/><rect width="10" height="3" fill="#ded2c1"/></svg>`,
  ).toString("base64");

/** Semantic keys → Unsplash photo ids. Swap the ids, keep the keys. */
export const PHOTO_IDS = {
  // --- Hero plates (cinematic, wide) ---
  heroVillaDusk: "photo-1613490493576-7fde63acd811",
  heroSky: "photo-1500673922987-e212871fec22",
  heroCoastal: "photo-1512917774080-9991f1c4c750",

  // --- Villas ---
  villaPalmModern: "photo-1600596542815-ffad4c1539a9",
  villaGlassPool: "photo-1600607687920-4e2a09cf159d",
  villaMediterranean: "photo-1580587771525-78b9dba3b914",
  villaCliff: "photo-1512915922686-57c11dde9b6b",
  villaDesertStone: "photo-1600566753086-00f18fb6b3ea",
  villaTropical: "photo-1582268611958-ebfd161ef9cf",
  villaWhiteMinimal: "photo-1600585154340-be6161a56a0c",
  villaLakeside: "photo-1613977257363-707ba9348227",
  villaAlpine: "photo-1449158743715-0a90ebb6d2d8",
  villaMarina: "photo-1600047509807-ba8f99d2cdde",

  // --- Hotels ---
  hotelResortPool: "photo-1566073771259-6a8506099945",
  hotelLobby: "photo-1551882547-ff40c63fe5fa",
  hotelBoutique: "photo-1445019980597-93fa8acb246c",
  hotelUrbanTower: "photo-1542314831-068cd1dbfeeb",
  hotelIslandRetreat: "photo-1520250497591-112f2f40a3f4",

  // --- Land ---
  landCoastalPlot: "photo-1500382017468-9049fed747ef",
  landDesertParcel: "photo-1509316785289-025f5b846b35",
  landHillside: "photo-1441974231531-c6227db76b6e",
  landVineyard: "photo-1506905925346-21bda4d32df4",
  landIsland: "photo-1507525428034-b723cf961d3e",
  landUrbanLot: "photo-1486406146926-c627a92ad1ab",
  landForest: "photo-1470071459604-3b5ec3a7fe05",
  landRiverfront: "photo-1439066615861-d1af74d74000",
  landPlateau: "photo-1472396961693-142e6e269027",
  landMountain: "photo-1454496522488-7a8e488e8606",

  // --- Interiors / detail (gallery filler) ---
  interiorLiving: "photo-1618221195710-dd6b41faaea6",
  interiorKitchen: "photo-1556911220-bff31c812dba",
  interiorBedroom: "photo-1616594039964-ae9021a400a0",
  interiorBath: "photo-1552321554-5fefe8c9ef14",
  interiorStair: "photo-1600210492486-724fe5c67fb0",
  interiorTerrace: "photo-1600607687644-c7171b42498b",
  detailPool: "photo-1571003123894-1f0594d2b5d9",
  detailGarden: "photo-1558618666-fcd25c85cd64",
  detailFacade: "photo-1487958449943-2429e8be8625",
  detailSunset: "photo-1470770841072-f978cf4d019e",
} as const;

export type PhotoKey = keyof typeof PHOTO_IDS;

/** Resolve a semantic key to a ready-to-render URL. */
export function photo(key: PhotoKey, width = 1600): string {
  return unsplash(PHOTO_IDS[key], width);
}

export const ALL_PHOTO_KEYS = Object.keys(PHOTO_IDS) as PhotoKey[];

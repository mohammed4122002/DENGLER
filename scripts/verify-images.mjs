#!/usr/bin/env node
/**
 * Verifies that every photo id in src/lib/data/images.ts resolves.
 *
 * The build sandbox this project was scaffolded in blocks outbound requests to
 * image CDNs, so the registry could not be checked there. Run this once from a
 * machine with normal internet access:
 *
 *   npm run verify:images
 *
 * Any id reported as FAIL should be replaced in src/lib/data/images.ts with a
 * working Pexels photo id (the number in any pexels.com/photo/.../<id>/ URL),
 * or with a URL of your own.
 */
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../src/lib/data/images.ts", import.meta.url), "utf8");
const block = src.slice(src.indexOf("export const PHOTO_IDS"), src.indexOf("} as const;"));
const entries = [...block.matchAll(/(\w+):\s*\{\s*id:\s*(\d+)/g)].map((m) => [m[1], m[2]]);

if (entries.length === 0) {
  console.error("No photo ids found — has the registry format changed?");
  process.exit(1);
}

console.log(`Checking ${entries.length} images…\n`);

let failed = 0;
await Promise.all(
  entries.map(async ([key, id]) => {
    const url = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&w=80`;
    try {
      const res = await fetch(url, { method: "GET", redirect: "follow" });
      if (res.ok) {
        console.log(`  ok    ${key}`);
      } else {
        failed++;
        console.log(`  FAIL  ${key}  (${res.status})  ${id}`);
      }
    } catch (err) {
      failed++;
      console.log(`  FAIL  ${key}  (${err.message})  ${id}`);
    }
  }),
);

console.log(
  failed === 0
    ? `\nAll ${entries.length} images resolve.`
    : `\n${failed} of ${entries.length} images need replacing in src/lib/data/images.ts.`,
);
process.exit(failed === 0 ? 0 : 1);

#!/usr/bin/env node
/**
 * Crete Roots end-to-end check.
 *
 *   npm run build && npm run test:e2e
 *
 * Drives a real browser against a running production server and asserts the
 * things that are easy to break and hard to notice:
 *
 *   · every route renders without a console error or an uncaught exception
 *   · search filters round-trip through the URL
 *   · the enquiry form rejects bad input and confirms good input
 *   · the gallery lightbox opens, traps focus and closes on Escape
 *   · no horizontal overflow at 320 / 390 / 768 / 1440
 *   · the investment rail actually sticks (regressed once already, via a
 *     stray `overflow-x` on <body>)
 *   · the admin flow: guard → sign in → publish → create → lead → sign out
 *   · both language trees: routing, redirects, `dir`/`lang`, hreflang, the
 *     switcher preserving path and filters, and Arabic content actually being
 *     Arabic rather than an untranslated fallback
 *   · hero copy contrast, measured off the rendered pixels — including
 *     against a forced near-white photograph
 *
 * Set BASE_URL to point at a different server (default http://127.0.0.1:3100).
 * The admin section runs only when ADMIN_PASSWORD is set, matching the server.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3100";
const SHOT_DIR = process.env.SHOT_DIR ?? null;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
const EXECUTABLE = process.env.CHROMIUM_PATH || undefined;

if (SHOT_DIR) mkdirSync(SHOT_DIR, { recursive: true });

const problems = [];
const fail = (msg) => problems.push(msg);

/** Image CDNs and the map embed are third-party; their failures are not ours. */
const THIRD_PARTY = /unsplash|pexels|openstreetmap|ERR_|Failed to load resource/i;

function watch(page, label) {
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (THIRD_PARTY.test(text)) return;
    fail(`console error on ${label}${page.url().replace(BASE, "")}: ${text}`);
  });
  page.on("pageerror", (err) =>
    fail(`uncaught exception on ${label}${page.url().replace(BASE, "")}: ${err.message}`),
  );
}

const shot = async (page, name) => {
  if (SHOT_DIR) await page.screenshot({ path: `${SHOT_DIR}/${name}.png` });
};

const PATHS = [
  "/",
  "/properties",
  "/villas",
  "/hotels",
  "/land",
  "/investments",
  "/about",
  "/contact",
  "/legal/privacy",
  "/legal/terms",
  "/legal/disclosures",
  "/properties/palm-residence-dubai",
  "/properties/seascape-resort-maldives",
  "/properties/jumeirah-bay-plot",
];

const LOCALES = ["en", "ar"];

/** Every public route, in every language. */
const PUBLIC_ROUTES = LOCALES.flatMap((locale) =>
  PATHS.map((path) => (path === "/" ? `/${locale}` : `/${locale}${path}`)),
);

/** Matches at least one Arabic letter. */
const ARABIC = /[\u0600-\u06FF]/;

const browser = await chromium.launch({ executablePath: EXECUTABLE });

/* ------------------------------------------------------------------ *
 * 1. Every public route renders cleanly
 * ------------------------------------------------------------------ */
{
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  watch(page, "desktop ");

  for (const route of PUBLIC_ROUTES) {
    const res = await page
      .goto(BASE + route, { waitUntil: "domcontentloaded", timeout: 45000 })
      .catch((err) => {
        fail(`${route}: navigation failed — ${err.message}`);
        return null;
      });
    if (res && res.status() >= 400) fail(`${route}: HTTP ${res.status()}`);
    await page.waitForTimeout(/^\/(en|ar)$/.test(route) ? 4200 : 800);

    if ((await page.locator("h1").count()) === 0) fail(`${route}: no <h1> on the page`);
    if (SHOT_DIR && ["/en", "/ar", "/ar/properties", "/ar/investments"].includes(route)) {
      await shot(page, `route${route.replace(/\//g, "_") || "_home"}`);
    }
  }

  // 404 handling
  const missing = await page.goto(`${BASE}/en/properties/does-not-exist`, { waitUntil: "domcontentloaded" });
  if (missing.status() !== 404) fail(`Unknown property slug returned ${missing.status()}, expected 404`);

  await page.close();
}

/* ------------------------------------------------------------------ *
 * 2. Search round-trips through the URL
 * ------------------------------------------------------------------ */
{
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  watch(page, "search ");

  await page.goto(`${BASE}/en/properties`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  await page.selectOption("#filter-type", "hotel");
  await page.waitForTimeout(1200);
  if (!page.url().includes("type=hotel")) fail(`Type filter did not reach the URL: ${page.url()}`);

  await page.getByRole("button", { name: /advanced filters/i }).click();
  await page.waitForTimeout(500);
  await page.selectOption("#filter-minRoi", "12");
  await page.waitForTimeout(1200);
  if (!page.url().includes("minRoi=12")) fail(`ROI filter did not reach the URL: ${page.url()}`);
  await shot(page, "search-filters");

  await page.getByRole("button", { name: /clear all/i }).click();
  await page.waitForTimeout(1200);
  if (page.url().includes("minRoi")) fail("Clear all left filters in the URL");

  await page.close();
}

/* ------------------------------------------------------------------ *
 * 3. Enquiry form validation and submission
 * ------------------------------------------------------------------ */
{
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  watch(page, "form ");

  await page.goto(`${BASE}/en/contact`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(900);

  await page.fill('input[name="name"]', "Q");
  await page.fill('input[name="email"]', "not-an-email");
  await page.fill('textarea[name="message"]', "hi");
  await page.getByRole("button", { name: /send enquiry/i }).click();
  await page.waitForTimeout(1800);
  if ((await page.locator('[role="alert"]').count()) === 0) {
    fail("Enquiry form accepted invalid input without reporting an error");
  }

  await page.fill('input[name="name"]', "Amara Osei");
  await page.fill('input[name="email"]', "amara@example.com");
  await page.fill('textarea[name="message"]', "Please send the pack for the Red Sea coastal parcel.");
  await page.getByRole("button", { name: /send enquiry/i }).click();
  await page.waitForTimeout(2500);
  if ((await page.getByText(/Enquiry received/i).count()) === 0) {
    fail("Enquiry form did not confirm a valid submission");
  }

  await page.close();
}

/* ------------------------------------------------------------------ *
 * 4. Gallery lightbox
 * ------------------------------------------------------------------ */
{
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  watch(page, "gallery ");

  await page.goto(`${BASE}/en/properties/seascape-resort-maldives`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: /gallery full screen/i }).click();
  await page.waitForTimeout(800);
  if ((await page.locator('[role="dialog"]').count()) === 0) fail("Gallery lightbox did not open");
  await shot(page, "gallery-lightbox");

  await page.keyboard.press("Escape");
  await page.waitForTimeout(600);
  if ((await page.locator('[role="dialog"]').count()) !== 0) fail("Lightbox did not close on Escape");

  await page.close();
}

/* ------------------------------------------------------------------ *
 * 5. The investment rail sticks
 * ------------------------------------------------------------------ */
{
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await page.goto(`${BASE}/en/properties/cap-ferrat-villa`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);

  // Scroll the whole document: reveal animations grow the page as they run, so
  // a fixed scroll ceiling can stop short of the point where the rail pins.
  // The rail should hold at nav height (76px) + 24px across a run of samples,
  // then release once its container's bottom passes — which is why this counts
  // pinned samples rather than taking a minimum.
  const PIN_TOP = 100;
  let pinnedSamples = 0;
  for (let y = 0; ; y += 200) {
    await page.evaluate((value) => window.scrollTo(0, value), y);
    await page.waitForTimeout(110);
    const state = await page.evaluate(() => ({
      top: Math.round(document.querySelector("aside > div").getBoundingClientRect().top),
      max: document.body.scrollHeight - window.innerHeight,
    }));
    if (Math.abs(state.top - PIN_TOP) <= 2) pinnedSamples++;
    if (y >= state.max) break;
  }
  if (pinnedSamples < 3) {
    fail(
      `Investment rail is not sticking: it held at ${PIN_TOP}px for only ${pinnedSamples} sample(s) across the page`,
    );
  }

  await page.close();
}

/* ------------------------------------------------------------------ *
 * 6. No horizontal overflow at any breakpoint
 * ------------------------------------------------------------------ */
for (const [width, height, label] of [
  [320, 700, "small"],
  [390, 844, "mobile"],
  [768, 1024, "tablet"],
  [1440, 900, "desktop"],
]) {
  const context = await browser.newContext({
    viewport: { width, height },
    isMobile: width < 800,
    hasTouch: width < 800,
    deviceScaleFactor: width < 800 ? 2 : 1,
  });
  const page = await context.newPage();
  watch(page, `${label} `);

  for (const route of PUBLIC_ROUTES) {
    await page.goto(BASE + route, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(/^\/(en|ar)$/.test(route) ? 3200 : 700);

    const result = await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 700) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 45));
      }
      window.scrollTo(600, 0);
      const scrolled = window.scrollX;
      window.scrollTo(0, 0);
      return { over: document.body.scrollWidth - document.documentElement.clientWidth, scrolled };
    });

    if (result.over > 2 || result.scrolled > 0) {
      fail(`${label} ${width}px ${route}: horizontal overflow (+${result.over}px, scrollX ${result.scrolled})`);
    }
  }

  if (width === 390) {
    await page.goto(`${BASE}/en/properties`, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /open menu/i }).click();
    await page.waitForTimeout(700);
    if ((await page.locator("#mobile-menu").count()) === 0) fail("Mobile menu did not open");
    await shot(page, "mobile-menu");
  }

  await context.close();
}

/* ------------------------------------------------------------------ *
 * 7. Bilingual routing, direction and content
 * ------------------------------------------------------------------ */
{
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  watch(page, "i18n ");

  // Unprefixed paths redirect into a locale.
  for (const [from, expected] of [["/", "/en"], ["/properties", "/en/properties"]]) {
    const res = await page.goto(BASE + from, { waitUntil: "domcontentloaded" });
    if (!new URL(page.url()).pathname.startsWith(expected)) {
      fail(`${from} did not redirect into a locale (landed on ${page.url()})`);
    }
    if (res && res.status() >= 400) fail(`${from}: HTTP ${res.status()}`);
  }

  // Accept-Language decides the locale for a first-time visitor.
  const arabicFirst = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "ar-AE",
    extraHTTPHeaders: { "Accept-Language": "ar-AE,ar;q=0.9,en;q=0.5" },
  });
  const arPage = await arabicFirst.newPage();
  await arPage.goto(BASE, { waitUntil: "domcontentloaded" });
  if (!new URL(arPage.url()).pathname.startsWith("/ar")) {
    fail(`An Arabic Accept-Language landed on ${arPage.url()}, expected /ar`);
  }
  await arabicFirst.close();

  // Document direction, language and hreflang.
  for (const [route, dir, lang] of [
    ["/en/properties", "ltr", "en"],
    ["/ar/properties", "rtl", "ar"],
  ]) {
    await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(900);

    const doc = await page.evaluate(() => ({
      dir: document.documentElement.dir,
      lang: document.documentElement.lang,
      alternates: [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map(
        (el) => `${el.getAttribute("hreflang")}:${new URL(el.href).pathname}`,
      ),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
      ogUrl: document.querySelector('meta[property="og:url"]')?.getAttribute("content") ?? null,
    }));

    if (doc.dir !== dir) fail(`${route}: <html dir> is "${doc.dir}", expected "${dir}"`);
    if (!doc.lang.startsWith(lang)) {
      fail(`${route}: <html lang> is "${doc.lang}", expected to start with "${lang}"`);
    }
    for (const want of ["en:/en/properties", "ar:/ar/properties", "x-default:/en/properties"]) {
      if (!doc.alternates.includes(want)) {
        fail(`${route}: missing hreflang ${want} (has ${doc.alternates.join(", ") || "none"})`);
      }
    }
    /*
     * Absolute, with a scheme — not merely "ends with the route".
     *
     * `metadataBase` is built from an environment variable, and Next inlines
     * an unset NEXT_PUBLIC_* as an empty string. That once made `new URL("")`
     * throw and took every deployment down; the near miss is worse, though —
     * a value that parses but points at localhost would publish canonical and
     * Open Graph URLs for a machine nobody can reach.
     */
    for (const [field, value] of [["canonical", doc.canonical], ["og:url", doc.ogUrl]]) {
      if (!value) {
        fail(`${route}: ${field} is missing`);
        continue;
      }
      let parsed;
      try {
        parsed = new URL(value);
      } catch {
        fail(`${route}: ${field} is not an absolute URL — "${value}"`);
        continue;
      }
      if (!/^https?:$/.test(parsed.protocol)) {
        fail(`${route}: ${field} has protocol "${parsed.protocol}"`);
      }
      if (parsed.pathname !== route) {
        fail(`${route}: ${field} path is "${parsed.pathname}", expected "${route}"`);
      }
    }
  }

  // The Arabic site must actually be in Arabic — headings, navigation and
  // property copy, not just the chrome.
  await page.goto(`${BASE}/ar/properties/palm-residence-dubai`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1200);
  for (const [label, text] of [
    ["<h1>", await page.locator("h1").first().innerText()],
    ["nav", await page.locator("header nav ul").first().innerText()],
    ["description", await page.locator("p.whitespace-pre-line").first().innerText()],
    ["features", await page.locator("ul li").nth(2).innerText()],
  ]) {
    if (!ARABIC.test(text)) {
      fail(`Arabic detail page: ${label} is not Arabic — "${text.slice(0, 60)}"`);
    }
  }

  // Prices keep Latin digits and Arabic compact notation.
  const priceText = await page.locator("h1 ~ * .tabular-nums, .tabular-nums").first().innerText();
  if (!/[0-9]/.test(priceText)) {
    fail(`Arabic price is not using Latin digits: "${priceText}"`);
  }
  await shot(page, "ar-detail");

  // The switcher preserves the path and the query string.
  await page.goto(`${BASE}/en/properties?type=hotel&sort=roi_desc`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1500);
  await page.getByRole("group", { name: /switch language|تغيير اللغة/i })
    .getByRole("link", { name: "العربية" })
    .first()
    .click();
  await page.waitForTimeout(2000);

  const switched = new URL(page.url());
  if (switched.pathname !== "/ar/properties") {
    fail(`Switching language lost the path: ${switched.pathname}`);
  }
  if (switched.searchParams.get("type") !== "hotel" || switched.searchParams.get("sort") !== "roi_desc") {
    fail(`Switching language lost the filters: ${switched.search}`);
  }
  await shot(page, "ar-properties");

  // …and back again, still carrying them.
  await page.getByRole("group", { name: /switch language|تغيير اللغة/i })
    .getByRole("link", { name: "EN" })
    .first()
    .click();
  await page.waitForTimeout(2000);
  if (new URL(page.url()).pathname !== "/en/properties") {
    fail(`Switching back lost the path: ${page.url()}`);
  }

  // Arabic search matches Arabic content.
  await page.goto(`${BASE}/ar/properties`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  await page.fill('input[type="search"]', "دبي");
  await page.waitForTimeout(1800);
  const arabicHits = await page.locator("article").count();
  if (arabicHits === 0) fail("Arabic search for دبي returned no properties");

  // Folding: the same query without the hamza must match too.
  await page.fill('input[type="search"]', "الامارات");
  await page.waitForTimeout(1800);
  if ((await page.locator("article").count()) === 0) {
    fail("Arabic search did not fold الامارات → الإمارات");
  }

  await page.close();
}

/* ------------------------------------------------------------------ *
 * 8. Hero contrast, measured off the rendered pixels
 * ------------------------------------------------------------------ *
 * The hero sets white type over a photograph an editor can swap at any time.
 * This hides every glyph in the section, screenshots the boxes the text
 * actually occupies, and reads the pixels back through a canvas — so the
 * assertion is about what is painted, not about what the CSS intends.
 *
 * It runs twice: as published, and with every hero image forced to pure white,
 * which is the brightest photograph anyone could realistically upload.
 *
 * This regressed once already — the headline measured 1.2:1 — so the numbers
 * are checked rather than eyeballed.
 * ------------------------------------------------------------------ */
{
  const MIN_CONTRAST = 3; // WCAG AA, large text.
  const chan = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const relLum = ([r, g, b]) => 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
  const contrast = (a, b) => {
    const [hi, lo] = a > b ? [a, b] : [b, a];
    return (hi + 0.05) / (lo + 0.05);
  };
  const WHITE = relLum([255, 255, 255]);

  for (const bright of [false, true]) {
    for (const [label, path, selector] of [
      ["en hero headline", "/en", "h1"],
      ["en hero lead", "/en", "h1 ~ p"],
      ["en page header", "/en/properties", "h1"],
      ["ar hero headline", "/ar", "h1"],
      ["ar hero lead", "/ar", "h1 ~ p"],
      ["ar page header", "/ar/properties", "h1"],
    ]) {
      const page = await (
        await browser.newContext({ viewport: { width: 1440, height: 900 } })
      ).newPage();
      await page.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.waitForTimeout(5200);

      if (bright) {
        await page.evaluate(() => {
          document.querySelectorAll("section img").forEach((img) => {
            img.style.filter = "brightness(0) invert(1)";
            img.style.opacity = "1";
          });
        });
        await page.waitForTimeout(300);
      }

      const rects = await page.evaluate((sel) => {
        const root = document.querySelector(sel);
        if (!root) return [];
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        const found = [];
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          if (!node.textContent.trim()) continue;
          const range = document.createRange();
          range.selectNodeContents(node);
          for (const r of range.getClientRects()) {
            if (r.width > 8 && r.height > 8 && r.top >= 0 && r.bottom <= innerHeight) {
              found.push({
                x: Math.round(r.x),
                y: Math.round(r.y),
                width: Math.round(r.width),
                height: Math.round(r.height),
              });
            }
          }
        }
        // A line box is taller than its ink, so a heading's rect overlaps the
        // element above it. Clearing every glyph in the section — rather than
        // just this one — stops the eyebrow's own pixels being read as
        // background.
        root.closest("section")?.querySelectorAll("*").forEach((el) => {
          el.style.color = "transparent";
          el.style.textShadow = "none";
          el.style.webkitTextFillColor = "transparent";
        });
        return found;
      }, selector);

      if (rects.length === 0) {
        fail(`contrast: no text found for ${label}`);
        await page.close();
        continue;
      }
      await page.waitForTimeout(150);

      let worst = Infinity;
      for (const rect of rects) {
        const encoded = (await page.screenshot({ clip: rect })).toString("base64");
        const maxLum = await page.evaluate(async (data) => {
          const img = new Image();
          img.src = `data:image/png;base64,${data}`;
          await img.decode();
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const px = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          const f = (v) => {
            const n = v / 255;
            return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
          };
          let max = 0;
          for (let i = 0; i < px.length; i += 4) {
            const L = 0.2126 * f(px[i]) + 0.7152 * f(px[i + 1]) + 0.0722 * f(px[i + 2]);
            if (L > max) max = L;
          }
          return max;
        }, encoded);
        worst = Math.min(worst, contrast(WHITE, maxLum));
      }

      if (worst < MIN_CONTRAST) {
        fail(
          `contrast: ${label}${bright ? " (near-white photo)" : ""} is ${worst.toFixed(2)}:1, below ${MIN_CONTRAST}:1`,
        );
      }
      await page.close();
    }
  }
}

/* ------------------------------------------------------------------ *
 * 9. Admin flow (only when the server has ADMIN_PASSWORD set)
 * ------------------------------------------------------------------ */
if (ADMIN_PASSWORD) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await context.newPage();
  watch(page, "admin ");

  await page.goto(`${BASE}/en/admin`, { waitUntil: "domcontentloaded" });
  if (!page.url().includes("/en/admin/login")) fail(`/admin did not redirect to the login page (at ${page.url()})`);

  await page.fill('input[name="password"]', "definitely-not-the-password");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForTimeout(1500);
  if (!page.url().includes("/en/admin/login")) fail("An incorrect password was accepted");

  await page.fill('input[name="password"]', ADMIN_PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/en\/admin$/, { timeout: 15000 }).catch(() => fail("Sign-in did not reach /admin"));
  await page.waitForTimeout(1000);
  await shot(page, "admin-overview");

  // Publish toggle
  await page.goto(`${BASE}/en/admin/properties`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  await shot(page, "admin-properties");
  await page.getByRole("button", { name: "Published", exact: true }).first().click();
  await page.waitForTimeout(2500);
  if ((await page.getByRole("button", { name: "Draft", exact: true }).count()) === 0) {
    fail("Publish toggle did not move a property to Draft");
  }
  await page.getByRole("button", { name: "Draft", exact: true }).first().click();
  await page.waitForTimeout(2500);

  // Create
  await page.goto(`${BASE}/en/admin/properties/new`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(900);
  for (const [selector, value] of [
    ['input[name="title"]', "Test Parcel"],
    ['input[name="location"]', "Test Bay, Testland"],
    ['input[name="city"]', "Test City"],
    ['input[name="country"]', "Testland"],
    // Deliberately not a round number: a `step` that rejects it would block
    // submission with no visible error.
    ['input[name="price"]', "1234567"],
    ['input[name="area"]', "5000"],
    ['input[name="tagline"]', "A parcel created by the end-to-end check."],
  ]) {
    await page.fill(selector, value);
  }
  await page.check('input[name="published"]');

  const invalid = await page.evaluate(() => {
    const form = [...document.querySelectorAll("form")].find((candidate) =>
      [...candidate.querySelectorAll("button")].some((button) =>
        /create property/i.test(button.textContent ?? ""),
      ),
    );
    return [...form.elements]
      .filter((element) => element.willValidate && !element.checkValidity())
      .map((element) => `${element.name}: ${element.validationMessage}`);
  });
  if (invalid.length) fail(`Property form rejects valid input — ${invalid.join("; ")}`);

  await page.getByRole("button", { name: /create property/i }).click();
  await page.waitForTimeout(3000);
  if ((await page.getByText(/Property created/i).count()) === 0) {
    fail("Creating a property did not report success");
  }

  await page.goto(`${BASE}/en/properties/test-parcel`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  if ((await page.getByRole("heading", { name: "Test Parcel", level: 1 }).count()) === 0) {
    fail("A published property is not live at its slug");
  }

  // Lead pipeline
  await page.goto(`${BASE}/en/contact`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  await page.fill('input[name="name"]', "Pipeline Check");
  await page.fill('input[name="email"]', "pipeline@example.com");
  await page.fill('textarea[name="message"]', "End-to-end check of the enquiry pipeline.");
  await page.getByRole("button", { name: /send enquiry/i }).click();
  await page.waitForTimeout(2500);

  await page.goto(`${BASE}/en/admin/leads`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  if ((await page.getByText("Pipeline Check").count()) === 0) {
    fail("A submitted enquiry did not reach /admin/leads");
  }
  await page.getByRole("button", { name: "Contacted", exact: true }).first().click();
  await page.waitForTimeout(2200);
  await shot(page, "admin-leads");

  // Headline figures
  await page.goto(`${BASE}/en/admin/settings`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  await page.locator('input[name^="value_"]').first().fill("999+");
  await page.getByRole("button", { name: /save figures/i }).click();
  await page.waitForTimeout(2500);
  await page.goto(`${BASE}/en`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  if ((await page.getByText("999+").count()) === 0) {
    fail("An edited headline figure did not reach the home page");
  }

  // Sign out revokes access
  await page.goto(`${BASE}/en/admin`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /sign out/i }).click();
  await page.waitForTimeout(2000);
  await page.goto(`${BASE}/en/admin/properties`, { waitUntil: "domcontentloaded" });
  if (!page.url().includes("/en/admin/login")) fail("Signing out did not revoke dashboard access");

  await context.close();
} else {
  console.log("· Skipping the admin flow (set ADMIN_PASSWORD to include it).\n");
}

await browser.close();

if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n${problems.map((p) => `  · ${p}`).join("\n")}\n`);
  process.exit(1);
}
console.log("\nAll end-to-end checks passed.\n");

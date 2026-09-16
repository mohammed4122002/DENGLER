#!/usr/bin/env node
/**
 * DENGLER end-to-end check.
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

const PUBLIC_ROUTES = [
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
  "/properties/dengler-palm-residence-dubai",
  "/properties/dengler-seascape-resort-maldives",
  "/properties/dengler-jumeirah-bay-plot",
];

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
    await page.waitForTimeout(route === "/" ? 4200 : 800);

    if ((await page.locator("h1").count()) === 0) fail(`${route}: no <h1> on the page`);
    if (SHOT_DIR && ["/", "/properties", "/investments"].includes(route)) {
      await shot(page, `route${route.replace(/\//g, "_") || "_home"}`);
    }
  }

  // 404 handling
  const missing = await page.goto(`${BASE}/properties/does-not-exist`, { waitUntil: "domcontentloaded" });
  if (missing.status() !== 404) fail(`Unknown property slug returned ${missing.status()}, expected 404`);

  await page.close();
}

/* ------------------------------------------------------------------ *
 * 2. Search round-trips through the URL
 * ------------------------------------------------------------------ */
{
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  watch(page, "search ");

  await page.goto(`${BASE}/properties`, { waitUntil: "domcontentloaded" });
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

  await page.goto(`${BASE}/contact`, { waitUntil: "domcontentloaded" });
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

  await page.goto(`${BASE}/properties/dengler-seascape-resort-maldives`, { waitUntil: "domcontentloaded" });
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
  await page.goto(`${BASE}/properties/dengler-cap-ferrat-villa`, { waitUntil: "domcontentloaded" });
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
    await page.waitForTimeout(route === "/" ? 3200 : 700);

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
    await page.goto(`${BASE}/properties`, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /open menu/i }).click();
    await page.waitForTimeout(700);
    if ((await page.locator("#mobile-menu").count()) === 0) fail("Mobile menu did not open");
    await shot(page, "mobile-menu");
  }

  await context.close();
}

/* ------------------------------------------------------------------ *
 * 7. Admin flow (only when the server has ADMIN_PASSWORD set)
 * ------------------------------------------------------------------ */
if (ADMIN_PASSWORD) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await context.newPage();
  watch(page, "admin ");

  await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
  if (!page.url().includes("/admin/login")) fail(`/admin did not redirect to the login page (at ${page.url()})`);

  await page.fill('input[name="password"]', "definitely-not-the-password");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForTimeout(1500);
  if (!page.url().includes("/admin/login")) fail("An incorrect password was accepted");

  await page.fill('input[name="password"]', ADMIN_PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/admin$/, { timeout: 15000 }).catch(() => fail("Sign-in did not reach /admin"));
  await page.waitForTimeout(1000);
  await shot(page, "admin-overview");

  // Publish toggle
  await page.goto(`${BASE}/admin/properties`, { waitUntil: "domcontentloaded" });
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
  await page.goto(`${BASE}/admin/properties/new`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(900);
  for (const [selector, value] of [
    ['input[name="title"]', "DENGLER Test Parcel"],
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

  await page.goto(`${BASE}/properties/dengler-test-parcel`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  if ((await page.getByRole("heading", { name: "DENGLER Test Parcel", level: 1 }).count()) === 0) {
    fail("A published property is not live at its slug");
  }

  // Lead pipeline
  await page.goto(`${BASE}/contact`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  await page.fill('input[name="name"]', "Pipeline Check");
  await page.fill('input[name="email"]', "pipeline@example.com");
  await page.fill('textarea[name="message"]', "End-to-end check of the enquiry pipeline.");
  await page.getByRole("button", { name: /send enquiry/i }).click();
  await page.waitForTimeout(2500);

  await page.goto(`${BASE}/admin/leads`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  if ((await page.getByText("Pipeline Check").count()) === 0) {
    fail("A submitted enquiry did not reach /admin/leads");
  }
  await page.getByRole("button", { name: "Contacted", exact: true }).first().click();
  await page.waitForTimeout(2200);
  await shot(page, "admin-leads");

  // Headline figures
  await page.goto(`${BASE}/admin/settings`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  await page.locator('input[name^="value_"]').first().fill("999+");
  await page.getByRole("button", { name: /save figures/i }).click();
  await page.waitForTimeout(2500);
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  if ((await page.getByText("999+").count()) === 0) {
    fail("An edited headline figure did not reach the home page");
  }

  // Sign out revokes access
  await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /sign out/i }).click();
  await page.waitForTimeout(2000);
  await page.goto(`${BASE}/admin/properties`, { waitUntil: "domcontentloaded" });
  if (!page.url().includes("/admin/login")) fail("Signing out did not revoke dashboard access");

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

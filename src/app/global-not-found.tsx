import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";

import "@/styles/globals.css";

/**
 * The 404 for a URL that matched no locale at all (`/nonsense/page`).
 *
 * It renders its own `<html>` because it sits outside the `[locale]` tree and
 * so has no layout above it — which also means it cannot know a language.
 * Rather than guess, it says it in both, and offers a door into each site.
 */
const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-display-latin",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans-latin",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Page not found · DENGLER",
  robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="en" dir="ltr" className={`${display.variable} ${sans.variable}`}>
      <body>
        <main className="grid min-h-screen place-items-center bg-paper px-5 text-center">
          <div>
            <p className="eyebrow">404</p>
            <p className="mt-6 font-display text-[3rem] leading-none tracking-[0.3em] text-ink">
              DENGLER
            </p>

            <p className="mt-10 font-display text-3xl text-ink">
              This page could not be found.
            </p>
            <p className="mt-2 font-display text-3xl text-ink" lang="ar" dir="rtl">
              تعذّر العثور على هذه الصفحة.
            </p>

            {/* Plain anchors, not <Link>: this page renders its own document
                outside the app tree, so there is no router to push to — and a
                full load is what actually enters the chosen language tree.
                eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <div className="mt-12 flex flex-col justify-center gap-3 sm:flex-row">
              {/* eslint-disable @next/next/no-html-link-for-pages */}
              <a href="/en" className="btn btn-solid">
                Continue in English
              </a>
              <a href="/ar" className="btn btn-outline" lang="ar">
                المتابعة بالعربية
              </a>
              {/* eslint-enable @next/next/no-html-link-for-pages */}
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}

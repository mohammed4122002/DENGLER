import type { Metadata } from "next";
import { Tajawal } from "next/font/google";

import { Logomark } from "@/components/site/Logomark";
import "@/styles/globals.css";

/**
 * The 404 for a URL that matched no locale at all (`/nonsense/page`).
 *
 * It renders its own `<html>` because it sits outside the `[locale]` tree and
 * so has no layout above it — which also means it cannot know a language.
 * Rather than guess, it says it in both, and offers a door into each site.
 */
/* This page is outside the `[locale]` tree, so it declares the typeface
   itself. One family covers both of the languages it greets you in. */
const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Page not found · Crete Roots",
  robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="en" dir="ltr" className={tajawal.variable}>
      <body>
        <main className="grid min-h-screen place-items-center bg-paper px-5 text-center">
          <div>
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-[14px] bg-ink text-white">
              <Logomark size={34} title="Crete Roots Company" />
            </span>
            <p className="mt-6 font-display text-[1.75rem] font-extrabold tracking-[0.02em] text-ink">
              CRETE<span className="text-gold">ROOTS</span>
            </p>
            <p className="eyebrow mt-3">404</p>

            <p className="mt-10 font-display text-2xl font-bold text-ink">
              This page could not be found.
            </p>
            <p className="mt-2 font-display text-2xl font-bold text-ink" lang="ar" dir="rtl">
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

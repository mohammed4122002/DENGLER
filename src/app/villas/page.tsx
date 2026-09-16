import type { Metadata } from "next";

import { CategoryPage } from "@/components/property/CategoryPage";
import { photo } from "@/lib/data/images";
import type { SearchParams } from "@/lib/query";

export const metadata: Metadata = {
  title: "Villas",
  description:
    "Architect-led villas for sale and investment across the Gulf, the Mediterranean and the Indian Ocean — with yields, occupancy and appreciation published on every listing.",
  alternates: { canonical: "/villas" },
};

export default function VillasPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <CategoryPage
      type="villa"
      eyebrow="01 — Villas"
      title={
        <>
          Houses built to be
          <br />
          <span className="italic text-gold-soft">lived in and held.</span>
        </>
      }
      lead="Private residences where the architecture is the asset. Each one is checked for title, built area and running cost before it reaches this page."
      image={photo("villaGlassPool", 2000)}
      notes={[
        {
          heading: "Architecture first",
          body: "We list houses by practices with a body of work, not developer product with a marketing name attached. Every listing names the year of completion and the last major works.",
        },
        {
          heading: "Held, not flipped",
          body: "Most buyers here hold for seven years or more. The figures we publish — yield, occupancy, appreciation — are framed for that horizon rather than a quick resale.",
        },
        {
          heading: "Usable as well as investable",
          body: "A villa that cannot be lived in comfortably is a poor investment whatever the spreadsheet says. Orientation, shade and running costs are part of every assessment.",
        },
      ]}
      searchParams={searchParams}
    />
  );
}

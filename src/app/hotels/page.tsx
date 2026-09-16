import type { Metadata } from "next";

import { CategoryPage } from "@/components/property/CategoryPage";
import { photo } from "@/lib/data/images";
import type { SearchParams } from "@/lib/query";

export const metadata: Metadata = {
  title: "Hotels",
  description:
    "Trading hotels and consented hospitality conversions for investment — sold with the operator, the accounts and the forward booking book in place.",
  alternates: { canonical: "/hotels" },
};

export default function HotelsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <CategoryPage
      type="hotel"
      eyebrow="02 — Hotels"
      title={
        <>
          Hospitality assets that
          <br />
          <span className="italic text-gold-soft">already trade.</span>
        </>
      }
      lead="Operating hotels and consented conversions, offered with management in place. Occupancy, rate and revenue are disclosed at listing, not at exclusivity."
      image={photo("hotelResortPool", 2000)}
      notes={[
        {
          heading: "Accounts on the table",
          body: "Three seasons of trading history are assembled before a hotel is listed. Where a property is pre-opening or ramping, we say so rather than showing a stabilised projection.",
        },
        {
          heading: "The operator matters",
          body: "A hotel is a business. Every listing states whether the management contract, the team and the direct booking book transfer with the sale.",
        },
        {
          heading: "Capex already cycled",
          body: "We note the last full refurbishment on every asset, because a hotel sold just before its capex cycle is a different investment from one sold just after.",
        },
      ]}
      searchParams={searchParams}
    />
  );
}

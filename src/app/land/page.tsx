import type { Metadata } from "next";

import { CategoryPage } from "@/components/property/CategoryPage";
import { photo } from "@/lib/data/images";
import type { SearchParams } from "@/lib/query";

export const metadata: Metadata = {
  title: "Land",
  description:
    "Development land and freehold parcels where the scarcity is structural — zoning, consent, water rights or frontage that cannot be recreated.",
  alternates: { canonical: "/land" },
};

export default function LandPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <CategoryPage
      type="land"
      eyebrow="03 — Land"
      title={
        <>
          Ground where the
          <br />
          <span className="italic text-gold-soft">constraint is the value.</span>
        </>
      }
      lead="Parcels selected for what cannot be replicated next door: a granted consent, registered water rights, protected frontage, or an island that is simply finished."
      image={photo("landCoastalPlot", 2000)}
      notes={[
        {
          heading: "Consent status, stated plainly",
          body: "Granted, applied for, or absent — each listing says which. A parcel priced on a hoped-for rezoning is priced on current zoning here, and labelled as an option.",
        },
        {
          heading: "Servicing is disclosed",
          body: "Road, power, water and drainage to the boundary are confirmed before listing. Off-grid parcels are listed as off-grid, with the intended servicing route named.",
        },
        {
          heading: "Scarcity you can point at",
          body: "Height caps, dune set-backs, reef protection, dark-sky designations. We list the specific mechanism that limits supply around the parcel, not a general growth story.",
        },
      ]}
      searchParams={searchParams}
    />
  );
}

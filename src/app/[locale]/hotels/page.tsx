import type { Metadata } from "next";

import { CategoryPage } from "@/components/property/CategoryPage";
import { photo } from "@/lib/data/images";
import type { SearchParams } from "@/lib/query";
import { buildAlternates, getDictionary, isLocale } from "@/lib/i18n/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const t = getDictionary(raw);

  return {
    title: t.nav.hotels,
    description: t.hotelsPage.lead,
    ...buildAlternates(raw, "/hotels"),
  };
}

export default function HotelPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  return (
    <CategoryPage
      type="hotel"
      image={photo("hotelResortPool", 2000)}
      params={params}
      searchParams={searchParams}
    />
  );
}

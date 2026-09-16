/** Single source of truth for brand copy, navigation and contact details. */

import { publicEnv } from "@/lib/env";

export const SITE = {
  name: "DENGLER",
  tagline: "Premium Real Estate & Investment",
  description:
    "DENGLER curates exceptional villas, hotels and land opportunities for investors — with the returns, yields and development potential stated up front.",
  url: publicEnv.siteUrl,
  email: "invest@dengler.example",
  phone: "+971 4 000 0000",
  address: "Dubai · Zurich · Lisbon",
  social: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "LinkedIn", href: "https://linkedin.com" },
    { label: "X", href: "https://x.com" },
  ],
} as const;

export const NAV_LINKS = [
  { label: "Properties", href: "/properties" },
  { label: "Villas", href: "/villas" },
  { label: "Hotels", href: "/hotels" },
  { label: "Land", href: "/land" },
  { label: "Investments", href: "/investments" },
  { label: "About", href: "/about" },
] as const;

export const FOOTER_LEGAL = [
  { label: "Privacy", href: "/legal/privacy" },
  { label: "Terms", href: "/legal/terms" },
  { label: "Disclosures", href: "/legal/disclosures" },
] as const;

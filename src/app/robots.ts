import type { MetadataRoute } from "next";

import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The dashboard has no business in an index — in either language.
        disallow: ["/*/admin", "/*/admin/", "/api/"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}

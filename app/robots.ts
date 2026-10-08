import type { MetadataRoute } from "next";
import { TRUSTIT_SITE_URL } from "@/lib/public-discovery-seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin", "/businesses", "/business-categories", "/merchant", "/merchants", "/login", "/register",
        "/payments", "/analytics", "/qr-codes", "/api/",
      ],
    }],
    sitemap: `${TRUSTIT_SITE_URL}/sitemap.xml`,
  };
}

import type { Metadata } from "next";
import type { DiscoveryBusiness } from "@/lib/public-discovery-domain";

export const TRUSTIT_SITE_URL = "https://trustitreview.com";
export const discoveryTitle = (slug: string) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");

export const publicUrl = (path: string) => new URL(path, TRUSTIT_SITE_URL).toString();

export const BAHRAICH_SEO_KEYWORDS = [
  "Trustit Bahraich",
  "Trustit Review",
  "Trustit Food",
  "Trustit Medical",
  "Trustit Ration",
  "Trustit Review Service",
  "Trustit Business QR",
  "Trustit Milk Delivery Bahraich",
  "Trustit Grocery Online Bahraich",
  "Trustit Salon Booking Bahraich",
  "Trustit Car Wash Bahraich",
  "Online Food Delivery Bahraich Trustit",
  "Google Review Standee Provider Bahraich",
  "Local Stores Home Delivery Bahraich",
  "Trustit Merchant Registration Bahraich",
  "Trustit Rider Partner Bahraich",
  "Buy Acrylic QR Standee Bahraich",
];

export function discoveryMetadata(input: {
  title: string;
  description: string;
  canonicalPath: string;
  keywords?: string[];
}): Metadata {
  const canonical = publicUrl(input.canonicalPath);
  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords ?? BAHRAICH_SEO_KEYWORDS,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title: input.title,
      description: input.description,
      siteName: "Trustit",
    },
    twitter: { card: "summary", title: input.title, description: input.description },
  };
}

export function categoryListingSchema(input: {
  cityName: string;
  categoryName: string;
  canonicalPath: string;
  businesses: DiscoveryBusiness[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${input.categoryName} in ${input.cityName} - Trustit`,
    description: `Directory of top rated ${input.categoryName} in ${input.cityName} verified by Trustit and Google Reviews.`,
    url: publicUrl(input.canonicalPath),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: input.businesses.slice(0, 10).map((biz, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "LocalBusiness",
          name: biz.name,
          address: {
            "@type": "PostalAddress",
            addressLocality: input.cityName,
            addressRegion: "Uttar Pradesh",
            addressCountry: "IN",
          },
        },
      })),
    },
  };
}

export function businessAddressSchema(business: DiscoveryBusiness, canonicalPath: string) {
  const address = [
    business.address,
    business.locality,
    business.city,
    business.district,
    business.state,
    business.pincode,
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    disambiguatingDescription: business.type,
    url: publicUrl(canonicalPath),
    ...(address.length
      ? {
          address: {
            "@type": "PostalAddress",
            ...(business.address ? { streetAddress: business.address } : {}),
            ...(business.locality || business.city
              ? { addressLocality: [business.locality, business.city].filter(Boolean).join(", ") }
              : {}),
            ...(business.state ? { addressRegion: business.state } : {}),
            ...(business.pincode ? { postalCode: business.pincode } : {}),
            addressCountry: "IN",
          },
        }
      : {}),
    ...(business.latitude !== null && business.longitude !== null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: business.latitude,
            longitude: business.longitude,
          },
        }
      : {}),
  };
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

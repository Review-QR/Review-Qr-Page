import type { Metadata } from "next";
import type { DiscoveryBusiness } from "@/lib/public-discovery-domain";

export const TRUSTIT_SITE_URL = "https://review-qr-page.vercel.app";
export const discoveryTitle = (slug: string) => slug.split("-").filter(Boolean).map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");
export const publicUrl = (path: string) => new URL(path, TRUSTIT_SITE_URL).toString();

export function discoveryMetadata(input: {
  title: string;
  description: string;
  canonicalPath: string;
}): Metadata {
  const canonical = publicUrl(input.canonicalPath);
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical },
    openGraph: { type: "website", url: canonical, title: input.title, description: input.description, siteName: "Trustit" },
    twitter: { card: "summary", title: input.title, description: input.description },
  };
}

export function businessAddressSchema(business: DiscoveryBusiness, canonicalPath: string) {
  const address = [business.address, business.locality, business.city, business.district, business.state, business.pincode].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    disambiguatingDescription: business.type,
    url: publicUrl(canonicalPath),
    ...(address.length ? { address: {
      "@type": "PostalAddress",
      ...(business.address ? { streetAddress: business.address } : {}),
      ...(business.locality || business.city ? { addressLocality: [business.locality, business.city].filter(Boolean).join(", ") } : {}),
      ...(business.state ? { addressRegion: business.state } : {}),
      ...(business.pincode ? { postalCode: business.pincode } : {}),
      addressCountry: "IN",
    } } : {}),
    ...(business.latitude !== null && business.longitude !== null ? { geo: {
      "@type": "GeoCoordinates", latitude: business.latitude, longitude: business.longitude,
    } } : {}),
  };
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

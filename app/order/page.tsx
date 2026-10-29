import type { Metadata } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import CustomerSuperAppClient, {
  type SuperAppBusiness,
  type SuperAppCatalogItem,
} from "./order-portal-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trustit | Trusted Food & Fastest Home Delivery in Bahraich",
  description:
    "Order trusted food, sweets, biryani, groceries & essentials with fast doorstep delivery in Bahraich. Cash on Delivery & online payment available on Trustit Super-App.",
  keywords: [
    "Trusted Food",
    "Trusted Home Delivery",
    "Trusted Order",
    "Trustit Food Delivery",
    "Food Delivery Bahraich",
    "Online Food Order Bahraich",
    "Fast Home Delivery Bahraich",
    "Pure Veg Food Delivery Bahraich",
    "Best Biryani Delivery Bahraich",
    "Sweets Delivery Bahraich",
    "Trustit Super App Bahraich",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: "https://trustitreview.com/order" },
  openGraph: {
    type: "website",
    url: "https://trustitreview.com/order",
    title: "Trustit | Trusted Food & Fastest Home Delivery in Bahraich",
    description:
      "Order trusted food, sweets, biryani, groceries & essentials with fast doorstep delivery in Bahraich.",
    siteName: "Trustit",
  },
  manifest: "/api/manifest/customer",
  appleWebApp: {
    capable: true,
    title: "Trustit",
    statusBarStyle: "default",
  },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function CustomerOrderPortalPage({
  searchParams,
}: {
  searchParams?: SearchParams;
} = {}) {
  const query = searchParams ? await searchParams : {};
  const qVal = query.q || query.dish || query.search;
  const storeVal = query.store || query.restaurant || query.cafe;
  const initialSearchQuery = typeof qVal === "string" ? qVal.trim() : Array.isArray(qVal) ? qVal[0] ?? "" : "";
  const initialStoreName = typeof storeVal === "string" ? storeVal.trim() : Array.isArray(storeVal) ? storeVal[0] ?? "" : "";

  const admin = createSupabaseAdminClient();

  // 1. Fetch active businesses across all 4 super-app verticals
  const { data: rawBusinesses } = await admin
    .from("businesses")
    .select("id, name, city, type, address, phone, location_latitude, location_longitude")
    .is("deleted_at", null)
    .order("name", { ascending: true });

  const businesses: SuperAppBusiness[] = (rawBusinesses || []).map((b) => ({
    id: b.id,
    name: b.name,
    city: b.city || "Bahraich",
    type: b.type || "Retail",
    address: b.address,
    phone: b.phone,
    location_latitude: b.location_latitude,
    location_longitude: b.location_longitude,
  }));

  // 2. Fetch catalog items for businesses
  const { data: rawItems } = await admin
    .from("business_catalog_items")
    .select("id, business_id, name, category, price, item_type, is_available, image_url, description")
    .eq("is_available", true);

  const catalogItems: SuperAppCatalogItem[] = (rawItems || []).map((i) => ({
    id: i.id,
    business_id: i.business_id,
    name: i.name,
    category: i.category || "General",
    price: Number(i.price),
    item_type: i.item_type || "veg",
    is_available: Boolean(i.is_available),
    image_url: i.image_url,
    description: i.description,
  }));

  return (
    <CustomerSuperAppClient
      businesses={businesses}
      catalogItems={catalogItems}
      initialSearchQuery={initialSearchQuery}
      initialStoreName={initialStoreName}
    />
  );
}

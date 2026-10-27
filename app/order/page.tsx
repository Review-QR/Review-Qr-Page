import type { Metadata } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import CustomerSuperAppClient, {
  type SuperAppBusiness,
  type SuperAppCatalogItem,
} from "./order-portal-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trustit Super-App | Food Delivery, Salon Queue Token, Car Wash Bay & Kirana Parcha",
  description:
    "Order food & sweets, book live salon digital queue passes, schedule car wash bays, and send handwritten grocery parchas across Bahraich and Uttar Pradesh.",
};

export default async function CustomerOrderPortalPage() {
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
    <CustomerSuperAppClient businesses={businesses} catalogItems={catalogItems} />
  );
}

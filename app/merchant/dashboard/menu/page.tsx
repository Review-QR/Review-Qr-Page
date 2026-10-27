import { requireActiveMerchant } from "@/lib/merchant-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import MenuManager, { type MenuItem } from "./menu-manager";

export const dynamic = "force-dynamic";

export default async function MerchantMenuPage() {
  const merchant = await requireActiveMerchant();
  const client = createSupabaseAdminClient();

  const { data, error } = await client
    .from("business_catalog_items")
    .select("id, business_id, name, category, price, unit, item_type, image_url, description, is_available")
    .eq("business_id", merchant.businessId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load catalog items for merchant:", error);
  }

  const items: MenuItem[] = (data ?? []).map((row) => ({
    id: String(row.id),
    businessId: String(row.business_id),
    name: String(row.name ?? ""),
    category: String(row.category ?? "General"),
    price: Number(row.price) || 0,
    unit: row.unit ? String(row.unit) : null,
    itemType: (row.item_type as MenuItem["itemType"]) ?? "veg",
    imageUrl: row.image_url ? String(row.image_url) : null,
    description: row.description ? String(row.description) : null,
    isAvailable: row.is_available === true,
  }));

  return (
    <div className="space-y-6">
      <MenuManager initialItems={items} businessName={merchant.businessName} />
    </div>
  );
}

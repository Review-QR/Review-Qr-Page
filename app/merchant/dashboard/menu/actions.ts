"use server";

import { requireActiveMerchant } from "@/lib/merchant-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

export type CatalogItemInput = {
  id?: string;
  name: string;
  category: string;
  price: number;
  unit?: string | null;
  itemType: "veg" | "non_veg" | "egg" | "service" | "product";
  imageUrl?: string | null;
  description?: string | null;
  isAvailable?: boolean;
};

export type ActionResponse = {
  success: boolean;
  message?: string;
  item?: Record<string, unknown>;
};

export async function saveCatalogItemAction(input: CatalogItemInput): Promise<ActionResponse> {
  const merchant = await requireActiveMerchant();
  const name = input.name?.trim();
  const category = input.category?.trim() || "General";
  const price = Number(input.price);

  if (!name || name.length > 160) {
    return { success: false, message: "Item name must be between 1 and 160 characters." };
  }
  if (!Number.isFinite(price) || price < 0) {
    return { success: false, message: "Price must be a valid non-negative number." };
  }
  if (category.length > 80) {
    return { success: false, message: "Category name must be at most 80 characters." };
  }

  const validTypes = ["veg", "non_veg", "egg", "service", "product"] as const;
  const itemType = validTypes.includes(input.itemType) ? input.itemType : "veg";

  const client = createSupabaseAdminClient();

  if (input.id) {
    // Update existing item
    const { data, error } = await client
      .from("business_catalog_items")
      .update({
        name,
        category,
        price,
        unit: input.unit?.trim() || null,
        item_type: itemType,
        description: input.description?.trim() || null,
        image_url: input.imageUrl?.trim() || null,
        is_available: input.isAvailable !== undefined ? Boolean(input.isAvailable) : true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.id)
      .eq("business_id", merchant.businessId)
      .select()
      .single();

    if (error) {
      console.error("Failed to update catalog item:", error);
      return { success: false, message: "Failed to update item. Please try again." };
    }

    revalidatePath("/merchant/dashboard/menu");
    return { success: true, message: "Item updated successfully!", item: data };
  } else {
    // Insert new item
    const { data, error } = await client
      .from("business_catalog_items")
      .insert({
        business_id: merchant.businessId,
        name,
        category,
        price,
        unit: input.unit?.trim() || null,
        item_type: itemType,
        description: input.description?.trim() || null,
        image_url: input.imageUrl?.trim() || null,
        is_available: input.isAvailable !== undefined ? Boolean(input.isAvailable) : true,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to add catalog item:", error);
      return { success: false, message: "Failed to add item. Please try again." };
    }

    revalidatePath("/merchant/dashboard/menu");
    return { success: true, message: "Item added to menu successfully!", item: data };
  }
}

export async function deleteCatalogItemAction(id: string): Promise<ActionResponse> {
  const merchant = await requireActiveMerchant();
  if (!id) return { success: false, message: "Item ID is required." };

  const client = createSupabaseAdminClient();
  const { error } = await client
    .from("business_catalog_items")
    .delete()
    .eq("id", id)
    .eq("business_id", merchant.businessId);

  if (error) {
    console.error("Failed to delete catalog item:", error);
    return { success: false, message: "Failed to delete item." };
  }

  revalidatePath("/merchant/dashboard/menu");
  return { success: true, message: "Item deleted successfully." };
}

export async function toggleItemAvailabilityAction(
  id: string,
  isAvailable: boolean
): Promise<ActionResponse> {
  const merchant = await requireActiveMerchant();
  if (!id) return { success: false, message: "Item ID is required." };

  const client = createSupabaseAdminClient();
  const { error } = await client
    .from("business_catalog_items")
    .update({
      is_available: Boolean(isAvailable),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("business_id", merchant.businessId);

  if (error) {
    console.error("Failed to toggle item availability:", error);
    return { success: false, message: "Failed to update item availability." };
  }

  revalidatePath("/merchant/dashboard/menu");
  return { success: true };
}

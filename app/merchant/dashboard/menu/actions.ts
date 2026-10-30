"use server";

import { requireActiveMerchant } from "@/lib/merchant-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";
import { getMasterCatalogForCategory } from "@/lib/hyperlocal/master-catalog-templates";

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

export async function seedCategoryTemplatesAction(): Promise<ActionResponse & { insertedCount?: number }> {
  const merchant = await requireActiveMerchant();
  const client = createSupabaseAdminClient();

  const { data: biz } = await client
    .from("businesses")
    .select("type")
    .eq("id", merchant.businessId)
    .maybeSingle();

  const templateItems = getMasterCatalogForCategory(biz?.type || "");
  if (!templateItems.length) {
    return { success: false, message: "No standard templates available for this business category." };
  }

  const { data: existing } = await client
    .from("business_catalog_items")
    .select("name")
    .eq("business_id", merchant.businessId);

  const existingNames = new Set((existing || []).map((e) => e.name));
  const toInsert = templateItems
    .filter((item) => !existingNames.has(item.name))
    .map((item) => ({
      business_id: merchant.businessId,
      name: item.name,
      category: item.category,
      price: item.defaultPrice || 0,
      unit: item.unit,
      item_type: item.itemType,
      description: item.description,
      is_available: false, // Draft until merchant enters rate!
    }));

  if (toInsert.length > 0) {
    const { error } = await client.from("business_catalog_items").insert(toInsert);
    if (error) {
      console.error("Failed to seed master templates:", error);
      return { success: false, message: "Failed to load templates." };
    }
  }

  revalidatePath("/merchant/dashboard/menu");
  return {
    success: true,
    message: toInsert.length > 0 ? `Loaded ${toInsert.length} standard items to your catalog!` : "All standard items already exist in your catalog.",
    insertedCount: toInsert.length,
  };
}

export async function quickUpdateRateAction(
  id: string,
  price: number,
  isAvailable: boolean
): Promise<ActionResponse> {
  const merchant = await requireActiveMerchant();
  if (!id) return { success: false, message: "Item ID is required." };

  const parsedPrice = Number(price);
  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    return { success: false, message: "Invalid price." };
  }

  const client = createSupabaseAdminClient();
  const { error } = await client
    .from("business_catalog_items")
    .update({
      price: parsedPrice,
      is_available: Boolean(isAvailable),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("business_id", merchant.businessId);

  if (error) {
    return { success: false, message: "Failed to update rate." };
  }

  revalidatePath("/merchant/dashboard/menu");
  return { success: true, message: "Rate updated successfully!" };
}

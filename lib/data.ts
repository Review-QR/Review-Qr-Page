import { supabase } from "./supabase";
import type { Business } from "./types";

export async function getBusinesses(): Promise<Business[]> {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch businesses:", error);
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getBusiness(
  id: string
): Promise<Business | null> {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch business:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function addBusiness(
  business: Business
): Promise<Business> {
  const { data, error } = await supabase
    .from("businesses")
    .insert({
      id: business.id,
      name: business.name,
      owner: business.owner ?? null,
      phone: business.phone ?? null,
      type: business.type ?? null,
      plan: business.plan ?? null,
      status: business.status ?? "pending",
      expiry: business.expiry ?? null,
      scans: business.scans ?? 0,
      qr_status: business.qr_status ?? "inactive",
      qr_type: business.qr_type ?? "review",
      review_link: business.review_link ?? null,
      address: business.address ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to add business:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function updateBusiness(
  id: string,
  updates: Partial<Business>
): Promise<Business> {
  const { data, error } = await supabase
    .from("businesses")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Failed to update business:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function deleteBusiness(
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("businesses")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Failed to delete business:", error);
    throw new Error(error.message);
  }
}

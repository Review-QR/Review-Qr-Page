import { supabase } from "./supabase";
import type { Business } from "./types";

export async function getBusinesses(): Promise<Business[]> {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load businesses.");
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
    throw new Error("Unable to load the business.");
  }

  return data;
}

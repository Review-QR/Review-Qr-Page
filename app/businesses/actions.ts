"use server";

import { randomInt } from "node:crypto";
import { requireActiveAdmin } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { safeReviewLink } from "@/lib/safe-review-link";
import { BUSINESS_TYPES } from "@/lib/business-types";
import type { Business } from "@/lib/types";

type BusinessInput = {
  name?: unknown;
  owner?: unknown;
  phone?: unknown;
  type?: unknown;
  plan?: unknown;
  status?: unknown;
  expiry?: unknown;
  qr_status?: unknown;
  review_link?: unknown;
  address?: unknown;
};

type BusinessResult =
  | { success: true; business?: Business }
  | { success: false; message: string };

const BUSINESS_TYPES_SET = new Set(BUSINESS_TYPES);

const PLANS = new Set(["Basic", "Standard", "Premium"]);
const STATUSES = new Set(["active", "expiring soon", "expired", "suspended"]);
const QR_STATUSES = new Set(["active", "disabled"]);
const BUSINESS_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

function isRecord(value: unknown): value is BusinessInput {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalText(value: unknown, maxLength: number): string | null | undefined {
  if (value === null || value === "") return null;
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length <= maxLength ? normalized || null : undefined;
}

function validExpiry(value: unknown): string | null | undefined {
  const expiry = optionalText(value, 10);
  if (expiry === undefined || expiry === null) return expiry;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expiry)) return undefined;
  const parsed = new Date(`${expiry}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === expiry
    ? expiry
    : undefined;
}

function parseBusiness(input: unknown): Omit<Business, "id"> | null {
  if (!isRecord(input)) return null;

  const name = optionalText(input.name, 160);
  const owner = optionalText(input.owner, 160);
  const phone = optionalText(input.phone, 32);
  const address = optionalText(input.address, 1000);
  const expiry = validExpiry(input.expiry);
  const reviewLink = safeReviewLink(input.review_link);
  if (
    !name ||
    name.length > 160 ||
    owner === undefined ||
    phone === undefined ||
    (phone !== null &&
      (!/^[+\d().\-\s]{5,32}$/.test(phone) ||
        phone.replace(/\D/g, "").length < 5)) ||
    address === undefined ||
    expiry === undefined ||
    !reviewLink ||
    typeof input.type !== "string" || !BUSINESS_TYPES_SET.has(input.type) ||
    typeof input.plan !== "string" || !PLANS.has(input.plan) ||
    typeof input.status !== "string" || !STATUSES.has(input.status) ||
    typeof input.qr_status !== "string" || !QR_STATUSES.has(input.qr_status)
  ) {
    return null;
  }

  return {
    name,
    owner,
    phone,
    address,
    type: input.type,
    plan: input.plan,
    status: input.status,
    expiry,
    qr_status: input.qr_status,
    qr_type: "review",
  };
}

export async function createAdminBusiness(input: unknown): Promise<BusinessResult> {
  await requireActiveAdmin();
  const business = parseBusiness(input);
  if (!business) return { success: false, message: "Check the business details and try again." };

  try {
    const supabase = createSupabaseAdminClient();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const id = `QR-${randomInt(10_000_000, 100_000_000)}`;
      const { data: existing, error: lookupError } = await supabase
        .from("businesses")
        .select("id")
        .eq("id", id)
        .maybeSingle();
      if (lookupError) return { success: false, message: "Business could not be created. Please try again." };
      if (existing) continue;

      const registrationDate = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("businesses")
        .insert({
          ...business,
          id,
          scans: 0,
          qr_type: "review",
          registration_date: registrationDate,
          merchant_status: "pending",
        })
        .select("*")
        .single();
      if (!error && data) return { success: true, business: data as Business };
      if (error?.code !== "23505") break;
    }
  } catch {
    // Keep database and server configuration details out of the client response.
  }
  return { success: false, message: "Business could not be created. Please try again." };
}

export async function updateAdminBusiness(
  idInput: unknown,
  input: unknown,
): Promise<BusinessResult> {
  await requireActiveAdmin();
  if (typeof idInput !== "string" || !BUSINESS_ID_PATTERN.test(idInput)) {
    return { success: false, message: "Business could not be updated. Please try again." };
  }
  const business = parseBusiness(input);
  if (!business) return { success: false, message: "Check the business details and try again." };

  try {
    const { data, error } = await createSupabaseAdminClient()
      .from("businesses")
      .update(business)
      .eq("id", idInput)
      .select("*")
      .maybeSingle();
    if (!error && data) return { success: true, business: data as Business };
  } catch {
    // Keep database and server configuration details out of the client response.
  }
  return { success: false, message: "Business could not be updated. Please try again." };
}

export async function deleteAdminBusiness(idInput: unknown): Promise<BusinessResult> {
  await requireActiveAdmin();
  if (typeof idInput !== "string" || !BUSINESS_ID_PATTERN.test(idInput)) {
    return { success: false, message: "Business could not be deleted. Please try again." };
  }

  try {
    const { data, error } = await createSupabaseAdminClient()
      .from("businesses")
      .delete()
      .eq("id", idInput)
      .select("id")
      .maybeSingle();
    if (!error && data) return { success: true };
  } catch {
    // Keep database and server configuration details out of the client response.
  }
  return { success: false, message: "Business could not be deleted. Please try again." };
}

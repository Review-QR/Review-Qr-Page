import "server-only";

import { createMerchantServerClient } from "@/lib/supabase-merchant-server";

export const trustitBypassMetadataKeys = {
  signup: "trustit_otp_bypass_signup",
  passwordComplete: "trustit_otp_bypass_password_completed",
} as const;

export function isTrustitPhoneOtpBypassEnabled() {
  return process.env.TRUSTIT_SKIP_PHONE_OTP === "true";
}

export function normalizeTrustitPhone(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 32) return null;
  const normalized = value.trim().replace(/[\s()-]/g, "");
  const phone = normalized.startsWith("+") ? normalized : `+91${normalized}`;
  return /^\+[1-9][0-9]{7,14}$/.test(phone) ? phone : null;
}

export function isValidTrustitPassword(password: string, confirmation: string) {
  return password.length >= 12
    && /[A-Za-z]/.test(password)
    && /[0-9]/.test(password)
    && password === confirmation;
}

export async function getTrustitUser() {
  const client = await createMerchantServerClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user || !data.user.phone_confirmed_at) return null;
  if (data.user.app_metadata?.[trustitBypassMetadataKeys.signup] === true
    && data.user.app_metadata?.[trustitBypassMetadataKeys.passwordComplete] !== true) return null;
  return { client, user: data.user };
}

export async function trustitPasswordSetupIsPending() {
  const client = await createMerchantServerClient();
  const { data, error } = await client.auth.getUser();
  return !error
    && Boolean(data.user?.phone_confirmed_at)
    && data.user?.app_metadata?.[trustitBypassMetadataKeys.signup] === true
    && data.user?.app_metadata?.[trustitBypassMetadataKeys.passwordComplete] !== true;
}

export function safeActionError() {
  return { success: false as const, message: "Something went wrong. Please try again." };
}

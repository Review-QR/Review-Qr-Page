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
  const input = value.trim();
  if (!input || /[^0-9+()\s-]/.test(input)) return null;

  let inParentheses = false;
  let parenthesesContainDigit = false;
  for (const character of input) {
    if (character === "(") {
      if (inParentheses) return null;
      inParentheses = true;
      parenthesesContainDigit = false;
    } else if (character === ")") {
      if (!inParentheses || !parenthesesContainDigit) return null;
      inParentheses = false;
    } else if (inParentheses && /[0-9]/.test(character)) {
      parenthesesContainDigit = true;
    }
  }
  if (inParentheses) return null;

  const compact = input.replace(/[\s()-]/g, "");
  if (!/^\+?[0-9]+$/.test(compact)) return null;

  if (compact.startsWith("+")) {
    const digits = compact.slice(1);
    if (!/^[1-9][0-9]{7,14}$/.test(digits)) return null;
    if (digits.startsWith("91") && !/^91[6-9][0-9]{9}$/.test(digits)) return null;
    return `+${digits}`;
  }

  if (/^[6-9][0-9]{9}$/.test(compact)) return `+91${compact}`;
  if (/^91[6-9][0-9]{9}$/.test(compact)) return `+${compact}`;
  return null;
}

export function isValidTrustitPassword(password: string, confirmation: string) {
  return password.length >= 6
    && password.length <= 16
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

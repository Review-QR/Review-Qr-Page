import { randomUUID, randomInt } from "node:crypto";

export const HYPERLOCAL_ORDER_ID_PREFIX = "hord_";
export const HYPERLOCAL_ORDER_ID_PATTERN = /^hord_[a-f0-9]{24,36}$/;
export const HYPERLOCAL_DRAFT_ID_PREFIX = "cdraft_";
export const HYPERLOCAL_DRAFT_ID_PATTERN = /^cdraft_[a-zA-Z0-9_-]{16,42}$/;

/**
 * Generates unique hyperlocal order reference.
 * Example: hord_9b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e
 */
export function generateHyperlocalOrderId(): string {
  const hex = randomUUID().replaceAll("-", "");
  return `${HYPERLOCAL_ORDER_ID_PREFIX}${hex}`;
}

/**
 * Generates unique hyperlocal checkout draft reference for pre-payment holding.
 * Example: cdraft_1712345678_9b1c2d3e4f5a6b7c
 */
export function generateHyperlocalDraftId(): string {
  const hex = randomUUID().replaceAll("-", "").slice(0, 16);
  return `${HYPERLOCAL_DRAFT_ID_PREFIX}${Date.now()}_${hex}`;
}

export function isValidHyperlocalOrderId(orderId: unknown): orderId is string {
  if (typeof orderId !== "string") return false;
  return HYPERLOCAL_ORDER_ID_PATTERN.test(orderId);
}

export function isValidHyperlocalDraftId(draftId: unknown): draftId is string {
  if (typeof draftId !== "string") return false;
  return HYPERLOCAL_DRAFT_ID_PATTERN.test(draftId);
}

export function isValidHyperlocalPaymentReference(ref: unknown): ref is string {
  if (typeof ref !== "string") return false;
  return HYPERLOCAL_ORDER_ID_PATTERN.test(ref) || HYPERLOCAL_DRAFT_ID_PATTERN.test(ref);
}

/**
 * Generates a cryptographically secure 4-digit numeric OTP for delivery handover verification.
 */
export function generateDeliveryOtp(): string {
  return String(randomInt(1000, 10000));
}

/**
 * Formats a clean, readable 4-digit order number (e.g. #4492, #6367) for riders, merchants, and customers.
 * Guaranteed to return a consistent 4-digit number between #1000 and #9999 for any order reference.
 */
export function formatDisplayOrderNumber(orderId: string | null | undefined): string {
  if (!orderId) return "#0000";
  const clean = String(orderId).replace(/^hord_/, "").trim();
  const hexPart = clean.slice(-4);
  const parsed = parseInt(hexPart, 16);
  if (!isNaN(parsed)) {
    const num = 1000 + (parsed % 9000);
    return `#${num}`;
  }
  return `#${clean.slice(-4).toUpperCase()}`;
}

/**
 * Extracts a 3-character capital merchant outlet code from business name.
 * Examples: "Deliciated Cafe" -> "DEL", "Apna Super Bazaar" -> "APN"
 */
export function getOutletCode(businessName?: string | null): string {
  if (!businessName) return "DEL";
  const clean = businessName.trim().replace(/[^a-zA-Z]/g, "").toUpperCase();
  if (clean.length >= 3) return clean.slice(0, 3);
  return (clean + "TR").slice(0, 3);
}

/**
 * Formats a canonical unified order code combining Trustit Brand prefix, outlet code, and 4-digit sequence.
 * Example: #TR-DEL-4492 or #TR-APN-6367
 */
export function formatUnifiedOrderCode(orderId: string | null | undefined, businessName?: string | null): string {
  if (!orderId) return "#TR-0000";
  const num = formatDisplayOrderNumber(orderId).replace("#", "");
  const outlet = getOutletCode(businessName);
  return `#TR-${outlet}-${num}`;
}

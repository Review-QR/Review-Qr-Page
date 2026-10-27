import { randomUUID } from "node:crypto";

export const HYPERLOCAL_ORDER_ID_PREFIX = "hord_";
export const HYPERLOCAL_ORDER_ID_PATTERN = /^hord_[a-f0-9]{24,36}$/;

/**
 * Generates unique hyperlocal order reference.
 * Example: hord_9b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e
 */
export function generateHyperlocalOrderId(): string {
  const hex = randomUUID().replaceAll("-", "");
  return `${HYPERLOCAL_ORDER_ID_PREFIX}${hex}`;
}

export function isValidHyperlocalOrderId(orderId: unknown): orderId is string {
  if (typeof orderId !== "string") return false;
  return HYPERLOCAL_ORDER_ID_PATTERN.test(orderId);
}

/**
 * Generates a 4-digit numeric OTP for delivery handover verification.
 */
export function generateDeliveryOtp(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

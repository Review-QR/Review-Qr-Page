import { randomUUID } from "node:crypto";

export const PRODUCT_ORDER_ID_PREFIX = "tord_";
export const PRODUCT_ORDER_ID_PATTERN = /^tord_[a-f0-9]{24,36}$/;

/**
 * Generates a unique, cryptographically random physical product order ID.
 * Example: tord_3f4a1b2c5d6e7f8a9b0c1d2e3f4a5b6c
 */
export function generateProductOrderId(): string {
  const hex = randomUUID().replaceAll("-", "");
  return `${PRODUCT_ORDER_ID_PREFIX}${hex}`;
}

/**
 * Validates whether an order ID strictly conforms to the product order schema.
 * Rejects subscription order IDs (which start with 'rqr_') and any malformed string.
 */
export function isValidProductOrderId(orderId: unknown): orderId is string {
  if (typeof orderId !== "string") return false;
  return PRODUCT_ORDER_ID_PATTERN.test(orderId);
}

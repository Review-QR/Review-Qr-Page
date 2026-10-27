import { calculateShipping } from "./shipping-calculator.ts";

export interface PricingOrderItemInput {
  unitPrice: number;
  quantity: number;
  category?: string;
}

export interface PricingCalculationInput {
  items: PricingOrderItemInput[];
  pinCode: string;
  discountAmount?: number;
}

export interface PricingCalculationResult {
  subtotalAmount: number;
  shippingAmount: number;
  taxAmount: number; // 18% GST
  discountAmount: number;
  totalAmount: number;
  isFreeShipping: boolean;
  estimatedDays: number;
}

export function roundToTwoDecimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates complete order financials on the server:
 * - Subtotal = sum(unitPrice * quantity)
 * - GST = 18% on Subtotal
 * - Shipping = determined by PIN code & product categories (free if subtotal >= 999)
 * - Total = Subtotal + Tax + Shipping - Discount
 */
export function calculateOrderFinancials(input: PricingCalculationInput): PricingCalculationResult {
  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new Error("Order must contain at least one item.");
  }

  let subtotal = 0;
  let hasBanner = false;
  let hasStandee = false;

  for (const item of input.items) {
    if (!Number.isFinite(item.unitPrice) || item.unitPrice < 0) {
      throw new Error(`Invalid unit price: ${item.unitPrice}`);
    }
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error(`Invalid item quantity: ${item.quantity}`);
    }

    subtotal += item.unitPrice * item.quantity;

    if (item.category === "marketing_kit" || item.category === "custom") {
      hasBanner = true;
    } else if (item.category === "standee" || item.category === "display") {
      hasStandee = true;
    }
  }

  const subtotalAmount = roundToTwoDecimals(subtotal);

  // 18% GST on physical goods
  const taxAmount = roundToTwoDecimals(subtotalAmount * 0.18);

  // Shipping calculation
  const shippingResult = calculateShipping({
    pinCode: input.pinCode,
    subtotal: subtotalAmount,
    hasBanner,
    hasStandee,
  });

  const rawDiscount = input.discountAmount ?? 0;
  const discountAmount = roundToTwoDecimals(Math.max(0, Math.min(rawDiscount, subtotalAmount)));

  const totalAmount = roundToTwoDecimals(
    subtotalAmount + taxAmount + shippingResult.shippingAmount - discountAmount,
  );

  return {
    subtotalAmount,
    shippingAmount: shippingResult.shippingAmount,
    taxAmount,
    discountAmount,
    totalAmount,
    isFreeShipping: shippingResult.isFreeShipping,
    estimatedDays: shippingResult.estimatedDays,
  };
}

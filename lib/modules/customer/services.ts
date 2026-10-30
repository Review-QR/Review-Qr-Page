/**
 * Customer Domain Services
 * Business logic for customer super-app actions
 */

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { formatUnifiedOrderCode } from "@/lib/hyperlocal/order-id";
import type { CustomerOrderRequest } from "./types";

/**
 * Places a verified hyperlocal order on behalf of a customer
 */
export async function placeCustomerOrder(input: CustomerOrderRequest) {
  const admin = createSupabaseAdminClient();
  const rawId = `hord_${crypto.randomUUID().replace(/-/g, "").slice(0, 28)}`;
  const deliveryOtp = String(Math.floor(1000 + Math.random() * 9000));

  let subtotal = 0;
  for (const item of input.items) {
    subtotal += item.unitPrice * item.quantity;
    if (item.addons?.length) {
      for (const addon of item.addons) {
        subtotal += addon.price * item.quantity;
      }
    }
  }

  const deliveryFee = subtotal >= 299 ? 0 : 25;
  const platformFee = 5;
  const riderTip = input.riderTip || 0;
  const totalAmount = subtotal + deliveryFee + platformFee + riderTip;

  // Insert master order
  const { error: orderError } = await admin.from("hyperlocal_orders").insert({
    id: rawId,
    business_id: input.businessId,
    customer_id: input.customerId || null,
    customer_name: input.customerName,
    customer_phone: input.customerPhone,
    customer_address: typeof input.customerAddress === "string" ? { address: input.customerAddress } : input.customerAddress,
    order_type: input.orderType,
    status: "placed",
    payment_mode: input.paymentMode,
    payment_status: input.paymentMode === "cod" ? "pending" : "pending",
    subtotal_amount: subtotal,
    delivery_fee: deliveryFee,
    platform_fee: platformFee,
    total_amount: totalAmount,
    delivery_otp: deliveryOtp,
    customer_notes: input.customerNotes || null,
  });

  if (orderError) throw new Error(`Order placement failed: ${orderError.message}`);

  // Insert order line items
  if (input.items?.length) {
    const itemsToInsert = input.items.map((item) => ({
      order_id: rawId,
      item_name: item.name,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.unitPrice * item.quantity,
      is_veg: item.isVeg,
      notes: item.cookingNotes || null,
    }));
    await admin.from("hyperlocal_order_items").insert(itemsToInsert);
  }

  return {
    orderId: rawId,
    displayCode: formatUnifiedOrderCode(rawId, input.businessId),
    deliveryOtp,
    totalAmount,
    subtotal,
    deliveryFee,
  };
}

import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { generateHyperlocalOrderId, generateDeliveryOtp, isValidHyperlocalOrderId } from "./order-id";
import { findNearestAvailableRiders, dispatchCascadingRadar } from "./dispatch-engine";
import { calculatePayoutSplits } from "./split-calculator";
import type {
  HyperlocalOrder,
  HyperlocalOrderItem,
  DeliveryRider,
  CustomerAddress,
  HyperlocalOrderType,
  PaymentMode,
  ServiceTokenSlot,
} from "./types";

export interface CreateHyperlocalOrderInput {
  orderId?: string;
  customerId?: string;
  businessId: string;
  orderType: HyperlocalOrderType;
  customerName: string;
  customerPhone: string;
  customerAddress: CustomerAddress;
  items: Array<{
    item_name: string;
    quantity: number;
    unit_price: number;
    is_veg?: boolean;
    notes?: string;
  }>;
  paymentMode: PaymentMode;
  customerNotes?: string;
}

/**
 * Creates a hyperlocal order, assigns 4-digit OTP, calculates escrow splits,
 * and searches for nearest delivery riders.
 */
export async function createHyperlocalOrder(input: CreateHyperlocalOrderInput) {
  const admin = createSupabaseAdminClient();

  // 1. Fetch business details for shop coordinates
  const { data: business, error: bizError } = await admin
    .from("businesses")
    .select("id, name, city, type, phone, location_latitude, location_longitude, address")
    .eq("id", input.businessId)
    .maybeSingle();

  if (bizError || !business) {
    throw new Error("Business not found.");
  }

  // 2. Calculate order financial subtotal
  let subtotal = 0;
  const lineItems = input.items.map((item) => {
    const qty = Math.max(1, Math.floor(item.quantity));
    const price = Math.max(0, item.unit_price);
    const total = Math.round(qty * price * 100) / 100;
    subtotal += total;
    return {
      item_name: item.item_name,
      quantity: qty,
      unit_price: price,
      total_price: total,
      is_veg: item.is_veg ?? true,
      notes: item.notes || null,
    };
  });

  const isDelivery = input.orderType === "food_delivery" || input.orderType === "grocery_parcha" || input.orderType === "parcel_pickup";
  const deliveryFee = isDelivery ? (subtotal >= 499 ? 0 : 35) : 0;
  const platformFee = 5; // Flat ₹5 platform convenience fee
  const totalAmount = Math.round((subtotal + deliveryFee + platformFee) * 100) / 100;

  const orderId = input.orderId && isValidHyperlocalOrderId(input.orderId)
    ? input.orderId
    : generateHyperlocalOrderId();
  const deliveryOtp = generateDeliveryOtp();

  // Validate customer_id against public.customers table if provided
  let validCustomerId: string | null = null;
  if (input.customerId) {
    const { data: custRow } = await admin
      .from("customers")
      .select("id")
      .eq("id", input.customerId)
      .maybeSingle();
    if (custRow) {
      validCustomerId = custRow.id;
    }
  }

  // 3. Insert order
  const { error: insertOrderError } = await admin
    .from("hyperlocal_orders")
    .insert({
      id: orderId,
      business_id: input.businessId,
      customer_id: validCustomerId,
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      customer_address: input.customerAddress,
      order_type: input.orderType,
      status: "placed",
      payment_mode: input.paymentMode,
      payment_status: input.paymentMode === "cod" ? "pending" : (input.paymentMode === "online_cashfree" ? "pending" : "paid"),
      subtotal_amount: subtotal,
      delivery_fee: deliveryFee,
      platform_fee: platformFee,
      total_amount: totalAmount,
      delivery_otp: deliveryOtp,
      customer_notes: input.customerNotes || null,
    });

  if (insertOrderError) {
    throw new Error(`Failed to place order: ${insertOrderError.message}`);
  }

  // 4. Insert items
  if (lineItems.length > 0) {
    await admin.from("hyperlocal_order_items").insert(
      lineItems.map((item) => ({
        ...item,
        order_id: orderId,
      })),
    );
  }

  // 5. Calculate and insert payout splits
  const split = calculatePayoutSplits({
    orderId,
    merchantId: input.businessId,
    orderType: input.orderType,
    subtotal,
    deliveryFee,
    platformFee,
    paymentMode: input.paymentMode,
  });

  await admin.from("hyperlocal_payout_splits").insert(split);

  // 6. Find nearest online riders if delivery is required
  let nearestRiders: DeliveryRider[] = [];
  if (isDelivery) {
    const { data: riders } = await admin
      .from("delivery_riders")
      .select("*")
      .eq("is_online", true)
      .eq("is_available", true);

    const merchantLat = business.location_latitude || 27.5742;
    const merchantLon = business.location_longitude || 81.5961;

    if (riders && riders.length > 0) {
      nearestRiders = findNearestAvailableRiders(riders as unknown as DeliveryRider[], merchantLat, merchantLon, 5.0);
    }
  }

  return {
    orderId,
    deliveryOtp,
    totalAmount,
    subtotal,
    deliveryFee,
    platformFee,
    nearestRidersCount: nearestRiders.length,
    nearestRiders,
  };
}

/**
 * Merchant marks order as accepted and specifies kitchen prep time.
 */
export async function merchantAcceptOrder(orderId: string, prepTimeMinutes = 20) {
  if (!isValidHyperlocalOrderId(orderId)) throw new Error("Invalid order ID.");

  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();

  const { error } = await admin
    .from("hyperlocal_orders")
    .update({
      status: "accepted_by_merchant",
      merchant_prep_time_minutes: prepTimeMinutes,
      accepted_at: now,
      updated_at: now,
    })
    .eq("id", orderId);

  if (error) throw new Error(error.message);

  // Immediately initiate proximity cascading rider dispatch (Option A: Instant Dispatch on Accept)
  let dispatchResult = null;
  try {
    dispatchResult = await dispatchCascadingRadar(orderId);
  } catch {
    // Non-blocking catch
  }

  return { success: true, prepTimeMinutes, dispatch: dispatchResult };
}

/**
 * Merchant marks food / items as prepared and ready for rider pickup.
 */
export async function merchantMarkFoodReady(orderId: string) {
  if (!isValidHyperlocalOrderId(orderId)) throw new Error("Invalid order ID.");

  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();

  const { error } = await admin
    .from("hyperlocal_orders")
    .update({
      status: "ready_for_pickup",
      ready_at: now,
      updated_at: now,
    })
    .eq("id", orderId);

  if (error) throw new Error(error.message);
  return { success: true };
}

/**
 * Delivery Rider accepts the order assignment.
 */
export async function riderAcceptOrder(orderId: string, riderId: string) {
  if (!isValidHyperlocalOrderId(orderId)) throw new Error("Invalid order ID.");

  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();

  // Assign order to rider
  const { error: orderError } = await admin
    .from("hyperlocal_orders")
    .update({
      rider_id: riderId,
      status: "rider_assigned",
      dispatch_target_rider_id: null,
      dispatch_expires_at: null,
      updated_at: now,
    })
    .eq("id", orderId);

  if (orderError) throw new Error(orderError.message);

  // Mark rider as busy with active order
  await admin
    .from("delivery_riders")
    .update({ is_available: false, updated_at: now })
    .eq("id", riderId);

  // Update split with rider ID
  await admin
    .from("hyperlocal_payout_splits")
    .update({ rider_id: riderId })
    .eq("order_id", orderId);

  return { success: true };
}

/**
 * Delivery Rider verifies customer OTP at doorstep and marks delivery complete.
 */
export async function riderCompleteDeliveryWithOtp(
  orderId: string,
  riderId: string,
  enteredOtp: string,
) {
  if (!isValidHyperlocalOrderId(orderId)) throw new Error("Invalid order ID.");

  const admin = createSupabaseAdminClient();

  const { data: order, error } = await admin
    .from("hyperlocal_orders")
    .select("id, delivery_otp, total_amount, payment_mode, rider_id, status")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) throw new Error("Order not found.");

  if (order.delivery_otp !== enteredOtp.trim()) {
    throw new Error("Invalid 4-digit OTP. Please ask the customer for the correct code.");
  }

  const now = new Date().toISOString();

  // 1. Mark order delivered
  await admin
    .from("hyperlocal_orders")
    .update({
      status: "delivered",
      delivered_at: now,
      updated_at: now,
      payment_status: order.payment_mode === "cod" ? "cod_collected" : "paid",
    })
    .eq("id", orderId);

  // 2. Fetch payout split details
  const { data: split } = await admin
    .from("hyperlocal_payout_splits")
    .select("rider_payout")
    .eq("order_id", orderId)
    .maybeSingle();

  const riderPayout = split?.rider_payout || 35;

  // 3. Update Rider wallet, COD cash handling & performance stats
  const { data: rider } = await admin
    .from("delivery_riders")
    .select("cash_in_hand, wallet_balance, total_deliveries_count, total_earnings")
    .eq("id", riderId)
    .maybeSingle();

  const currentCash = Number(rider?.cash_in_hand || 0);
  const currentWallet = Number(rider?.wallet_balance || 0);
  const currentDeliveries = Number(rider?.total_deliveries_count || 0);
  const currentTotalEarnings = Number(rider?.total_earnings || 0);

  const newCashInHand = order.payment_mode === "cod" ? currentCash + Number(order.total_amount) : currentCash;
  const newWalletBalance = currentWallet + Number(riderPayout);

  await admin
    .from("delivery_riders")
    .update({
      cash_in_hand: newCashInHand,
      wallet_balance: newWalletBalance,
      total_deliveries_count: currentDeliveries + 1,
      total_earnings: currentTotalEarnings + Number(riderPayout),
      is_available: true, // Rider becomes free for next order
      updated_at: now,
    })
    .eq("id", riderId);

  // 4. Mark split settled
  await admin
    .from("hyperlocal_payout_splits")
    .update({
      settlement_status: "settled_split",
      settled_at: now,
    })
    .eq("order_id", orderId);

  return {
    success: true,
    earnedPayout: riderPayout,
    newWalletBalance,
    newCashInHand,
  };
}

/**
 * Books a digital queue token for Salon or slot for Car Wash.
 */
export async function bookDigitalServiceToken(input: {
  businessId: string;
  serviceType: "salon_haircut" | "salon_facial" | "car_foam_wash" | "bike_wash" | "car_interior";
  customerName: string;
  customerPhone: string;
  vehicleOrNotes?: string;
  slotTime?: string;
}) {
  const admin = createSupabaseAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  // Count existing tokens today for token numbering
  const { count } = await admin
    .from("service_tokens_and_slots")
    .select("*", { count: "exact", head: true })
    .eq("business_id", input.businessId)
    .eq("booking_date", today);

  const tokenNumber = (count ?? 0) + 1;
  const estimatedWaitMinutes = tokenNumber <= 2 ? 10 : (tokenNumber - 1) * 20;

  const { data, error } = await admin
    .from("service_tokens_and_slots")
    .insert({
      business_id: input.businessId,
      service_type: input.serviceType,
      token_number: tokenNumber,
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      vehicle_or_notes: input.vehicleOrNotes || null,
      slot_time: input.slotTime || null,
      estimated_wait_minutes: estimatedWaitMinutes,
      status: "waiting",
      booking_date: today,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to book token: ${error?.message}`);
  }

  return {
    tokenNumber,
    estimatedWaitMinutes,
    tokenRecord: data as ServiceTokenSlot,
  };
}

/**
 * Creates a Kirana Handwritten Parcha (Grocery List) order.
 */
export async function createParchaOrder(input: {
  businessId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: CustomerAddress;
  handwrittenText?: string;
  parchaImageUrl?: string;
  customerNotes?: string;
}) {
  const admin = createSupabaseAdminClient();
  const orderId = generateHyperlocalOrderId();
  const deliveryOtp = generateDeliveryOtp();

  const { error: orderError } = await admin.from("hyperlocal_orders").insert({
    id: orderId,
    business_id: input.businessId,
    customer_name: input.customerName,
    customer_phone: input.customerPhone,
    customer_address: input.customerAddress,
    order_type: "grocery_parcha",
    status: "placed",
    payment_mode: "cod",
    payment_status: "pending",
    subtotal_amount: 0,
    delivery_fee: 35,
    platform_fee: 5,
    total_amount: 40,
    delivery_otp: deliveryOtp,
    customer_notes: input.customerNotes || null,
  });

  if (orderError) {
    throw new Error(`Failed to place parcha order: ${orderError.message}`);
  }

  const { data: parcha, error: parchaError } = await admin
    .from("grocery_parcha_orders")
    .insert({
      order_id: orderId,
      handwritten_text: input.handwrittenText || null,
      parcha_image_url: input.parchaImageUrl || null,
    })
    .select()
    .single();

  if (parchaError) {
    throw new Error(`Failed to record parcha details: ${parchaError.message}`);
  }

  return {
    orderId,
    deliveryOtp,
    parcha,
  };
}

/**
 * Kirana merchant receives handwritten parcha, calculates total bill,
 * items, and updates the quote.
 */
export async function updateParchaMerchantQuote(input: {
  orderId: string;
  merchantQuoteAmount: number;
  merchantQuoteItems: Array<{ name: string; quantity: string; price: number }>;
}) {
  const admin = createSupabaseAdminClient();
  const quote = Math.max(0, input.merchantQuoteAmount);
  const deliveryFee = 35;
  const platformFee = 5;
  const totalAmount = quote + deliveryFee + platformFee;

  await admin
    .from("grocery_parcha_orders")
    .update({
      merchant_quote_amount: quote,
      merchant_quote_items: input.merchantQuoteItems,
      updated_at: new Date().toISOString(),
    })
    .eq("order_id", input.orderId);

  await admin
    .from("hyperlocal_orders")
    .update({
      subtotal_amount: quote,
      total_amount: totalAmount,
      status: "merchant_accepted",
      accepted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.orderId);

  return {
    success: true,
    orderId: input.orderId,
    quoteAmount: quote,
    totalAmount,
  };
}

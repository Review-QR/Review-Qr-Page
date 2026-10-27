import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { generateProductOrderId, isValidProductOrderId } from "./order-id";
import { calculateOrderFinancials } from "./pricing-calculator";
import { createCashfreeProductPaymentOrder } from "./cashfree-product-service";
import type {
  ProductOrder,
  ProductOrderItem,
  ShippingAddress,
  ProductOrderStatus,
  ProductOrderShipment,
  ProductQualityCheck,
  ProductOrderComplaint,
  ProductCatalogueItem,
} from "./types";

/**
 * Fetches all active products with their variants for the merchant catalog.
 */
export async function getActiveProductCatalogue(): Promise<ProductCatalogueItem[]> {
  const admin = createSupabaseAdminClient();
  const { data: products, error } = await admin
    .from("qr_products")
    .select(`
      id,
      sku,
      name,
      slug,
      category,
      description,
      image_url,
      base_price,
      is_active,
      stock_policy,
      estimated_dispatch_days,
      print_specifications,
      qr_product_variants (
        id,
        product_id,
        variant_sku,
        variant_name,
        material,
        size,
        finish,
        price,
        stock_quantity,
        is_active
      )
    `)
    .eq("is_active", true)
    .order("base_price", { ascending: true });

  if (error || !products) {
    return [];
  }

  return products.map((p) => ({
    ...p,
    variants: (p.qr_product_variants || []).filter((v: { is_active: boolean }) => v.is_active),
  })) as ProductCatalogueItem[];
}

export interface CreateOrderInput {
  businessId: string;
  merchantUserId?: string | null;
  items: Array<{
    productId: string;
    variantId: string;
    quantity: number;
    personalization: {
      business_name: string;
      category?: string;
      tagline?: string;
      logo_url?: string;
      qr_target_url: string;
      qr_code_identifier?: string;
      template_id?: string;
      approved_preview_svg?: string;
      approved_at: string;
    };
  }>;
  shippingAddress: ShippingAddress;
  merchantNotes?: string;
  returnUrl?: string;
  notifyUrl?: string;
}

/**
 * Creates a physical product order, re-verifies prices strictly on the server,
 * stores immutable personalization snapshots, and generates a Cashfree payment session.
 */
export async function createPhysicalProductOrder(input: CreateOrderInput) {
  if (!input.items || input.items.length === 0) {
    throw new Error("Order must contain at least one product item.");
  }

  const admin = createSupabaseAdminClient();

  // 1. Fetch variant data from database to ensure authoritative prices
  const variantIds = input.items.map((i) => i.variantId);
  const { data: dbVariants, error: variantError } = await admin
    .from("qr_product_variants")
    .select(`
      id,
      product_id,
      variant_sku,
      variant_name,
      price,
      stock_quantity,
      is_active,
      qr_products (
        name,
        category,
        sku
      )
    `)
    .in("id", variantIds)
    .eq("is_active", true);

  if (variantError || !dbVariants || dbVariants.length === 0) {
    throw new Error("Selected product variants are unavailable or inactive.");
  }

  const variantMap = new Map(dbVariants.map((v) => [v.id, v]));

  // Build validated line items with server prices
  const lineItems: ProductOrderItem[] = [];
  const pricingInputs = [];

  for (const item of input.items) {
    const dbVariant = variantMap.get(item.variantId);
    if (!dbVariant) {
      throw new Error(`Variant not found or inactive: ${item.variantId}`);
    }

    const unitPrice = Number(dbVariant.price);
    const quantity = Math.max(1, Math.floor(item.quantity));
    const totalPrice = Math.round(unitPrice * quantity * 100) / 100;
    const productInfo = dbVariant.qr_products as unknown as { name?: string; category?: string; sku?: string };

    lineItems.push({
      product_id: dbVariant.product_id,
      variant_id: dbVariant.id,
      product_title: productInfo?.name || "QR Product",
      variant_title: dbVariant.variant_name,
      sku: dbVariant.variant_sku,
      unit_price: unitPrice,
      quantity,
      total_price: totalPrice,
      personalization: {
        business_name: item.personalization.business_name,
        category: item.personalization.category,
        tagline: item.personalization.tagline,
        logo_url: item.personalization.logo_url,
        qr_target_url: item.personalization.qr_target_url,
        qr_code_identifier: item.personalization.qr_code_identifier,
        template_id: item.personalization.template_id,
        approved_preview_svg: item.personalization.approved_preview_svg,
        approved_at: item.personalization.approved_at || new Date().toISOString(),
      },
    });

    pricingInputs.push({
      unitPrice,
      quantity,
      category: productInfo?.category,
    });
  }

  // 2. Server-side price, tax, and shipping calculation
  const financials = calculateOrderFinancials({
    items: pricingInputs,
    pinCode: input.shippingAddress.pinCode,
  });

  // 3. Generate distinct physical product order ID
  const orderId = generateProductOrderId();

  // 4. Create Cashfree payment order
  const cashfreeResult = await createCashfreeProductPaymentOrder({
    orderId,
    amount: financials.totalAmount,
    businessId: input.businessId,
    customerName: input.shippingAddress.fullName,
    customerPhone: input.shippingAddress.phone,
    returnUrl: input.returnUrl,
    notifyUrl: input.notifyUrl,
  });

  if (!cashfreeResult.success) {
    throw new Error(`Failed to initialize payment gateway: ${cashfreeResult.error}`);
  }

  // 5. Insert order into database
  const { error: insertOrderError } = await admin
    .from("product_orders")
    .insert({
      id: orderId,
      business_id: input.businessId,
      merchant_user_id: input.merchantUserId || null,
      status: "awaiting_payment",
      subtotal_amount: financials.subtotalAmount,
      shipping_amount: financials.shippingAmount,
      tax_amount: financials.taxAmount,
      discount_amount: financials.discountAmount,
      total_amount: financials.totalAmount,
      currency: "INR",
      shipping_address: input.shippingAddress,
      merchant_notes: input.merchantNotes || null,
    });

  if (insertOrderError) {
    throw new Error(`Failed to save order record: ${insertOrderError.message}`);
  }

  // 6. Insert order items
  const itemsToInsert = lineItems.map((li) => ({
    order_id: orderId,
    product_id: li.product_id,
    variant_id: li.variant_id,
    product_title: li.product_title,
    variant_title: li.variant_title,
    sku: li.sku,
    unit_price: li.unit_price,
    quantity: li.quantity,
    total_price: li.total_price,
    personalization: li.personalization,
  }));

  const { error: insertItemsError } = await admin
    .from("product_order_items")
    .insert(itemsToInsert);

  if (insertItemsError) {
    throw new Error(`Failed to save order items: ${insertItemsError.message}`);
  }

  // 7. Insert initial payment record
  await admin.from("product_payments").insert({
    order_id: orderId,
    cashfree_order_id: orderId,
    payment_session_id: cashfreeResult.paymentSessionId,
    amount: financials.totalAmount,
    currency: "INR",
    payment_status: "PENDING",
  });

  // 8. Immutable audit log
  await admin.from("product_order_audit_logs").insert({
    order_id: orderId,
    actor_type: "merchant",
    action: "order_created_and_payment_initialized",
    details: {
      total_amount: financials.totalAmount,
      items_count: lineItems.length,
      cashfree_order_id: orderId,
    },
  });

  return {
    orderId,
    paymentSessionId: cashfreeResult.paymentSessionId,
    totalAmount: financials.totalAmount,
    subtotalAmount: financials.subtotalAmount,
    shippingAmount: financials.shippingAmount,
    taxAmount: financials.taxAmount,
    items: lineItems,
  };
}

/**
 * Retrieves orders for a specific merchant business (Internal vendor costs are stripped).
 */
export async function getMerchantProductOrders(businessId: string): Promise<ProductOrder[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("product_orders")
    .select(`
      id,
      business_id,
      status,
      subtotal_amount,
      shipping_amount,
      tax_amount,
      discount_amount,
      total_amount,
      currency,
      shipping_address,
      merchant_notes,
      created_at,
      updated_at,
      paid_at,
      dispatched_at,
      delivered_at,
      product_order_items (
        id,
        product_title,
        variant_title,
        sku,
        unit_price,
        quantity,
        total_price,
        personalization
      ),
      product_order_shipments (
        id,
        carrier_name,
        tracking_number,
        tracking_url,
        estimated_delivery,
        shipment_status
      ),
      product_order_complaints (
        id,
        reason,
        status,
        created_at
      )
    `)
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((o) => ({
    ...o,
    items: o.product_order_items,
    shipment: o.product_order_shipments?.[0] || null,
  })) as unknown as ProductOrder[];
}

/**
 * Retrieves full order list for admin management with filters and search.
 */
export async function getAdminProductOrders(options: {
  status?: string;
  query?: string;
  limit?: number;
}): Promise<ProductOrder[]> {
  const admin = createSupabaseAdminClient();
  let queryBuilder = admin
    .from("product_orders")
    .select(`
      id,
      business_id,
      status,
      subtotal_amount,
      shipping_amount,
      tax_amount,
      discount_amount,
      total_amount,
      currency,
      shipping_address,
      merchant_notes,
      vendor_id,
      vendor_name,
      vendor_cost,
      internal_notes,
      created_at,
      updated_at,
      paid_at,
      dispatched_at,
      delivered_at,
      businesses (
        name,
        city,
        category,
        phone
      ),
      product_order_items (
        id,
        product_title,
        variant_title,
        sku,
        unit_price,
        quantity,
        total_price,
        personalization
      ),
      product_order_shipments (
        id,
        carrier_name,
        carrier_code,
        tracking_number,
        tracking_url,
        estimated_delivery,
        shipment_status
      ),
      product_quality_checks (
        id,
        inspector_name,
        passed,
        checked_at
      ),
      product_order_complaints (
        id,
        reason,
        status
      )
    `)
    .order("created_at", { ascending: false })
    .limit(options.limit || 50);

  if (options.status && options.status !== "all") {
    queryBuilder = queryBuilder.eq("status", options.status);
  }

  if (options.query) {
    queryBuilder = queryBuilder.ilike("id", `%${options.query}%`);
  }

  const { data, error } = await queryBuilder;
  if (error || !data) {
    return [];
  }

  return data.map((o) => ({
    ...o,
    items: o.product_order_items,
    shipment: o.product_order_shipments?.[0] || null,
    quality_check: o.product_quality_checks?.[0] || null,
  })) as unknown as ProductOrder[];
}

/**
 * Updates order workflow status, vendor details, and internal notes.
 */
export async function updateAdminOrderStatus(input: {
  orderId: string;
  status: ProductOrderStatus;
  vendorId?: string;
  vendorName?: string;
  vendorCost?: number;
  internalNotes?: string;
  actorId?: string;
}) {
  if (!isValidProductOrderId(input.orderId)) {
    throw new Error("Invalid product order ID.");
  }

  const admin = createSupabaseAdminClient();
  const updateData: Record<string, unknown> = {
    status: input.status,
    updated_at: new Date().toISOString(),
  };

  if (input.vendorId !== undefined) updateData.vendor_id = input.vendorId;
  if (input.vendorName !== undefined) updateData.vendor_name = input.vendorName;
  if (input.vendorCost !== undefined) updateData.vendor_cost = input.vendorCost;
  if (input.internalNotes !== undefined) updateData.internal_notes = input.internalNotes;

  const { error } = await admin
    .from("product_orders")
    .update(updateData)
    .eq("id", input.orderId);

  if (error) {
    throw new Error(`Failed to update order status: ${error.message}`);
  }

  await admin.from("product_order_audit_logs").insert({
    order_id: input.orderId,
    actor_type: "admin",
    actor_id: input.actorId || "admin",
    action: `status_changed_to_${input.status}`,
    details: updateData,
  });

  return { success: true };
}

/**
 * Logs Quality Control (QC) check result prior to dispatch.
 */
export async function recordQualityCheck(input: {
  orderId: string;
  inspectorName: string;
  qrScannable: boolean;
  correctDestinationUrl: boolean;
  scannedTargetUrl?: string;
  printQualityGrade: "pass" | "marginal" | "fail";
  materialCheck: boolean;
  packagingCheck: boolean;
  notes?: string;
  actorId?: string;
}) {
  if (!isValidProductOrderId(input.orderId)) {
    throw new Error("Invalid product order ID.");
  }

  const passed =
    input.qrScannable &&
    input.correctDestinationUrl &&
    input.printQualityGrade === "pass" &&
    input.materialCheck &&
    input.packagingCheck;

  const admin = createSupabaseAdminClient();

  const { error } = await admin.from("product_quality_checks").insert({
    order_id: input.orderId,
    inspector_name: input.inspectorName,
    qr_scannable: input.qrScannable,
    correct_destination_url: input.correctDestinationUrl,
    scanned_target_url: input.scannedTargetUrl || null,
    print_quality_grade: input.printQualityGrade,
    material_check: input.materialCheck,
    packaging_check: input.packagingCheck,
    passed,
    notes: input.notes || null,
  });

  if (error) {
    throw new Error(`Failed to record quality check: ${error.message}`);
  }

  // If QC passed, transition order to 'ready_to_ship'
  if (passed) {
    await admin
      .from("product_orders")
      .update({
        status: "ready_to_ship",
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.orderId);
  }

  await admin.from("product_order_audit_logs").insert({
    order_id: input.orderId,
    actor_type: "admin",
    actor_id: input.actorId || input.inspectorName,
    action: passed ? "qc_passed" : "qc_failed",
    details: { passed, inspector: input.inspectorName },
  });

  return { success: true, passed };
}

/**
 * Records courier tracking details and marks order as 'shipped'.
 */
export async function dispatchShipment(input: {
  orderId: string;
  carrierCode: "delhivery" | "bluedart" | "dtdc" | "indiapost" | "shadowfax" | "other";
  carrierName: string;
  trackingNumber: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  actorId?: string;
}) {
  if (!isValidProductOrderId(input.orderId)) {
    throw new Error("Invalid product order ID.");
  }

  const admin = createSupabaseAdminClient();

  // Generate standard tracking URL if not provided
  let trackingUrl = input.trackingUrl;
  if (!trackingUrl) {
    if (input.carrierCode === "delhivery") {
      trackingUrl = `https://www.delhivery.com/track/package/${encodeURIComponent(input.trackingNumber)}`;
    } else if (input.carrierCode === "bluedart") {
      trackingUrl = `https://www.bluedart.com/tracking?numbers=${encodeURIComponent(input.trackingNumber)}`;
    } else if (input.carrierCode === "dtdc") {
      trackingUrl = `https://www.dtdc.in/tracking/shipment-tracking.asp?strCnno=${encodeURIComponent(input.trackingNumber)}`;
    } else if (input.carrierCode === "indiapost") {
      trackingUrl = `https://www.indiapost.gov.in/_layouts/15/dpt.cpt.tracking/trackconsignment.aspx`;
    }
  }

  const { error: shipmentError } = await admin.from("product_order_shipments").insert({
    order_id: input.orderId,
    carrier_code: input.carrierCode,
    carrier_name: input.carrierName,
    tracking_number: input.trackingNumber,
    tracking_url: trackingUrl,
    estimated_delivery: input.estimatedDelivery || null,
    shipment_status: "in_transit",
  });

  if (shipmentError) {
    throw new Error(`Failed to record shipment: ${shipmentError.message}`);
  }

  const dispatchedAt = new Date().toISOString();
  await admin
    .from("product_orders")
    .update({
      status: "shipped",
      dispatched_at: dispatchedAt,
      updated_at: dispatchedAt,
    })
    .eq("id", input.orderId);

  await admin.from("product_order_audit_logs").insert({
    order_id: input.orderId,
    actor_type: "admin",
    actor_id: input.actorId || "admin",
    action: "order_dispatched",
    details: {
      carrier: input.carrierName,
      tracking_number: input.trackingNumber,
      tracking_url: trackingUrl,
    },
  });

  return { success: true, trackingUrl };
}

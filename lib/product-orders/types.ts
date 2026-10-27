export type ProductOrderStatus =
  | "draft"
  | "awaiting_payment"
  | "paid"
  | "confirmed"
  | "in_production"
  | "quality_check"
  | "ready_to_ship"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type ProductCategory =
  | "standee"
  | "sticker"
  | "display"
  | "marketing_kit"
  | "custom";

export interface ProductCatalogueItem {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: ProductCategory;
  description: string;
  image_url: string | null;
  base_price: number;
  is_active: boolean;
  stock_policy: "in_stock" | "made_to_order" | "on_request";
  estimated_dispatch_days: number;
  print_specifications: Record<string, unknown>;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  variant_sku: string;
  variant_name: string;
  material: string;
  size: string;
  finish: string;
  price: number;
  stock_quantity: number;
  is_active: boolean;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pinCode: string;
  landmark?: string;
}

export interface PersonalizationSnapshot {
  business_name: string;
  category?: string;
  tagline?: string;
  logo_url?: string;
  qr_target_url: string;
  qr_code_identifier?: string;
  template_id?: string;
  approved_preview_svg?: string;
  approved_at: string;
}

export interface ProductOrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  variant_id: string;
  product_title: string;
  variant_title: string;
  sku: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  personalization: PersonalizationSnapshot;
}

export interface ProductOrder {
  id: string; // tord_...
  business_id: string;
  merchant_user_id?: string | null;
  status: ProductOrderStatus;
  subtotal_amount: number;
  shipping_amount: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  shipping_address: ShippingAddress;
  merchant_notes?: string | null;
  // Strictly internal fields (hidden from merchants)
  vendor_id?: string | null;
  vendor_name?: string | null;
  vendor_cost?: number | null;
  internal_notes?: string | null;
  created_at: string;
  updated_at: string;
  paid_at?: string | null;
  dispatched_at?: string | null;
  delivered_at?: string | null;
  items?: ProductOrderItem[];
  shipment?: ProductOrderShipment | null;
  quality_check?: ProductQualityCheck | null;
}

export interface ProductPayment {
  id: string;
  order_id: string;
  cashfree_order_id: string;
  cashfree_payment_id?: string | null;
  payment_session_id?: string | null;
  amount: number;
  currency: string;
  payment_status: "PENDING" | "SUCCESS" | "FAILED" | "USER_DROPPED" | "CANCELLED" | "REFUNDED";
  payment_method?: string | null;
  verified_at?: string | null;
  raw_payload?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ProductOrderShipment {
  id: string;
  order_id: string;
  carrier_code: "delhivery" | "bluedart" | "dtdc" | "indiapost" | "shadowfax" | "other";
  carrier_name: string;
  tracking_number: string;
  tracking_url?: string | null;
  shipping_label_url?: string | null;
  estimated_delivery?: string | null;
  actual_delivery?: string | null;
  shipment_status: "label_created" | "picked_up" | "in_transit" | "out_for_delivery" | "delivered" | "returned" | "rto";
  created_at: string;
  updated_at: string;
}

export interface ProductQualityCheck {
  id: string;
  order_id: string;
  inspector_name: string;
  qr_scannable: boolean;
  correct_destination_url: boolean;
  scanned_target_url?: string | null;
  print_quality_grade: "pass" | "marginal" | "fail";
  material_check: boolean;
  packaging_check: boolean;
  passed: boolean;
  notes?: string | null;
  checked_at: string;
}

export interface ProductOrderComplaint {
  id: string;
  order_id: string;
  business_id: string;
  merchant_user_id?: string | null;
  reason: "damaged_in_transit" | "defective_print" | "wrong_item_received" | "qr_scan_failure" | "delayed_delivery" | "other";
  description: string;
  photo_urls: string[];
  status: "open" | "under_review" | "replacement_approved" | "refund_approved" | "rejected" | "resolved";
  admin_notes?: string | null;
  resolution?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductOrderAuditLog {
  id: string;
  order_id: string;
  actor_type: "merchant" | "admin" | "system" | "webhook";
  actor_id?: string | null;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
}

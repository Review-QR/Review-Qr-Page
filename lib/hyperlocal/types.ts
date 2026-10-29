export type HyperlocalOrderType =
  | "food_delivery"
  | "grocery_parcha"
  | "salon_token"
  | "car_wash_slot"
  | "parcel_pickup";

export type HyperlocalOrderStatus =
  | "placed"
  | "accepted_by_merchant"
  | "preparing"
  | "ready_for_pickup"
  | "rider_assigned"
  | "picked_up"
  | "out_for_delivery"
  | "arrived_at_doorstep"
  | "delivered"
  | "completed"
  | "rejected"
  | "cancelled";

export type PaymentMode =
  | "online_cashfree"
  | "cod"
  | "counter_cash"
  | "upi_at_counter";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "cod_collected"
  | "refunded"
  | "failed";

export interface CustomerAddress {
  street: string;
  landmark?: string;
  city: string;
  state?: string;
  pinCode: string;
  latitude?: number;
  longitude?: number;
}

export interface HyperlocalOrderItem {
  id?: string;
  order_id?: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  is_veg?: boolean;
  notes?: string;
}

export interface HyperlocalOrder {
  id: string; // hord_...
  business_id: string;
  customer_id?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_address: CustomerAddress;
  order_type: HyperlocalOrderType;
  status: HyperlocalOrderStatus;
  payment_mode: PaymentMode;
  payment_status: PaymentStatus;
  subtotal_amount: number;
  delivery_fee: number;
  platform_fee: number;
  tax_amount: number;
  total_amount: number;
  delivery_otp: string;
  rider_id?: string | null;
  dispatch_target_rider_id?: string | null;
  dispatch_expires_at?: string | null;
  dispatch_current_radius_meters?: number;
  dispatch_declined_rider_ids?: string[];
  cashfree_order_id?: string | null;
  cashfree_payment_id?: string | null;
  merchant_prep_time_minutes?: number;
  customer_notes?: string | null;
  cancellation_reason?: string | null;
  dispute_status?: "none" | "customer_refused" | "customer_unreachable" | "wrong_address" | "resolved" | null;
  dispute_reported_at?: string | null;
  dispute_notes?: string | null;
  cancelled_by?: string | null;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
  accepted_at?: string | null;
  ready_at?: string | null;
  picked_up_at?: string | null;
  delivered_at?: string | null;
  items?: HyperlocalOrderItem[];
  hyperlocal_order_items?: HyperlocalOrderItem[];
  rider?: DeliveryRider | null;
  delivery_riders?: DeliveryRider | null;
  business?: {
    name: string;
    city: string;
    category?: string;
    address?: string;
    phone?: string;
    latitude?: number;
    longitude?: number;
  } | null;
}

export interface DeliveryRider {
  id: string;
  user_id?: string | null;
  full_name: string;
  phone: string;
  email?: string | null;
  vehicle_type: "bike" | "scooter" | "bicycle" | "electric_bike";
  vehicle_number: string;
  is_online: boolean;
  is_available: boolean;
  current_latitude?: number | null;
  current_longitude?: number | null;
  last_location_updated_at?: string | null;
  cash_in_hand: number;
  wallet_balance: number;
  rating: number;
  is_verified: boolean;
  created_at: string;
  distanceKm?: number;
  // Extended KYC, Payout & Performance Analytics
  profile_image_url?: string | null;
  residential_address?: string | null;
  city?: string;
  pincode?: string;
  driving_license_number?: string | null;
  driving_license_image_url?: string | null;
  bank_account_holder_name?: string | null;
  bank_account_number?: string | null;
  bank_ifsc_code?: string | null;
  bank_name?: string | null;
  upi_id?: string | null;
  aadhaar_masked?: string | null;
  pan_number?: string | null;
  kyc_status?: "pending" | "approved" | "rejected" | "suspended";
  total_deliveries_count?: number;
  total_earnings?: number;
}

export interface ServiceTokenSlot {
  id: string;
  business_id: string;
  order_id?: string | null;
  service_type: "salon_haircut" | "salon_facial" | "car_foam_wash" | "bike_wash" | "car_interior";
  token_number: number;
  customer_name: string;
  customer_phone: string;
  vehicle_or_notes?: string | null;
  status: "waiting" | "in_progress" | "ready_for_pickup" | "completed" | "no_show" | "cancelled";
  slot_time?: string | null;
  estimated_wait_minutes: number;
  chair_or_bay_number?: string | null;
  booking_date: string;
  created_at: string;
}

export interface GroceryParchaOrder {
  id: string;
  order_id: string;
  parcha_image_url?: string | null;
  handwritten_text?: string | null;
  voice_note_url?: string | null;
  merchant_quote_amount?: number | null;
  merchant_quote_items?: Array<{ name: string; qty: string; price: number }>;
  customer_approved: boolean;
  created_at: string;
}

export interface PayoutSplit {
  order_id: string;
  gross_amount: number;
  merchant_id: string;
  merchant_gross: number;
  platform_commission: number;
  merchant_net_payable: number;
  rider_id?: string | null;
  rider_payout: number;
  platform_convenience_fee: number;
  payment_gateway_fee: number;
  settlement_status: "pending" | "settled_split" | "wallet_credited" | "cod_collected" | "disputed";
  settled_at?: string | null;
}

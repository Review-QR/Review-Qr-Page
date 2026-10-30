/**
 * Trustit Customer Domain Types
 * Strict isolation for customer super-app workflows
 */

export interface CustomerProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  isVerified: boolean;
  createdAt: string;
}

export interface CustomerAddress {
  id: string;
  customerId: string;
  label: "Home" | "Work" | "Other";
  street: string;
  landmark: string | null;
  city: string;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
}

export interface CustomerCartItem {
  cartKey: string;
  businessId: string;
  itemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  isVeg: boolean;
  portion: "half" | "full";
  addons: Array<{ id: string; name: string; price: number }>;
  cookingNotes?: string;
}

export interface CustomerOrderRequest {
  businessId: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: CustomerAddress | string;
  orderType: "food_delivery" | "grocery_parcha" | "salon_token" | "car_wash_slot";
  items: CustomerCartItem[];
  paymentMode: "online_cashfree" | "cod";
  customerNotes?: string;
  riderTip?: number;
}

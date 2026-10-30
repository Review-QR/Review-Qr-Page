/**
 * Trustit Merchant Domain Types
 */

export interface MerchantIdentity {
  businessId: string;
  businessName: string;
  businessType: string | null;
  ownerName: string | null;
  plan: string | null;
  merchantStatus: string;
  city: string | null;
  locality: string | null;
  pincode: string | null;
  reviewLink: string | null;
}

export interface MerchantKOTOrder {
  id: string;
  displayCode: string;
  customerName: string;
  customerPhone: string;
  orderType: string;
  status: string;
  items: Array<{ name: string; quantity: number; notes?: string }>;
  totalAmount: number;
  paymentMode: string;
  paymentStatus: string;
  prepTimeMinutes: number;
  createdAt: string;
}

export interface CatalogItemPayload {
  name: string;
  category: string;
  price: number;
  itemType: "veg" | "non_veg" | "egg" | "service" | "product";
  isAvailable: boolean;
  description?: string;
  imageUrl?: string;
}

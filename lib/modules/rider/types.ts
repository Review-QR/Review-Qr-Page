/**
 * Trustit Rider Domain Types
 */

export interface RiderProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  vehicleType: "bike" | "scooter" | "bicycle" | "electric_bike";
  vehicleNumber: string;
  isOnline: boolean;
  isAvailable: boolean;
  isVerified: boolean;
  rating: number;
  walletBalance: number;
  cashInHand: number;
  currentLatitude: number | null;
  currentLongitude: number | null;
}

export interface RiderDeliveryJob {
  orderId: string;
  displayCode: string;
  shopName: string;
  shopAddress: string | null;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  orderType: string;
  totalAmount: number;
  paymentMode: string;
  status: string;
  estimatedTimeMinutes: number;
}

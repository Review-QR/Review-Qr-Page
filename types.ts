export type BusinessStatus =
  | "active"
  | "pending"
  | "suspended"
  | "expired";

export type QRStatus =
  | "active"
  | "inactive"
  | "suspended";

export type QRType =
  | "review"
  | "custom";

export type PaymentStatus =
  | "paid"
  | "pending"
  | "failed"
  | "refunded";

export interface Business {
  id: string;
  name: string;
  owner?: string | null;
  phone?: string | null;
  type?: string | null;
  plan?: string | null;
  status?: BusinessStatus | string | null;
  expiry?: string | null;
  scans?: number | null;
  qr_status?: QRStatus | string | null;
  qr_type?: QRType | string | null;
  review_link?: string | null;
  address?: string | null;
  created?: string | null;
  created_at?: string | null;
}

export interface Payment {
  id: string;
  business_id?: string | null;
  amount: number;
  status: PaymentStatus | string;
  method?: string | null;
  created_at?: string | null;
}

export interface QRCode {
  id: string;
  business_id: string;
  code: string;
  status: QRStatus | string;
  scans: number;
  created_at?: string | null;
}

export interface DashboardStats {
  totalBusinesses: number;
  activeBusinesses: number;
  expiredBusinesses: number;
  totalScans: number;
  totalRevenue: number;
}

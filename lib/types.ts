export type Business = {
  id: string;
  name: string;
  owner?: string | null;
  phone?: string | null;
  type?: string | null;
  plan?: string | null;
  status?: string | null;
  expiry?: string | null;
  scans?: number | null;
  qr_status?: string | null;
  qr_type?: string | null;
  review_link?: string | null;
  address?: string | null;
  created?: string | null;
  created_at?: string | null;
  registration_date?: string | null;
  merchant_status?: string | null;
};

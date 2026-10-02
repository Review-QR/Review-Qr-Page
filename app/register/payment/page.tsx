import { redirect } from "next/navigation";

export default async function RegisterPaymentPage({ searchParams }: { searchParams: Promise<{ order_id?: string | string[] }> }) {
  const params = await searchParams;
  const orderId = typeof params.order_id === "string" && /^rqr_[a-f0-9]{32}$/.test(params.order_id) ? params.order_id : null;
  redirect(orderId ? `/register?order_id=${encodeURIComponent(orderId)}` : "/register");
}

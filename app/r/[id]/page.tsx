import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ScanPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ScanPage({ params }: ScanPageProps) {
  const { id } = await params;

  const { data: business, error } = await supabase
    .from("businesses")
    .select("id, name, qr_status, expiry, review_link")
    .eq("id", id)
    .maybeSingle();

  if (error || !business) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-4 text-5xl">🔍</div>

          <h1 className="text-2xl font-bold text-slate-900">
            QR Not Found
          </h1>

          <p className="mt-3 text-slate-600">
            This QR code does not exist or could not be found.
          </p>
        </div>
      </main>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  const active =
    String(business.qr_status ?? "").toLowerCase() === "active" &&
    (!business.expiry || business.expiry >= today);

  if (!active) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-4 text-5xl">⏸️</div>

          <h1 className="text-

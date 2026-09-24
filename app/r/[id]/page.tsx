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
          <h1 className="text-2xl font-bold text-slate-900">
            QR Temporarily Inactive
          </h1>
          <p className="mt-3 text-slate-600">
            This QR code is currently inactive or its subscription has expired.
          </p>
          <p className="mt-5 text-sm text-slate-400">
            Business: {business.name}
          </p>
        </div>
      </main>
    );
  }

  if (!business.review_link) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-4 text-5xl">⚠️</div>
          <h1 className="text-2xl font-bold text-slate-900">
            Review Link Missing
          </h1>
          <p className="mt-3 text-slate-600">
            The review link for this business has not been configured yet.
          </p>
          <p className="mt-5 text-sm text-slate-400">
            Business: {business.name}
          </p>
        </div>
      </main>
    );
  }

  await supabase.rpc("increment_business_scan", {
    p_business_id: business.id,
  });

  redirect(business.review_link);
}

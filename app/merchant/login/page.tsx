import Link from "next/link";
import MerchantLoginForm from "./merchant-login-form";
import { merchantSignOutAction } from "./actions";
import { getActiveMerchant } from "@/lib/merchant-auth";

export const dynamic = "force-dynamic";

export default async function MerchantLoginPage() {
  const merchant = await getActiveMerchant();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4 sm:p-6">
      <section className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-lg font-black text-white" aria-hidden="true">
            QR
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Review-QR Merchant</p>
          <h1 className="mt-1 text-lg font-bold text-slate-900">
            {merchant ? "Merchant sign-in active" : "Merchant Sign In"}
          </h1>
          {merchant ? (
            <>
              <p className="mt-2 text-xs text-slate-600">
                Signed in to {merchant.businessName} ({merchant.businessId}).
              </p>
              <div className="mt-4 space-y-2">
                <Link
                  href="/merchant/dashboard"
                  className="block w-full rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
                >
                  Open Merchant Dashboard →
                </Link>
                <form action={merchantSignOutAction}>
                  <button className="w-full rounded-xl border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
                    Sign Out
                  </button>
                </form>
              </div>
            </>
          ) : (
            <>
              <p className="mt-1.5 text-xs text-slate-500">Existing merchants can sign in with Business ID; self-registered merchants can use their verified mobile number.</p>
              <MerchantLoginForm />
              <p className="mt-4 text-xs text-slate-600">New Business? <Link href="/register" className="font-semibold text-blue-700 hover:underline">Register here</Link></p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

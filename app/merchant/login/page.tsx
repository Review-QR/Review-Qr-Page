import Link from "next/link";
import MerchantLoginForm from "./merchant-login-form";
import { merchantSignOutAction } from "./actions";
import { getActiveMerchant } from "@/lib/merchant-auth";

export const dynamic = "force-dynamic";

export default async function MerchantLoginPage() {
  const merchant = await getActiveMerchant();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white" aria-hidden="true">
            QR
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Review-QR Merchant</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            {merchant ? "Merchant sign-in active" : "Merchant Sign In"}
          </h1>
          {merchant ? (
            <>
              <p className="mt-3 text-sm text-slate-600">
                Signed in to {merchant.businessName} ({merchant.businessId}).
              </p>
              <div className="mt-6 space-y-3">
                <Link
                  href="/merchant/dashboard"
                  className="block w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700"
                >
                  Open Merchant Dashboard
                </Link>
                <form action={merchantSignOutAction}>
                  <button className="w-full rounded-lg border border-slate-300 px-4 py-3 font-medium text-slate-700 hover:bg-slate-50">
                    Sign Out
                  </button>
                </form>
              </div>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-slate-500">Use the Business ID and password provided by your administrator.</p>
              <MerchantLoginForm />
            </>
          )}
        </div>
      </section>
    </main>
  );
}

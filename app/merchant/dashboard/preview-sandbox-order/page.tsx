import { getActiveMerchant } from "@/lib/merchant-auth";
import { isPreviewOrderOnlyAuthorized } from "@/lib/cashfree-preview-order-only";
import PreviewSandboxOrderButton from "./preview-sandbox-order-button";

export const dynamic = "force-dynamic";

export default async function PreviewSandboxOrderPage() {
  const merchant = await getActiveMerchant();
  const authorized = isPreviewOrderOnlyAuthorized(process.env, merchant?.businessId);

  return (
    <section className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Preview Sandbox only</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Create one test order without checkout</h1>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        This creates or retrieves one INR 29 Basic Sandbox order for the explicitly authorized Preview test merchant.
        It does not open Cashfree Checkout, start a payment, or activate a subscription.
      </p>
      {authorized ? (
        <PreviewSandboxOrderButton />
      ) : (
        <p role="status" className="mt-5 rounded-lg bg-slate-100 p-4 text-sm text-slate-700">
          This test action is unavailable for this account or deployment.
        </p>
      )}
    </section>
  );
}

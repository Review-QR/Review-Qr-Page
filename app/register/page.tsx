import { redirect } from "next/navigation";
import RegistrationFlow from "./registration-flow";
import { getTrustitResumeState, hasBlockingTrustitMerchantSession } from "./actions";
import { isTrustitPhoneOtpBypassEnabled, trustitPasswordSetupIsPending } from "@/lib/trustit-onboarding";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ order_id?: string | string[] }> }) {
  const resume = await getTrustitResumeState();
  if (resume?.current_step === "complete") redirect("/merchant/dashboard");
  const passwordSetupPending = await trustitPasswordSetupIsPending();
  const hasBlockingSession = passwordSetupPending ? false : await hasBlockingTrustitMerchantSession();
  let businessName = "";
  let businessType = "";
  if (resume?.business_id) {
    const { data } = await createSupabaseAdminClient().from("businesses").select("name,type").eq("id", resume.business_id).maybeSingle();
    businessName = typeof data?.name === "string" ? data.name : "";
    businessType = typeof data?.type === "string" ? data.type : "";
  }
  const params = await searchParams;
  const returnOrderId = typeof params.order_id === "string" && /^rqr_[a-f0-9]{32}$/.test(params.order_id) ? params.order_id : null;
  const savedOrderId = typeof resume?.payment_reference === "string" && /^rqr_[a-f0-9]{32}$/.test(resume.payment_reference) ? resume.payment_reference : null;
  const orderId = savedOrderId && (!returnOrderId || returnOrderId === savedOrderId) ? savedOrderId : null;
  const initialStep = resume?.current_step === "business" ? 2 : resume?.current_step === "plan" ? 3 : resume?.current_step === "payment" ? 4 : 1;
  return <RegistrationFlow initialStep={initialStep} skipPhoneOtp={isTrustitPhoneOtpBypassEnabled()} passwordSetupPending={passwordSetupPending} hasBlockingSession={hasBlockingSession} selectedPlan={resume?.selected_plan ?? null} orderId={orderId} businessName={businessName} businessType={businessType} />;
}

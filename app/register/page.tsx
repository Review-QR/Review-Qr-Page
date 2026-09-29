import { redirect } from "next/navigation";
import RegisterAccount from "./register-account";
import RegisterShell from "./register-shell";
import { getTrustitResumeState, hasBlockingTrustitMerchantSession } from "./actions";
import { isTrustitPhoneOtpBypassEnabled, trustitPasswordSetupIsPending } from "@/lib/trustit-onboarding";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const resume = await getTrustitResumeState();
  if (resume?.current_step === "business") redirect("/register/business");
  if (resume?.current_step === "plan") redirect("/register/plan");
  if (resume?.current_step === "payment") redirect("/register/payment");
  if (resume?.current_step === "complete") redirect("/merchant/dashboard");

  const passwordSetupPending = await trustitPasswordSetupIsPending();
  const hasBlockingSession = passwordSetupPending ? false : await hasBlockingTrustitMerchantSession();
  return <RegisterShell currentStep={1} title="Trustit par apna Business add karein" description="Apne customers se genuine Google Reviews paaye."><RegisterAccount skipPhoneOtp={isTrustitPhoneOtpBypassEnabled()} passwordSetupPending={passwordSetupPending} hasBlockingSession={hasBlockingSession} /></RegisterShell>;
}

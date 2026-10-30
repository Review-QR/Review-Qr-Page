import { redirect } from "next/navigation";
import RegisterAccount from "./register-account";
import RegisterShell from "./register-shell";
import { getTrustitResumeState, hasBlockingTrustitMerchantSession } from "./actions";
import { isTrustitPhoneOtpBypassEnabled, trustitPasswordSetupIsPending } from "@/lib/trustit-onboarding";
import { getActiveMerchant } from "@/lib/merchant-auth";

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<{ new?: string; reset?: string }>;
}) {
  const params = await searchParams;
  const isExplicitNew = params?.new === "1" || params?.new === "true" || params?.reset === "1";

  const activeMerchant = await getActiveMerchant();

  // If already an active merchant and not explicitly creating a new business, go to dashboard
  if (activeMerchant && !isExplicitNew) {
    redirect("/merchant/dashboard");
  }

  // Only auto-resume steps if not explicitly starting new and there is an ongoing onboarding session
  if (!isExplicitNew) {
    const resume = await getTrustitResumeState();
    if (resume?.current_step === "business") redirect("/register/business");
    if (resume?.current_step === "plan") redirect("/register/plan");
    if (resume?.current_step === "payment") redirect("/register/payment");
    if (resume?.current_step === "complete" && activeMerchant) {
      redirect("/merchant/dashboard");
    }
  }

  const passwordSetupPending = await trustitPasswordSetupIsPending();
  const hasBlockingSession = passwordSetupPending
    ? false
    : activeMerchant
      ? true
      : false;

  return (
    <RegisterShell
      currentStep={1}
      title="Add Your Business on Trustit"
      description="Get genuine customer reviews and 25–35m hyperlocal delivery with Trustit."
    >
      <RegisterAccount
        skipPhoneOtp={isTrustitPhoneOtpBypassEnabled()}
        passwordSetupPending={passwordSetupPending}
        hasBlockingSession={hasBlockingSession}
      />
    </RegisterShell>
  );
}

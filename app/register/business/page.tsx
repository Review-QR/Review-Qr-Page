import { redirect } from "next/navigation";
import BusinessForm from "../business-form";
import RegisterShell from "../register-shell";
import { getTrustitUser } from "@/lib/trustit-onboarding";
import { getTrustitResumeState } from "../actions";
import { getSelectableBusinessCategoryData } from "@/lib/business-category-admin.server";

export const dynamic = "force-dynamic";

export default async function RegisterBusinessPage() {
  if (!(await getTrustitUser())) redirect("/register");
  const resume = await getTrustitResumeState();
  if (!resume) redirect("/register");
  if (resume.current_step === "plan") redirect("/register/plan");
  if (resume.current_step === "payment") redirect("/register/payment");
  if (resume.current_step === "complete") redirect("/merchant/dashboard");
  const categories = await getSelectableBusinessCategoryData().catch(() => []);
  return <RegisterShell currentStep={2} title="Tell us about your business" description="Add the details customers will see. Your QR stays inactive until payment is verified."><BusinessForm categories={categories} /></RegisterShell>;
}

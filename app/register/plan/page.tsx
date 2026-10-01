import { redirect } from "next/navigation";
import PlanPicker from "./plan-picker";
import RegisterShell from "../register-shell";
import { getTrustitUser } from "@/lib/trustit-onboarding";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export default async function RegisterPlanPage() {
  const context = await getTrustitUser();
  if (!context) redirect("/register");
  const { data } = await createSupabaseAdminClient().from("onboarding_sessions").select("current_step,selected_plan,status").eq("user_id", context.user.id).in("status", ["in_progress", "payment_pending", "completed"]).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!data) redirect("/register");
  if (data.status === "completed") redirect("/merchant/dashboard");
  if (data.current_step === "business") redirect("/register/business");
  if (data.current_step === "payment") redirect("/register/payment");
  return <RegisterShell currentStep={3} title="Choose your plan" description="Pick a 30-day plan. The server checks the price again before checkout."><PlanPicker selected={data.selected_plan} /></RegisterShell>;
}

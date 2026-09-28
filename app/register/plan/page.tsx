import { redirect } from "next/navigation";
import Link from "next/link";
import PlanPicker from "./plan-picker";
import { getTrustitUser } from "@/lib/trustit-onboarding";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic="force-dynamic";
export default async function RegisterPlanPage(){const context=await getTrustitUser();if(!context)redirect("/register");const {data}=await createSupabaseAdminClient().from("onboarding_sessions").select("current_step,selected_plan,status").eq("user_id",context.user.id).in("status",["in_progress","payment_pending","completed"]).order("created_at",{ascending:false}).limit(1).maybeSingle();if(!data)redirect("/register");if(data.status==="completed")redirect("/merchant/dashboard");if(data.current_step==="business")redirect("/register/business");if(data.current_step==="payment")redirect("/register/payment");return <main className="min-h-screen bg-slate-50 px-4 py-10"><section className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9"><Link href="/trustit" className="font-bold text-blue-700">Trustit</Link><p className="mt-6 text-xs font-semibold text-blue-700">3 of 4 · PLAN</p><h1 className="mt-2 text-2xl font-bold">Choose your plan</h1><p className="mt-2 text-slate-600">No hidden amount. Prices are checked again on the server.</p><PlanPicker selected={data.selected_plan}/></section></main>}

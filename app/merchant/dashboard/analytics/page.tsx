import Link from "next/link";
import { requireActiveMerchant } from "@/lib/merchant-auth";
import { createMerchantServerClient } from "@/lib/supabase-merchant-server";
import { getReviewExperienceCategoriesForBusiness } from "@/app/r/[id]/review-session";
import { getMerchantCustomerCrmMetrics } from "@/lib/customer-crm-analytics";
import ScanAnalytics from "../scan-analytics";

export const dynamic = "force-dynamic";

type DashboardStats = {
  scans: number | string;
  this_month_scans: number | string;
  total_reviews: number | string;
  average_rating: number | string | null;
  rating_5_count: number | string;
  rating_4_count: number | string;
  rating_3_count: number | string;
  rating_2_count: number | string;
  rating_1_count: number | string;
  experience_counts?: Array<{ label: string; count: number }>;
};

type ScanActivityDay = {
  scan_date: string;
  scans: number | string;
};

function count(value: number | string | null | undefined): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export default async function MerchantAnalyticsPage() {
  const merchant = await requireActiveMerchant();
  const supabase = await createMerchantServerClient();

  const [statsResult, scanActivityResult, categories, crmMetrics] = await Promise.all([
    supabase.rpc("get_merchant_dashboard_stats", { p_business_id: merchant.businessId }),
    supabase.rpc("get_merchant_scan_activity", { p_business_id: merchant.businessId, p_days: 90 }),
    getReviewExperienceCategoriesForBusiness(merchant.businessId).catch(() => []),
    getMerchantCustomerCrmMetrics(merchant.businessId),
  ]);

  const stats = (statsResult.data?.[0] ?? null) as DashboardStats | null;
  const scanActivity = (scanActivityResult.data ?? []) as ScanActivityDay[];

  const totalReviews = count(stats?.total_reviews);
  const totalScans = count(stats?.scans);
  const thisMonthScans = count(stats?.this_month_scans);
  const averageRating = stats?.average_rating != null ? Number(stats.average_rating) : null;

  const r5 = count(stats?.rating_5_count);
  const r4 = count(stats?.rating_4_count);
  const r3 = count(stats?.rating_3_count);
  const r2 = count(stats?.rating_2_count);
  const r1 = count(stats?.rating_1_count);

  const rawExperienceCounts: Array<{ label: string; count: number }> = Array.isArray(stats?.experience_counts)
    ? stats.experience_counts
    : [];

  const normType = String(merchant.businessType || "").toLowerCase();
  const isFoodOrDining = /(restaurant|cafe|food|sweet|dhaba|dining|hotel|bakery)/.test(normType);

  // 7 Distinct Experience Points for in-depth customer satisfaction tracking
  const BASE_7_POINTS = isFoodOrDining
    ? [
        { key: "food_quality", label: "Food & Taste Quality", icon: "🍽️", desc: "Freshness, taste & culinary excellence" },
        { key: "service_quality", label: "Speed & Quick Service", icon: "⚡", desc: "Prompt order prep & fast serving" },
        { key: "staff_behavior", label: "Staff & Team Hospitality", icon: "👥", desc: "Polite, attentive & courteous team" },
        { key: "cleanliness", label: "Cleanliness & Hygiene", icon: "🧹", desc: "Sanitized dining, tables & kitchen" },
        { key: "ambience", label: "Ambience & Atmosphere", icon: "✨", desc: "Comfortable seating, vibe & lighting" },
        { key: "value", label: "Value for Money", icon: "💰", desc: "Generous portions & fair pricing" },
        { key: "overall", label: "Overall Experience", icon: "🌟", desc: "Total customer delight & repeat visit" },
      ]
    : [
        { key: "product_quality", label: "Product & Service Quality", icon: "📦", desc: "Authentic, reliable & top quality" },
        { key: "service_quality", label: "Fast & Attentive Service", icon: "⚡", desc: "Instant response and prompt handling" },
        { key: "staff_behavior", label: "Staff Behavior & Helpfulness", icon: "👥", desc: "Helpful, respectful & polite team" },
        { key: "cleanliness", label: "Cleanliness & Store Hygiene", icon: "🧹", desc: "Neat, organized & tidy premises" },
        { key: "ambience", label: "Comfort & Store Ambience", icon: "✨", desc: "Pleasant visit & convenient shopping" },
        { key: "value", label: "Value for Money & Pricing", icon: "💰", desc: "Honest rates & good deals" },
        { key: "overall", label: "Overall Customer Satisfaction", icon: "🌟", desc: "Trustworthy and highly recommended" },
      ];

  // Map each of the 7 points to database selection counts
  const experiencePoints = BASE_7_POINTS.map((base) => {
    // Find matching count in DB
    const found = rawExperienceCounts.find((item) => {
      const dbLabel = item.label.toLowerCase();
      const baseLabel = base.label.toLowerCase();
      const baseKey = base.key.toLowerCase();
      return (
        dbLabel === baseLabel ||
        dbLabel.includes(baseKey) ||
        baseLabel.includes(dbLabel) ||
        (base.key === "cleanliness" && dbLabel.includes("clean")) ||
        (base.key === "staff_behavior" && (dbLabel.includes("staff") || dbLabel.includes("team"))) ||
        (base.key === "service_quality" && (dbLabel.includes("service") || dbLabel.includes("speed"))) ||
        (base.key === "food_quality" && (dbLabel.includes("food") || dbLabel.includes("taste") || dbLabel.includes("quality"))) ||
        (base.key === "value" && (dbLabel.includes("value") || dbLabel.includes("money") || dbLabel.includes("price")))
      );
    });

    const pointCount = found ? count(found.count) : 0;
    const percentage = totalReviews > 0 ? Math.min(100, Math.round((pointCount / totalReviews) * 100)) : 0;

    return {
      ...base,
      count: pointCount,
      percentage,
    };
  });

  return (
    <div className="space-y-6">
      {/* Clean Analytics Header - Dedicated, No Operational Clutter */}
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
                Analytics &amp; Footfall Intelligence
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                Realtime Data
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Performance &amp; Customer Analytics
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Detailed scan metrics, star rating breakdown, and in-depth customer experience points for{" "}
              <strong>{merchant.businessName}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/merchant/dashboard/qr"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
            >
              <span>📱</span>
              <span>My QR &amp; Standee</span>
            </Link>
            <Link
              href="/merchant/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-slate-800 transition"
            >
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 4 Primary KPI Summary Cards */}
      <section aria-label="Key Performance Indicators" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Scans */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Scans</span>
            <span className="rounded-xl bg-emerald-50 p-2 text-emerald-600">📱</span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black text-slate-900">
            {totalScans.toLocaleString("en-IN")}
          </div>
          <p className="mt-1 text-xs text-slate-500">All-time lifetime QR scans</p>
        </div>

        {/* Metric 2: This Month's Scans */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">This Month</span>
            <span className="rounded-xl bg-blue-50 p-2 text-blue-600">📈</span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black text-blue-700">
            {thisMonthScans.toLocaleString("en-IN")}
          </div>
          <p className="mt-1 text-xs text-slate-500">Current calendar month scans</p>
        </div>

        {/* Metric 3: Total Reviews */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Reviews</span>
            <span className="rounded-xl bg-amber-50 p-2 text-amber-600">💬</span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black text-slate-900">
            {totalReviews.toLocaleString("en-IN")}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {totalReviews === 0 ? "No customer reviews yet" : "Verified reviews submitted"}
          </p>
        </div>

        {/* Metric 4: Average Rating */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Average Rating</span>
            <span className="rounded-xl bg-purple-50 p-2 text-purple-600">⭐</span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black text-slate-900">
            {averageRating !== null && Number.isFinite(averageRating)
              ? `${averageRating.toFixed(1)} / 5`
              : "— / 5"}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {totalReviews === 0 ? "Awaiting first rating" : "Aggregated customer rating"}
          </p>
        </div>
      </section>

      {/* 👥 CUSTOMER DATA & CRM INTELLIGENCE BREAKDOWN (मर्चेंट कस्टमर डेटा मीट्रिक्स) */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-base">
                👥
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Customer Data &amp; Footfall Intelligence (कस्टमर डेटा मीट्रिक्स)
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Dekhein kitne customers ne apna mobile number, naam, family members aur celebration dates add ki hain.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              <span>🔒</span> DPDP Privacy Compliant
            </span>
          </div>
        </div>

        {/* DPDP Privacy Notice - Explicitly follows User Instruction */}
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-indigo-100/90 bg-indigo-50/50 p-3.5 text-xs text-indigo-900">
          <span className="mt-0.5 text-sm">🛡️</span>
          <div className="leading-relaxed">
            <strong className="text-indigo-950">Privacy &amp; Data Security Shield:</strong> Customer privacy compliance ke niyam ke tahat individual vyakti ka phone number, naam ya personal celebration dates yahan open list me display nahi ki jaati hain. Merchant ko marketing aur WhatsApp automation ke liye <strong>sirf aggregated metrics aur intelligence breakdown</strong> dikhaya jata hai.
          </div>
        </div>

        {/* Customer Data Metric Cards Grid */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Mobile Numbers Captured */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:bg-white hover:shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-2xl">📱</span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-800">
                  Mobile Captured
                </span>
              </div>
              <h3 className="mt-2 text-sm font-extrabold text-slate-900">Customers with Mobile</h3>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Kitne logon ne mobile number enter kiya
              </p>
            </div>

            <div className="mt-4 border-t border-slate-200/80 pt-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-slate-600">Total Registered:</span>
                <span className="text-xl font-black text-slate-900">
                  {crmMetrics.customersWithMobile}
                </span>
              </div>

              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                  style={{ width: `${crmMetrics.whatsAppReadyPercentage}%` }}
                />
              </div>

              <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                <span>
                  {totalReviews > 0 ? `${crmMetrics.customersWithMobile} of ${totalReviews} reviewers` : "No data yet"}
                </span>
                <span className="font-bold text-emerald-700">{crmMetrics.whatsAppReadyPercentage}%</span>
              </div>
            </div>
          </div>

          {/* Card 2: Customer Names Captured */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:bg-white hover:shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-2xl">👤</span>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-800">
                  Name Profiled
                </span>
              </div>
              <h3 className="mt-2 text-sm font-extrabold text-slate-900">Customers with Name</h3>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Kitne logon ne apna naam dala hai
              </p>
            </div>

            <div className="mt-4 border-t border-slate-200/80 pt-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-slate-600">Personalized Profiles:</span>
                <span className="text-xl font-black text-slate-900">
                  {crmMetrics.customersWithName}
                </span>
              </div>

              {(() => {
                const pct = totalReviews > 0 ? Math.min(100, Math.round((crmMetrics.customersWithName / totalReviews) * 100)) : 0;
                return (
                  <>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                      <span>{totalReviews > 0 ? `${crmMetrics.customersWithName} of ${totalReviews} reviewers` : "No data yet"}</span>
                      <span className="font-bold text-blue-700">{pct}%</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Card 3: Family Members Added */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:bg-white hover:shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-2xl">👨‍👩‍👧‍👦</span>
                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-purple-800">
                  Family Circle
                </span>
              </div>
              <h3 className="mt-2 text-sm font-extrabold text-slate-900">Family Members Added</h3>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Customers jinhone family ko add kiya
              </p>
            </div>

            <div className="mt-4 border-t border-slate-200/80 pt-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-slate-600">Family Customers:</span>
                <span className="text-xl font-black text-slate-900">
                  {crmMetrics.customersWithFamily}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between rounded-xl bg-purple-50 px-2.5 py-1.5 text-[11px] font-semibold text-purple-800">
                <span>Total Family Members:</span>
                <span className="font-bold">{crmMetrics.totalFamilyMembers} Members</span>
              </div>

              <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                <span>Spouse, Kids, Parents profiled</span>
                <span className="font-bold text-purple-700">{crmMetrics.familyProfiledPercentage}%</span>
              </div>
            </div>
          </div>

          {/* Card 4: Total Special Occasions Mapped */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:bg-white hover:shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-2xl">🎂</span>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-800">
                  Auto-Wish Ready
                </span>
              </div>
              <h3 className="mt-2 text-sm font-extrabold text-slate-900">Occasions Profiled</h3>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Birthdays &amp; Anniversaries recorded
              </p>
            </div>

            <div className="mt-4 border-t border-slate-200/80 pt-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-slate-600">Total Dates:</span>
                <span className="text-xl font-black text-slate-900">
                  {crmMetrics.totalOccasions}
                </span>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-1.5 text-center text-[11px]">
                <div className="rounded-lg bg-orange-50 py-1 text-orange-800 font-bold">
                  🎂 {crmMetrics.birthdaysCount} B&apos;days
                </div>
                <div className="rounded-lg bg-rose-50 py-1 text-rose-800 font-bold">
                  💍 {crmMetrics.anniversariesCount} Anniv
                </div>
              </div>

              <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                <span>WhatsApp Auto-Dispatches</span>
                <span className="font-bold text-amber-700">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 AI Suggested CRM Quality & Reach Insights (Suggested Metrics as requested) */}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50/50 to-slate-50 p-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-lg">
              💬
            </span>
            <div>
              <div className="text-xs font-bold text-slate-900">WhatsApp Reachable Audience</div>
              <div className="text-[11px] text-slate-500">
                <strong>{crmMetrics.customersWithMobile}</strong> verified numbers ready for auto greetings.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50/50 to-slate-50 p-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-lg">
              💎
            </span>
            <div>
              <div className="text-xs font-bold text-slate-900">
                Data Completeness: {crmMetrics.dataCompletenessPercentage}%
              </div>
              <div className="text-[11px] text-slate-500">
                High quality customer info captured for marketing.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50/50 to-slate-50 p-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-lg">
              🎯
            </span>
            <div>
              <div className="text-xs font-bold text-slate-900">CRM Occasion Automation</div>
              <div className="text-[11px] text-slate-500">
                Automatic vouchers dispatch on special days via Fast2SMS.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🌟 7 CUSTOMER EXPERIENCE POINTS BREAKDOWN (सातों पॉइंट एनालिटिक्स) */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-base">
                🎯
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Customer Experience Points Breakdown (7 Core Touchpoints)
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Kis customer ne kis cheez par review diya — dekhein har point ko kitne customers dwara chuna gaya.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              Total Reviews: <strong>{totalReviews}</strong>
            </span>
          </div>
        </div>

        {/* 7 Points Grid */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {experiencePoints.map((point, index) => (
            <div
              key={point.key}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:bg-white hover:shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{point.icon}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                      point.count > 0
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    Point #{index + 1}
                  </span>
                </div>

                <h3 className="mt-2 text-sm font-extrabold text-slate-900">{point.label}</h3>
                <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-1">{point.desc}</p>
              </div>

              <div className="mt-4 border-t border-slate-200/80 pt-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold text-slate-600">Selected By:</span>
                  <span className="text-sm font-black text-slate-900">
                    {point.count} {point.count === 1 ? "Customer" : "Customers"}
                  </span>
                </div>

                {/* Progress Visual Bar */}
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      point.count > 0 ? "bg-gradient-to-r from-orange-500 to-amber-500" : "bg-slate-300"
                    }`}
                    style={{ width: `${totalReviews > 0 ? point.percentage : 0}%` }}
                  />
                </div>

                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                  <span>
                    {totalReviews > 0 ? `${point.count} of ${totalReviews} reviewers` : "No reviews yet"}
                  </span>
                  <span className="font-bold text-slate-700">{point.percentage}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Star Rating Distribution Grid */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-7">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-base">⭐</span>
            <h2 className="text-base font-black text-slate-900">Customer Star Rating Distribution</h2>
          </div>
          <span className="text-xs text-slate-500">5-Star Breakdown</span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-5">
          {[
            { stars: "5 ★", count: r5, color: "bg-emerald-500", text: "text-emerald-700" },
            { stars: "4 ★", count: r4, color: "bg-teal-500", text: "text-teal-700" },
            { stars: "3 ★", count: r3, color: "bg-amber-500", text: "text-amber-700" },
            { stars: "2 ★", count: r2, color: "bg-orange-500", text: "text-orange-700" },
            { stars: "1 ★", count: r1, color: "bg-rose-500", text: "text-rose-700" },
          ].map((bar) => {
            const pct = totalReviews > 0 ? Math.round((bar.count / totalReviews) * 100) : 0;
            return (
              <div key={bar.stars} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-center">
                <span className={`text-base font-black ${bar.text}`}>{bar.stars}</span>
                <div className="my-1.5 text-lg font-black text-slate-900">{bar.count}</div>
                <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div className={`h-full ${bar.color}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="mt-1 block text-[10px] text-slate-500">{pct}%</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* QR Scans Over Time Chart Component */}
      <ScanAnalytics activity={scanActivity} />
    </div>
  );
}

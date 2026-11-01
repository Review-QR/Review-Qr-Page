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

      {/* 👥 CUSTOMER DATA & FOOTFALL INTELLIGENCE (मर्चेंट कस्टमर डेटा - लाइन बाय लाइन) */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-base">
              👥
            </span>
            <div>
              <h2 className="text-base font-black text-slate-900">
                Customer Data &amp; Footfall Intelligence (कस्टमर डेटा मीट्रिक्स)
              </h2>
              <p className="text-[11px] text-slate-500">
                Kitne customers ne mobile number, naam, family members aur celebration dates add ki hain.
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
            <span>🔒</span> DPDP Privacy Compliant
          </span>
        </div>

        {/* Compact Privacy Notice */}
        <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-indigo-100 bg-indigo-50/40 px-3 py-2 text-[11px] text-indigo-900">
          <span className="text-sm">🛡️</span>
          <span>
            <strong>Privacy Compliant Aggregation:</strong> Individual phone numbers ya private dates open list me display nahi ki jaati hain. Merchant ko sirf total footfall counts aur verified metrics dikhaye jaate hain.
          </span>
        </div>

        {/* Line by Line Rows (Saves Space, Clean & Compact) */}
        <div className="mt-3.5 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-slate-50/40 overflow-hidden">
          {/* Row 1: Mobile Numbers Captured */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:px-4 bg-white hover:bg-slate-50 transition">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-base">
                📱
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Customers with Mobile Number</span>
                  <span className="rounded-md bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 text-[10px] font-bold text-emerald-700">
                    WhatsApp Ready
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">Kitne logon ne mobile number enter kiya hai</span>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:justify-end">
              <div className="w-24 sm:w-36">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${crmMetrics.whatsAppReadyPercentage}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500">{crmMetrics.whatsAppReadyPercentage}% of reviewers</span>
              </div>
              <div className="min-w-[65px] text-right font-black text-slate-900 text-sm">
                {crmMetrics.customersWithMobile} <span className="text-xs font-normal text-slate-500">लोग</span>
              </div>
            </div>
          </div>

          {/* Row 2: Customer Names Profiled */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:px-4 bg-white hover:bg-slate-50 transition">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-base">
                👤
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Customers with Name</span>
                  <span className="rounded-md bg-blue-50 border border-blue-200 px-1.5 py-0.2 text-[10px] font-bold text-blue-700">
                    Personalized
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">Kitne logon ne apna naam dala hai</span>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:justify-end">
              {(() => {
                const pct = totalReviews > 0 ? Math.min(100, Math.round((crmMetrics.customersWithName / totalReviews) * 100)) : 0;
                return (
                  <>
                    <div className="w-24 sm:w-36">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500">{pct}% of reviewers</span>
                    </div>
                    <div className="min-w-[65px] text-right font-black text-slate-900 text-sm">
                      {crmMetrics.customersWithName} <span className="text-xs font-normal text-slate-500">लोग</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Row 3: Family Members Added */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:px-4 bg-white hover:bg-slate-50 transition">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-base">
                👨‍👩‍👧‍👦
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Family Members Added</span>
                  <span className="rounded-md bg-purple-50 border border-purple-200 px-1.5 py-0.2 text-[10px] font-bold text-purple-700">
                    {crmMetrics.totalFamilyMembers} Members
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">Customers jinhone family (spouse/kids/parents) add kiya</span>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:justify-end">
              <div className="w-24 sm:w-36">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-purple-500"
                    style={{ width: `${crmMetrics.familyProfiledPercentage}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500">{crmMetrics.familyProfiledPercentage}% profiled</span>
              </div>
              <div className="min-w-[65px] text-right font-black text-slate-900 text-sm">
                {crmMetrics.customersWithFamily} <span className="text-xs font-normal text-slate-500">लोग</span>
              </div>
            </div>
          </div>

          {/* Row 4: Occasions (Birthdays & Anniversaries) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:px-4 bg-white hover:bg-slate-50 transition">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-base">
                🎂
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Special Occasions Recorded</span>
                  <span className="rounded-md bg-amber-50 border border-amber-200 px-1.5 py-0.2 text-[10px] font-bold text-amber-800">
                    🎂 {crmMetrics.birthdaysCount} B&apos;days · 💍 {crmMetrics.anniversariesCount} Anniv
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">Birthdays aur anniversaries mapped for WhatsApp automation</span>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:justify-end">
              <div className="w-24 sm:w-36 text-right text-[11px] font-semibold text-emerald-700">
                ✓ Auto-Wish Ready
              </div>
              <div className="min-w-[65px] text-right font-black text-slate-900 text-sm">
                {crmMetrics.totalOccasions} <span className="text-xs font-normal text-slate-500">लोग / तारीखें</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🌟 7 CUSTOMER EXPERIENCE POINTS BREAKDOWN (सातों पॉइंट - लाइन बाय लाइन) */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-base">
              🎯
            </span>
            <div>
              <h2 className="text-base font-black text-slate-900">
                Customer Experience Points Breakdown (7 Core Touchpoints)
              </h2>
              <p className="text-[11px] text-slate-500">
                Kis customer ne kis point par review diya — dekhein har point ko kitne logon ne chuna.
              </p>
            </div>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            Total Reviews: <strong>{totalReviews}</strong>
          </span>
        </div>

        {/* Line by Line Rows (Saves Space) */}
        <div className="mt-3.5 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-slate-50/40 overflow-hidden">
          {experiencePoints.map((point, index) => (
            <div
              key={point.key}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:px-4 bg-white hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-base">
                  {point.icon}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{point.label}</span>
                    <span className="text-[10px] font-semibold text-slate-400">Point #{index + 1}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 line-clamp-1">{point.desc}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:justify-end">
                <div className="w-24 sm:w-40">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        point.count > 0 ? "bg-gradient-to-r from-orange-500 to-amber-500" : "bg-slate-300"
                      }`}
                      style={{ width: `${totalReviews > 0 ? point.percentage : 0}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">{point.percentage}% rating share</span>
                </div>
                <div className="min-w-[65px] text-right font-black text-slate-900 text-sm">
                  {point.count} <span className="text-xs font-normal text-slate-500">लोग</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ⭐ CUSTOMER STAR RATING DISTRIBUTION (सीधी लाइन बाय लाइन नीचे तक) */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-base">⭐</span>
            <div>
              <h2 className="text-base font-black text-slate-900">Customer Star Rating Distribution</h2>
              <p className="text-[11px] text-slate-500">5-Star breakdown line by line</p>
            </div>
          </div>
          <span className="text-xs text-slate-500">
            Avg: <strong>{averageRating !== null && Number.isFinite(averageRating) ? `${averageRating.toFixed(1)} / 5` : "— / 5"}</strong>
          </span>
        </div>

        {/* Straight Down Line by Line List */}
        <div className="mt-3.5 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-slate-50/40 overflow-hidden">
          {[
            { stars: "5 ★", label: "फाइव स्टार", count: r5, color: "bg-emerald-500", text: "text-emerald-700" },
            { stars: "4 ★", label: "फोर स्टार", count: r4, color: "bg-teal-500", text: "text-teal-700" },
            { stars: "3 ★", label: "थ्री स्टार", count: r3, color: "bg-amber-500", text: "text-amber-700" },
            { stars: "2 ★", label: "टू स्टार", count: r2, color: "bg-orange-500", text: "text-orange-700" },
            { stars: "1 ★", label: "वन स्टार", count: r1, color: "bg-rose-500", text: "text-rose-700" },
          ].map((bar) => {
            const pct = totalReviews > 0 ? Math.round((bar.count / totalReviews) * 100) : 0;
            return (
              <div
                key={bar.stars}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:px-4 bg-white hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-black ${bar.text} w-10 shrink-0`}>
                    {bar.stars}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    {bar.label}
                  </span>
                </div>

                <div className="flex items-center gap-3 sm:justify-end flex-1 sm:max-w-md">
                  <div className="flex-1">
                    <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div className={`h-full ${bar.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="w-10 text-right text-[11px] font-bold text-slate-400">{pct}%</span>
                  <div className="min-w-[65px] text-right font-black text-slate-900 text-sm">
                    {bar.count} <span className="text-xs font-normal text-slate-500">लोग</span>
                  </div>
                </div>
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

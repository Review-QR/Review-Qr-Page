import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export type CustomerCrmMetrics = {
  totalProfiles: number;
  customersWithMobile: number;
  customersWithName: number;
  customersWithFamily: number;
  totalFamilyMembers: number;
  birthdaysCount: number;
  anniversariesCount: number;
  totalOccasions: number;
  dataCompletenessPercentage: number;
  whatsAppReadyPercentage: number;
  familyProfiledPercentage: number;
};

/**
 * Aggregates customer data counts (mobiles entered, names entered, family members added,
 * birthdays, and anniversaries) for a merchant business WITHOUT exposing individual customer PII.
 */
export async function getMerchantCustomerCrmMetrics(businessId: string): Promise<CustomerCrmMetrics> {
  const admin = createSupabaseAdminClient();

  try {
    // 1. Fetch reviews to get name and mobile coverage
    const { data: reviews } = await admin
      .from("trustit_reviews")
      .select("customer_name, customer_mobile")
      .eq("business_id", businessId)
      .eq("status", "submitted");

    const totalReviews = reviews?.length || 0;

    // Count unique or valid mobile entries
    const validMobiles = (reviews || []).filter((r) => {
      if (!r.customer_mobile) return false;
      const digits = r.customer_mobile.replace(/\D/g, "");
      return digits.length >= 10;
    });
    const customersWithMobile = validMobiles.length;

    const validNames = (reviews || []).filter(
      (r) => Boolean(r.customer_name && r.customer_name.trim().length > 0)
    );
    const customersWithName = validNames.length;

    // 2. Fetch customer profiles count
    const { count: profileCount } = await admin
      .from("review_customer_profiles")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId);
    const totalProfiles = Math.max(profileCount || 0, customersWithMobile, customersWithName > 0 ? 1 : 0);

    // 3. Fetch family members
    const { data: familyMembers, count: famCount } = await admin
      .from("review_family_members")
      .select("id, customer_profile_id")
      .eq("business_id", businessId);
    const totalFamilyMembers = famCount || 0;
    const customersWithFamily = new Set((familyMembers || []).map((m) => m.customer_profile_id)).size;

    // 4. Fetch special occasions
    const { data: occasions } = await admin
      .from("review_special_occasions")
      .select("occasion_key, customer_profile_id, family_member_id")
      .eq("business_id", businessId);

    const birthdaysCount = (occasions || []).filter((o) => o.occasion_key === "birthday").length;
    const anniversariesCount = (occasions || []).filter((o) => o.occasion_key === "anniversary").length;
    const totalOccasions = birthdaysCount + anniversariesCount;

    // 5. Smart Suggested Metrics
    const dataCompletenessPercentage =
      totalReviews > 0
        ? Math.min(100, Math.round(((customersWithMobile + customersWithName) / (totalReviews * 2)) * 100))
        : 0;
    const whatsAppReadyPercentage =
      totalReviews > 0 ? Math.min(100, Math.round((customersWithMobile / totalReviews) * 100)) : 0;
    const familyProfiledPercentage =
      totalProfiles > 0 ? Math.min(100, Math.round((customersWithFamily / totalProfiles) * 100)) : 0;

    return {
      totalProfiles,
      customersWithMobile,
      customersWithName,
      customersWithFamily,
      totalFamilyMembers,
      birthdaysCount,
      anniversariesCount,
      totalOccasions,
      dataCompletenessPercentage,
      whatsAppReadyPercentage,
      familyProfiledPercentage,
    };
  } catch (err) {
    console.error("[CustomerCrmMetrics] Error fetching customer metrics:", err);
    return {
      totalProfiles: 0,
      customersWithMobile: 0,
      customersWithName: 0,
      customersWithFamily: 0,
      totalFamilyMembers: 0,
      birthdaysCount: 0,
      anniversariesCount: 0,
      totalOccasions: 0,
      dataCompletenessPercentage: 0,
      whatsAppReadyPercentage: 0,
      familyProfiledPercentage: 0,
    };
  }
}

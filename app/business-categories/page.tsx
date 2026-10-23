import { loadAdminCategoryData } from "@/lib/business-category-admin.server";
import BusinessCategoryManager from "./business-category-manager";

export const dynamic = "force-dynamic";

export default async function BusinessCategoriesPage() {
  const { categories, counts, records } = await loadAdminCategoryData();
  return <BusinessCategoryManager categories={categories} counts={counts} records={records} />;
}

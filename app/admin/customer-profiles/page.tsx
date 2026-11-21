import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const metadata: Metadata = {
  title: "Customer Profiles | Trustit Admin",
  description: "Manage customer profiles, wallets, and account settings.",
  robots: { index: false, follow: false },
};

export default async function CustomerProfilesPage() {
  // Check admin session cookie
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("trustit_admin_session")?.value;

  if (!adminToken) {
    redirect("/admin/login");
  }

  const admin = createSupabaseAdminClient();

  // Verify the admin session token is valid
  const { data: adminUser, error: authError } = await admin.auth.getUser(adminToken);
  if (authError || !adminUser?.user) {
    redirect("/admin/login");
  }

  // Check if user is an admin
  const { data: adminCheck } = await admin
    .from("admin_users")
    .select("user_id, is_active")
    .eq("user_id", adminUser.user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!adminCheck) {
    redirect("/admin/login?error=not_admin");
  }

  // Fetch customers
  const { data: customers, error } = await admin
    .from("customers")
    .select("id, full_name, phone, email, created_at, is_active")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <h1 className="text-xl font-bold text-slate-900">Customer Profiles</h1>
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
          Failed to load customers: {error.message}
        </div>
        <Link href="/admin" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          ← Back to Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">Customer Profiles</h1>
        <Link
          href="/admin"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Back to Admin
        </Link>
      </div>

      <p className="text-sm text-slate-500 mb-4">
        Showing {customers?.length ?? 0} customers (latest 50)
      </p>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left text-xs font-medium text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(customers ?? []).map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition">
                <td className="px-4 py-3 font-mono text-xs text-slate-500">
                  {c.id.slice(0, 8)}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {c.full_name || "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">{c.phone || "—"}</td>
                <td className="px-4 py-3 text-slate-600">{c.email || "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.is_active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {c.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

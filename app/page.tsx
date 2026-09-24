import Link from "next/link";
import LogoutButton from "./logout-button";
import { createSupabaseServerClient } from "../lib/supabase-server";
import type { Business } from "../lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let businesses: Business[] = [];
  let errorMessage = "";

  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    businesses = data ?? [];
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Unable to load business data.";
  }

  const today = new Date().toISOString().slice(0, 10);

  const totalBusinesses = businesses.length;

  const activeBusinesses = businesses.filter(
    (business) =>
      String(business.status ?? "").toLowerCase() === "active" &&
      (!business.expiry || business.expiry >= today)
  ).length;

  const expiredBusinesses = businesses.filter(
    (business) => business.expiry && business.expiry < today
  ).length;

  const activeQrCodes = businesses.filter(
    (business) =>
      String(business.qr_status ?? "").toLowerCase() === "active" &&
      (!business.expiry || business.expiry >= today)
  ).length;

  const totalScans = businesses.reduce(
    (total, business) => total + (business.scans ?? 0),
    0
  );

  const basicCount = businesses.filter(
    (business) =>
      String(business.plan ?? "").toLowerCase() === "basic"
  ).length;

  const standardCount = businesses.filter(
    (business) =>
      String(business.plan ?? "").toLowerCase() === "standard"
  ).length;

  const premiumCount = businesses.filter(
    (business) =>
      String(business.plan ?? "").toLowerCase() === "premium"
  ).length;

  const recentBusinesses = [...businesses]
    .sort((a, b) => {
      const dateA = a.created_at ?? a.created ?? "";
      const dateB = b.created_at ?? b.created ?? "";

      return dateB.localeCompare(dateA);
    })
    .slice(0, 5);

  return (
    <main className="container">
      {/* Header */}
      <div
        style={{
          marginBottom: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 className="page-title">Review-QR Dashboard</h1>

          <p className="page-description">
            QR Review Management Platform
          </p>
        </div>

        <LogoutButton />
      </div>

      {/* Supabase Error */}
      {errorMessage && (
        <div
          className="card"
          style={{
            marginBottom: "24px",
            border: "1px solid #fecaca",
            background: "#fef2f2",
          }}
        >
          <strong style={{ color: "#b91c1c" }}>
            Supabase data load failed
          </strong>

          <p
            style={{
              margin: "8px 0 0",
              color: "#7f1d1d",
            }}
          >
            {errorMessage}
          </p>
        </div>
      )}

      {/* Main Statistics */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {/* Total Businesses */}
        <div className="card">
          <p
            style={{
              color: "#64748b",
              margin: "0 0 8px",
            }}
          >
            Total Businesses
          </p>

          <h2
            style={{
              margin: 0,
              fontSize: "30px",
            }}
          >
            {totalBusinesses}
          </h2>
        </div>

        {/* Active Businesses */}
        <div className="card">
          <p
            style={{
              color: "#64748b",
              margin: "0 0 8px",
            }}
          >
            Active Businesses
          </p>

          <h2
            style={{
              margin: 0,
              fontSize: "30px",
            }}
          >
            {activeBusinesses}
          </h2>
        </div>

        {/* Expired Businesses */}
        <div className="card">
          <p
            style={{
              color: "#64748b",
              margin: "0 0 8px",
            }}
          >
            Expired Businesses
          </p>

          <h2
            style={{
              margin: 0,
              fontSize: "30px",
            }}
          >
            {expiredBusinesses}
          </h2>
        </div>

        {/* Active QR Codes */}
        <div className="card">
          <p
            style={{
              color: "#64748b",
              margin: "0 0 8px",
            }}
          >
            Active QR Codes
          </p>

          <h2
            style={{
              margin: 0,
              fontSize: "30px",
            }}
          >
            {activeQrCodes}
          </h2>
        </div>

        {/* Total Scans */}
        <div className="card">
          <p
            style={{
              color: "#64748b",
              margin: "0 0 8px",
            }}
          >
            Total QR Scans
          </p>

          <h2
            style={{
              margin: 0,
              fontSize: "30px",
            }}
          >
            {totalScans.toLocaleString("en-IN")}
          </h2>
        </div>
      </section>

      {/* Plan Wise Businesses */}
      <section className="card">
        <h2 style={{ marginTop: 0 }}>
          Plan-wise Businesses
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
          }}
        >
          {/* Basic */}
          <div
            style={{
              padding: "16px",
              borderRadius: "10px",
              background: "#f8fafc",
            }}
          >
            <p
              style={{
                margin: "0 0 6px",
                color: "#64748b",
              }}
            >
              Basic
            </p>

            <strong style={{ fontSize: "24px" }}>
              {basicCount}
            </strong>
          </div>

          {/* Standard */}
          <div
            style={{
              padding: "16px",
              borderRadius: "10px",
              background: "#f8fafc",
            }}
          >
            <p
              style={{
                margin: "0 0 6px",
                color: "#64748b",
              }}
            >
              Standard
            </p>

            <strong style={{ fontSize: "24px" }}>
              {standardCount}
            </strong>
          </div>

          {/* Premium */}
          <div
            style={{
              padding: "16px",
              borderRadius: "10px",
              background: "#f8fafc",
            }}
          >
            <p
              style={{
                margin: "0 0 6px",
                color: "#64748b",
              }}
            >
              Premium
            </p>

            <strong style={{ fontSize: "24px" }}>
              {premiumCount}
            </strong>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section
        className="card"
        style={{ marginTop: "24px" }}
      >
        <h2 style={{ marginTop: 0 }}>
          Quick Actions
        </h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <Link
            href="/businesses"
            style={{
              display: "inline-block",
              textDecoration: "none",
              borderRadius: "8px",
              padding: "12px 18px",
              background: "#0f172a",
              color: "#ffffff",
            }}
          >
            Add / Manage Business
          </Link>

          <Link
            href="/qr-codes"
            style={{
              display: "inline-block",
              textDecoration: "none",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              padding: "12px 18px",
              background: "#ffffff",
              color: "#0f172a",
            }}
          >
            QR Codes
          </Link>

          <Link
            href="/payments"
            style={{
              display: "inline-block",
              textDecoration: "none",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              padding: "12px 18px",
              background: "#ffffff",
              color: "#0f172a",
            }}
          >
            Payments
          </Link>

          <Link
            href="/analytics"
            style={{
              display: "inline-block",
              textDecoration: "none",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              padding: "12px 18px",
              background: "#ffffff",
              color: "#0f172a",
            }}
          >
            Analytics
          </Link>
        </div>
      </section>

      {/* Recent Businesses */}
      <section
        className="card"
        style={{ marginTop: "24px" }}
      >
        <h2 style={{ marginTop: 0 }}>
          Recent Businesses
        </h2>

        {recentBusinesses.length === 0 ? (
          <p style={{ color: "#64748b" }}>
            {errorMessage
              ? "Business data could not be loaded."
              : "No businesses found in Supabase."}
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "12px",
            }}
          >
            {recentBusinesses.map((business) => (
              <div
                key={business.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  padding: "14px 16px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <strong>{business.name}</strong>

                  <div
                    style={{
                      marginTop: "4px",
                      color: "#64748b",
                      fontSize: "14px",
                    }}
                  >
                    {business.type || "Business"}

                    {business.plan
                      ? ` • ${business.plan}`
                      : ""}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "14px",
                    color:
                      String(
                        business.status ?? ""
                      ).toLowerCase() === "active"
                        ? "#15803d"
                        : "#b45309",
                  }}
                >
                  {business.status || "pending"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* System Status */}
      <section
        className="card"
        style={{ marginTop: "24px" }}
      >
        <h2 style={{ marginTop: 0 }}>
          System Status
        </h2>

        <div
          style={{
            display: "grid",
            gap: "12px",
          }}
        >
          <div>
            🟢 Next.js Foundation — Ready
          </div>

          <div>
            {errorMessage
              ? "🔴 Supabase Database — Connection/Data Error"
              : "🟢 Supabase Database — Connected"}
          </div>

          <div>
            🟢 Authentication — Connected
          </div>

          <div>
            🟢 QR Engine — Connected
          </div>

          <div>
            🟡 Cashfree Payments — Next Stage
          </div>
        </div>
      </section>
    </main>
  );
}

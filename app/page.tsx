export default function HomePage() {
  return (
    <main className="container">
      <div style={{ marginBottom: "32px" }}>
        <h1 className="page-title">Review-QR Dashboard</h1>
        <p className="page-description">
          QR Review Management Platform
        </p>
      </div>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div className="card">
          <p style={{ color: "#64748b", margin: "0 0 8px" }}>
            Total Businesses
          </p>
          <h2 style={{ margin: 0, fontSize: "30px" }}>128</h2>
        </div>

        <div className="card">
          <p style={{ color: "#64748b", margin: "0 0 8px" }}>
            Active QR Codes
          </p>
          <h2 style={{ margin: 0, fontSize: "30px" }}>109</h2>
        </div>

        <div className="card">
          <p style={{ color: "#64748b", margin: "0 0 8px" }}>
            Total Scans
          </p>
          <h2 style={{ margin: 0, fontSize: "30px" }}>5,482</h2>
        </div>

        <div className="card">
          <p style={{ color: "#64748b", margin: "0 0 8px" }}>
            Monthly Revenue
          </p>
          <h2 style={{ margin: 0, fontSize: "30px" }}>₹12,450</h2>
        </div>
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0 }}>Quick Actions</h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <button
            style={{
              border: 0,
              borderRadius: "8px",
              padding: "12px 18px",
              background: "#0f172a",
              color: "#ffffff",
            }}
          >
            Add Business
          </button>

          <button
            style={{
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              padding: "12px 18px",
              background: "#ffffff",
              color: "#0f172a",
            }}
          >
            QR Codes
          </button>

          <button
            style={{
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              padding: "12px 18px",
              background: "#ffffff",
              color: "#0f172a",
            }}
          >
            Payments
          </button>

          <button
            style={{
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              padding: "12px 18px",
              background: "#ffffff",
              color: "#0f172a",
            }}
          >
            Analytics
          </button>
        </div>
      </section>

      <section className="card" style={{ marginTop: "24px" }}>
        <h2 style={{ marginTop: 0 }}>System Status</h2>

        <div style={{ display: "grid", gap: "12px" }}>
          <div>🟢 Next.js Foundation — Ready</div>
          <div>🟡 Supabase Database — Next Stage</div>
          <div>🟡 Authentication — Next Stage</div>
          <div>🟡 QR Engine — Next Stage</div>
          <div>🟡 Cashfree Payments — Next Stage</div>
        </div>
      </section>
    </main>
  );
}

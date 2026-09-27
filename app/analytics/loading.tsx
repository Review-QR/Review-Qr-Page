export default function AnalyticsLoading() {
  return (
    <main className="dashboard-shell" aria-label="Loading analytics">
      <div className="mb-6 h-14 w-72 animate-pulse rounded-xl bg-slate-200" />
      <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
          />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white"
          />
        ))}
      </div>
    </main>
  );
}

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <header className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-48 bg-slate-200 rounded-full" />
          <div className="h-6 w-72 bg-slate-300 rounded-xl" />
          <div className="h-3 w-56 bg-slate-100 rounded-full" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-slate-100 rounded-xl" />
          <div className="h-9 w-28 bg-slate-200 rounded-xl" />
        </div>
      </header>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <div className="h-4 w-24 bg-slate-200 rounded-full" />
            <div className="h-8 w-20 bg-slate-300 rounded-xl" />
            <div className="h-3 w-32 bg-slate-100 rounded-full" />
          </div>
        ))}
      </div>

      {/* 2-Column Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 min-h-[300px]">
          <div className="h-5 w-48 bg-slate-200 rounded-lg" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-slate-50 border border-slate-100" />
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 min-h-[300px]">
          <div className="h-5 w-48 bg-slate-200 rounded-lg" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 rounded-xl bg-slate-50 border border-slate-100" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Branded Loading Indicator Card */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50/80 via-white to-sky-50/60 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25">
              <svg className="h-8 w-8 animate-pulse text-white" viewBox="0 0 64 70" fill="none">
                <path d="M32 5 6 15v18c0 17 11 29 26 35z" fill="currentColor" opacity="0.9" />
                <path d="M32 5l26 10v18c0 17-11 29-26 35z" fill="currentColor" />
                <path d="M19 35l9.5 9.5L46 25" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="absolute -inset-1 rounded-2xl border-2 border-blue-400/40 animate-ping opacity-30" />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Loading Merchant Dashboard
                </h3>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 px-2.5 py-0.5 text-[11px] font-bold text-blue-800">
                  <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                  Syncing
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Fetching verified reviews, QR scan metrics, and business profile data...
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-2 w-32 rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 animate-[pulse_1.5s_ease-in-out_infinite]" />
            </div>
            <span className="text-[11px] font-bold text-slate-400">Please wait</span>
          </div>
        </div>
      </div>

      {/* Hero 2-Column Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-pulse">
        {/* Left Column Skeleton */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs min-h-[220px] flex flex-col justify-between">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 shrink-0" />
            <div className="flex-1 space-y-2.5">
              <div className="h-4 w-32 bg-slate-200/80 rounded-full" />
              <div className="h-6 w-52 bg-slate-200 rounded-xl" />
              <div className="h-3.5 w-40 bg-slate-100 rounded-full" />
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex gap-2">
              <div className="h-8 w-28 bg-slate-100 rounded-xl" />
              <div className="h-8 w-28 bg-slate-100 rounded-xl" />
            </div>
            <div className="h-8 w-24 bg-slate-100 rounded-xl" />
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs min-h-[220px] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-amber-50" />
              <div className="space-y-1">
                <div className="h-4 w-36 bg-slate-200/80 rounded-lg" />
                <div className="h-2.5 w-24 bg-slate-100 rounded-full" />
              </div>
            </div>
            <div className="h-6 w-16 bg-slate-100 rounded-xl" />
          </div>
          <div className="grid grid-cols-12 gap-4 items-center py-2">
            <div className="col-span-5 space-y-2 border-r border-slate-100 pr-4">
              <div className="h-8 w-20 bg-slate-200 rounded-xl" />
              <div className="h-3 w-16 bg-slate-100 rounded-full" />
            </div>
            <div className="col-span-7 space-y-2">
              <div className="h-2 w-full bg-slate-100 rounded-full" />
              <div className="h-2 w-4/5 bg-slate-100 rounded-full" />
              <div className="h-2 w-3/5 bg-slate-100 rounded-full" />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="h-3 w-32 bg-slate-100 rounded-full" />
            <div className="h-3 w-20 bg-slate-100 rounded-full" />
          </div>
        </div>
      </div>

      {/* 4 Stat Cards Skeleton */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4 animate-pulse">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="h-4 w-40 bg-slate-200/80 rounded-lg" />
          <div className="h-4 w-24 bg-slate-100 rounded-full" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="h-20 rounded-2xl bg-slate-50 border border-slate-100 p-3 space-y-2">
            <div className="h-3 w-16 bg-slate-200 rounded-full" />
            <div className="h-6 w-10 bg-slate-200 rounded-lg" />
          </div>
          <div className="h-20 rounded-2xl bg-slate-50 border border-slate-100 p-3 space-y-2">
            <div className="h-3 w-16 bg-slate-200 rounded-full" />
            <div className="h-6 w-10 bg-slate-200 rounded-lg" />
          </div>
          <div className="h-20 rounded-2xl bg-slate-50 border border-slate-100 p-3 space-y-2">
            <div className="h-3 w-16 bg-slate-200 rounded-full" />
            <div className="h-6 w-10 bg-slate-200 rounded-lg" />
          </div>
          <div className="h-20 rounded-2xl bg-slate-50 border border-slate-100 p-3 space-y-2">
            <div className="h-3 w-16 bg-slate-200 rounded-full" />
            <div className="h-6 w-10 bg-slate-200 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top 2-Column Hero Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Left Column Skeleton */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs min-h-[220px] flex flex-col justify-between">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-slate-200 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-slate-200 rounded-full" />
              <div className="h-6 w-48 bg-slate-300 rounded-xl" />
              <div className="h-3 w-40 bg-slate-100 rounded-full" />
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex gap-2">
              <div className="h-8 w-28 bg-slate-200 rounded-xl" />
              <div className="h-8 w-28 bg-slate-200 rounded-xl" />
            </div>
            <div className="h-8 w-24 bg-slate-200 rounded-xl" />
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs min-h-[220px] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-amber-100" />
              <div className="space-y-1">
                <div className="h-4 w-36 bg-slate-200 rounded-lg" />
                <div className="h-2.5 w-24 bg-slate-100 rounded-full" />
              </div>
            </div>
            <div className="h-6 w-16 bg-slate-200 rounded-xl" />
          </div>
          <div className="grid grid-cols-12 gap-4 items-center py-2">
            <div className="col-span-5 space-y-2 border-r border-slate-100 pr-4">
              <div className="h-8 w-20 bg-slate-300 rounded-xl" />
              <div className="h-3 w-16 bg-slate-200 rounded-full" />
            </div>
            <div className="col-span-7 space-y-2">
              <div className="h-2 w-full bg-slate-200 rounded-full" />
              <div className="h-2 w-full bg-slate-200 rounded-full" />
              <div className="h-2 w-full bg-slate-200 rounded-full" />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="h-3 w-32 bg-slate-100 rounded-full" />
            <div className="h-3 w-20 bg-slate-200 rounded-full" />
          </div>
        </div>
      </div>

      {/* Pipeline / Grid Skeleton */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="h-4 w-40 bg-slate-200 rounded-lg" />
          <div className="h-4 w-24 bg-slate-100 rounded-full" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="h-16 rounded-2xl bg-slate-100" />
          <div className="h-16 rounded-2xl bg-slate-100" />
          <div className="h-16 rounded-2xl bg-slate-100" />
          <div className="h-16 rounded-2xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

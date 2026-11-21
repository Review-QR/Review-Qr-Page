import { Skeleton } from "@/components/ui/skeleton";

export default function PageLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="mt-2 h-4 w-96 rounded" />
      </div>

      {/* Stats row */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="mt-2 h-7 w-16 rounded" />
          </div>
        ))}
      </div>

      {/* Content cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="mt-2 h-3 w-1/2 rounded" />
              </div>
            </div>
            <Skeleton className="mt-4 h-16 w-full rounded" />
            <div className="mt-3 flex gap-2">
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

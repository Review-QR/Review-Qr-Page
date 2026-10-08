"use client";

export default function DiscoveryError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="min-h-[50vh] bg-slate-50 px-4 py-16 text-center text-slate-900">
    <h1 className="text-2xl font-bold">Local businesses are temporarily unavailable</h1>
    <p className="mt-2 text-slate-600">Please try again in a moment.</p>
    <button className="mt-5 rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white" onClick={reset}>Try again</button>
  </main>;
}

"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="max-w-sm">
        <h1 className="text-7xl font-bold text-slate-300">404</h1>
        <h2 className="mt-2 text-xl font-semibold text-slate-900">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 active:scale-[0.98]"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

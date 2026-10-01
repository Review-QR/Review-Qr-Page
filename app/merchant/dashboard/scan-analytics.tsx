"use client";

import { useMemo, useState } from "react";

type ScanDay = { scan_date: string; scans: number | string };
type Point = { label: string; value: number };

function localDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function shiftDay(key: string, days: number) {
  const date = new Date(`${key}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function shortLabel(key: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${key}T00:00:00Z`));
}

export default function ScanAnalytics({ activity }: { activity: ScanDay[] }) {
  const [range, setRange] = useState<7 | 30 | 90>(7);
  const points = useMemo<Point[]>(() => {
    const today = localDateKey(new Date());
    const byDay = new Map(activity.map((item) => [item.scan_date, Number(item.scans) || 0]));
    if (range !== 90) {
      return Array.from({ length: range }, (_, index) => {
        const date = shiftDay(today, index - (range - 1));
        return { label: shortLabel(date), value: byDay.get(date) ?? 0 };
      });
    }
    return Array.from({ length: 13 }, (_, week) => {
      const first = shiftDay(today, -89 + week * 7);
      const last = shiftDay(today, Math.min(-83 + week * 7, 0));
      let value = 0;
      for (let offset = 0; offset < 7; offset += 1) {
        const date = shiftDay(first, offset);
        if (date <= today && date <= last) value += byDay.get(date) ?? 0;
      }
      return { label: `${shortLabel(first)}–${shortLabel(last)}`, value };
    });
  }, [activity, range]);
  const max = Math.max(1, ...points.map((point) => point.value));
  const total = points.reduce((sum, point) => sum + point.value, 0);

  return (
    <section id="scan-analytics" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">SCAN ANALYTICS</p><h2 className="mt-1 text-lg font-bold text-slate-900">QR scans over time</h2><p className="mt-1 text-sm text-slate-500">{total.toLocaleString("en-IN")} scans in this range</p></div>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1" aria-label="Scan analytics range">
          {([7, 30, 90] as const).map((days) => <button key={days} type="button" aria-pressed={range === days} onClick={() => setRange(days)} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${range === days ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>{days === 90 ? "3 Months" : `${days} Days`}</button>)}
        </div>
      </div>
      {total === 0 ? <p className="mt-8 rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">No scan data yet.</p> : <div className="mt-8 flex h-56 items-end gap-1 border-b border-l border-slate-200 px-2 pb-2 sm:gap-2" role="img" aria-label={`${range} day scan chart, ${total} scans`}>
        {points.map((point, index) => <div key={`${point.label}-${index}`} className="group relative flex h-full min-w-0 flex-1 flex-col justify-end" title={`${point.label}: ${point.value}`}>
          <span className="mb-1 text-center text-[10px] text-slate-500">{range === 90 && index % 2 ? "" : point.value || ""}</span>
          <div className="min-h-0 rounded-t bg-blue-500 transition-colors group-hover:bg-blue-700" style={{ height: `${Math.max(point.value ? 4 : 0, (point.value / max) * 72)}%` }} />
          {(range === 7 || range === 90 && index % 2 === 0 || range === 30 && index % 5 === 0) && <span className="mt-2 truncate text-center text-[9px] text-slate-500">{point.label.split("–")[0]}</span>}
        </div>)}
      </div>}
      <p className="mt-3 text-xs text-slate-400">Lifetime total scans include the existing counter. Date-range analytics begin when timestamped scan tracking was enabled.</p>
    </section>
  );
}

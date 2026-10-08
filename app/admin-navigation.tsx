"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_LINKS = [
  { label: "Dashboard", href: "/" },
  { label: "Businesses", href: "/businesses" },
  { label: "Business Categories", href: "/business-categories" },
  { label: "QR Codes", href: "/qr-codes" },
  { label: "Payments", href: "/payments" },
  { label: "Analytics", href: "/analytics" },
  { label: "Merchants", href: "/merchants" },
] as const;

function isAdminPath(pathname: string) {
  return ADMIN_LINKS.some(({ href }) =>
    href === "/"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`),
  );
}

export default function AdminNavigation() {
  const pathname = usePathname();

  if (!pathname || !isAdminPath(pathname)) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link
          href="/"
          className="flex w-fit items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          aria-label="Review-QR Admin Dashboard"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-xs font-extrabold tracking-tight text-white shadow-sm">
            QR
          </span>
          <span>
            <span className="block text-sm font-bold leading-4 text-slate-900">
              Review-QR
            </span>
            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Admin workspace
            </span>
          </span>
        </Link>

        <nav
          aria-label="Admin navigation"
          className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-0.5 sm:-mx-6 sm:px-6 lg:mx-0 lg:max-w-[calc(100%-190px)] lg:justify-end lg:px-0"
        >
          {ADMIN_LINKS.map(({ label, href }) => {
            const active =
              href === "/"
                ? pathname === href
                : pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

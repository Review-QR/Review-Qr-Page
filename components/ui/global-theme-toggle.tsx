"use client";

import { ThemeToggle } from "@/components/ui/theme-toggle";

export function GlobalThemeToggle() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <ThemeToggle />
    </div>
  );
}

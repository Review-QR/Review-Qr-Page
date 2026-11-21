"use client";

import { useCallback, useEffect, useState } from "react";

type Theme = "light" | "dark";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  return (localStorage.getItem("theme") as Theme | null) ?? null;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = getStoredTheme();
    const system = getSystemTheme();
    const initial = stored ?? system;
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
  }, [theme]);

  if (!mounted) {
    return (
      <button className="theme-toggle-placeholder h-8 w-8" aria-label="Toggle theme">
        <div className="h-5 w-5 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      {theme === "dark" ? (
        // Sun icon
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M6.429 17.571L4.838 15.98M3.75 12h2.25m11.485-4.773l-1.591 1.591M9 12h2.25" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ) : (
        // Moon icon
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.939 9.735 9.735 0 0015.939 18c.936.772 2.002 1.454 3.033 1.949.654.314.986.903.986 1.478 0 .972-1.277 1.443-2.081.854a12.014 12.014 0 01-5.825-5.825c-.589-.804-.118-2.081.854-2.081.575 0 1.164.332 1.478.986a9.735 9.735 0 002.94 3.033c.495.654 1.454.712 1.949.033ZM3.8 3.8a8.25 8.25 0 1111.7 11.7c.772.936.936 2.081.986 2.94.05.858-.332 1.716-.986 2.081A12 12 0 013.8 3.8Z" />
        </svg>
      )}
    </button>
  );
}

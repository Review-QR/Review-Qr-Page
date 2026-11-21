"use client";

import { ReactNode, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeProviderProps {
  children: ReactNode;
}

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("theme");
  return stored === "dark" || stored === "light" ? stored : null;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = getStoredTheme() ?? getSystemTheme();
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
  };

  return (
    <>
      {children}
      {/* Floating theme toggle button */}
      {mounted && (
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          className="fixed bottom-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-all hover:scale-105 active:scale-95 border border-slate-200 dark:bg-slate-800/90 dark:border-slate-700"
        >
          {theme === "dark" ? (
            // Sun icon
            <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <circle cx="12" cy="12" r="4" />
              <path strokeLinecap="round" d="M12 2v2m0 16v2m4-4.24l1.41-1.41M4.59 19.41l1.41-1.41M2 12h2m16 0h2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41" />
            </svg>
          ) : (
            // Moon icon
            <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 15A9.75 9.75 0 018.25 2.25 1.5 1.5 0 009 4.5 7.5 7.5 0 0016.5 12a1.5 1.5 0 001.5 1.5 6 6 0 01-7.5 7.5A1.5 1.5 0 006 21.75 9.75 9.75 0 0021.75 15z" />
            </svg>
          )}
        </button>
      )}
    </>
  );
}

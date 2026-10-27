"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSearchSuggestions, resolveCategoryForQuery, slugifyCity, type SearchSuggestion } from "@/lib/public-discovery-domain";

const UP_CITIES = [
  { name: "Bahraich", slug: "bahraich" },
  { name: "Lucknow", slug: "lucknow" },
  { name: "Ayodhya", slug: "ayodhya" },
  { name: "Kanpur", slug: "kanpur" },
  { name: "Varanasi", slug: "varanasi" },
  { name: "Gorakhpur", slug: "gorakhpur" },
];

const POPULAR_QUICK_CHIPS = [
  { label: "Gulab Jamun", q: "gulab jamun", icon: "🍰", categorySlug: "sweet-shops" },
  { label: "Nirma / Detergent", q: "nirma", icon: "🧼", categorySlug: "grocery-stores" },
  { label: "Awadhi Biryani", q: "biryani", icon: "🍗", categorySlug: "restaurants" },
  { label: "Saloon / Haircut", q: "haircut", icon: "✂️", categorySlug: "salons" },
  { label: "Dawa / Paracetamol", q: "paracetamol", icon: "💊", categorySlug: "pharmacies" },
  { label: "Dentist Clinic", q: "dental", icon: "🦷", categorySlug: "clinics" },
  { label: "Cement / Paint", q: "cement", icon: "🔨", categorySlug: "hardware-stores" },
  { label: "Bike Service", q: "bike", icon: "🚗", categorySlug: "auto-services" },
];

const PLACEHOLDER_HINTS = [
  "Search 'Nirma', 'Gulab Jamun', 'Saloon'...",
  "Search 'Detergent', 'Surf', 'Biryani'...",
  "Search 'Dentist', 'Haircut', 'Paracetamol'...",
  "Search 'Cement', 'Mobile Cover', 'Kaju Katli'...",
];

export function HomeHeroSearch({
  defaultCity = "Bahraich",
  defaultQuery = "",
}: {
  defaultCity?: string;
  defaultQuery?: string;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedCity, setSelectedCity] = useState(defaultCity || "Bahraich");
  const [cityMenuOpen, setCityMenuOpen] = useState(false);
  const [query, setQuery] = useState(defaultQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // Rotating placeholder hints
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_HINTS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  // Update suggestions on query change
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length >= 2) {
      const citySlug = slugifyCity(selectedCity);
      const results = getSearchSuggestions(trimmed, citySlug);
      setSuggestions(results);
      setIsOpen(results.length > 0);
      setActiveIndex(-1);
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }, [query, selectedCity]);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setCityMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const citySlug = slugifyCity(selectedCity);

  function executeSearch(searchQuery: string) {
    const q = searchQuery.trim();
    if (!q) {
      router.push(`/${citySlug}/grocery-stores`);
      return;
    }
    const cat = resolveCategoryForQuery(q);
    router.push(`/${citySlug}/${cat}?q=${encodeURIComponent(q)}`);
    setIsOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        executeSearch(query);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        router.push(suggestions[activeIndex].url);
        setIsOpen(false);
      } else {
        executeSearch(query);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setCityMenuOpen(false);
    }
  }

  const resolvedCategory = resolveCategoryForQuery(query);

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl mx-auto">
      {/* ── Main Unified Search Bar Form ── */}
      <form
        action="/"
        method="get"
        onSubmit={(e) => {
          e.preventDefault();
          executeSearch(query);
        }}
        className="relative z-30 flex flex-col sm:flex-row items-stretch sm:items-center rounded-3xl border border-slate-200/90 bg-white p-2 shadow-[0_12px_40px_-10px_rgba(15,23,42,0.12)] transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10"
        aria-label="Search local businesses"
      >
        {/* Hidden inputs to guarantee form submit & SEO compatibility */}
        <input type="hidden" name="city" value={selectedCity} />
        <input type="hidden" name="category" value={resolvedCategory} />

        {/* 1. City Selector Button & Popup */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => {
              setCityMenuOpen(!cityMenuOpen);
              setIsOpen(false);
            }}
            className="flex w-full sm:w-auto items-center justify-between sm:justify-start gap-2 rounded-2xl bg-slate-50/80 px-3.5 py-2.5 text-xs font-bold text-slate-800 transition hover:bg-slate-100 sm:bg-transparent"
            aria-label="Select city"
          >
            <span className="text-base">📍</span>
            <span className="font-extrabold text-slate-900">{selectedCity}</span>
            <span className="text-[10px] text-slate-400">▼</span>
          </button>

          {/* City Selection Dropdown */}
          {cityMenuOpen && (
            <div className="absolute left-0 top-full mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 text-left">
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Popular Cities in UP
              </p>
              {UP_CITIES.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => {
                    setSelectedCity(c.name);
                    setCityMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition ${
                    c.name.toLowerCase() === selectedCity.toLowerCase()
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{c.name}</span>
                  {c.name.toLowerCase() === selectedCity.toLowerCase() && <span>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider on Desktop */}
        <div className="hidden sm:block h-8 w-px bg-slate-200 mx-1" />

        {/* 2. Unified Search Input Box */}
        <div className="relative flex-1 flex items-center min-w-0 px-2 sm:px-3 py-1">
          <span className="text-slate-400 mr-2.5 text-base shrink-0">🔍</span>
          <input
            ref={inputRef}
            id="home-search-input"
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.trim().length >= 2 && suggestions.length > 0) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            maxLength={120}
            placeholder={PLACEHOLDER_HINTS[placeholderIndex]}
            className="w-full border-0 bg-transparent p-0 text-sm sm:text-base font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="text-slate-400 hover:text-slate-600 px-1 text-sm font-bold shrink-0"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* 3. Search Action CTA Button */}
        <button
          type="submit"
          className="mt-2 sm:mt-0 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 px-6 text-sm font-bold text-white shadow-md shadow-blue-700/25 transition hover:from-blue-800 hover:to-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 shrink-0"
        >
          <span>Search</span>
          <span aria-hidden="true">→</span>
        </button>
      </form>

      {/* ── Live Auto-Suggest Floating Dropdown Panel ── */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-40 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150 text-left">
          <div className="p-2 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 px-3">
            <span>SUGGESTIONS FOR &ldquo;{query}&rdquo;</span>
            <span className="text-blue-700 font-semibold">{selectedCity}</span>
          </div>

          <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
            {suggestions.map((item, index) => {
              const isSelected = index === activeIndex;
              return (
                <Link
                  key={item.id}
                  href={item.url}
                  onClick={() => setIsOpen(false)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex items-center justify-between gap-3 px-4 py-3 transition ${
                    isSelected ? "bg-blue-50/80 text-blue-900" : "hover:bg-slate-50/90 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-base">
                      {item.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-slate-900 tracking-tight leading-snug truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{item.subtitle}</p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {item.badge && (
                      <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800 ring-1 ring-emerald-600/20">
                        {item.badge}
                      </span>
                    )}
                    <span className="text-slate-400 text-xs">→</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Dropdown Footer: Direct Search Fallback */}
          <button
            type="button"
            onClick={() => executeSearch(query)}
            className="w-full bg-slate-50 px-4 py-2.5 text-center text-xs font-bold text-blue-700 hover:bg-slate-100 transition border-t border-slate-100"
          >
            Search all &ldquo;{query}&rdquo; products &amp; shops in {selectedCity} →
          </button>
        </div>
      )}

      {/* ── 1-Tap Quick Discovery Pills (Below Search Bar) ── */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
          Popular:
        </span>
        {POPULAR_QUICK_CHIPS.map((chip) => {
          const href = `/${citySlug}/${chip.categorySlug}?q=${encodeURIComponent(chip.q)}`;
          return (
            <Link
              key={chip.label}
              href={href}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/95 px-3 py-1.5 font-bold text-slate-700 shadow-2xs transition hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-700"
            >
              <span>{chip.icon}</span>
              <span>{chip.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
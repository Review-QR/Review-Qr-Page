"use client";

import { useId, useMemo, useState } from "react";
import { searchBusinessTypes, type BusinessType } from "@/lib/business-types";

export default function BusinessTypePicker({
  value,
  onChange,
  label = "Business Type",
  className = "w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500",
}: {
  value: string;
  onChange(value: BusinessType | ""): void;
  label?: string;
  className?: string;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const results = useMemo(() => searchBusinessTypes(query).slice(0, 8), [query]);
  const displayedValue = open && query ? query : value;

  function choose(type: BusinessType) {
    onChange(type);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="relative">
      <label htmlFor={id} className="mb-1 block text-sm font-medium">{label}</label>
      <div className="relative">
        <input
          id={id}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${id}-results`}
          aria-activedescendant={open && results[activeIndex] ? `${id}-option-${activeIndex}` : undefined}
          autoComplete="off"
          required
          value={displayedValue}
          placeholder="Search business types"
          className={`${className} ${value ? "pr-16" : ""}`}
          onFocus={(event) => { setQuery(""); setOpen(true); setActiveIndex(0); event.currentTarget.select(); }}
          onChange={(event) => { setQuery(event.target.value); setOpen(true); setActiveIndex(0); }}
          onKeyDown={(event) => {
            if (event.key === "Escape") { setOpen(false); setQuery(""); return; }
            if (!open) return;
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((index) => results.length ? (index + 1) % results.length : 0);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) => results.length ? (index + results.length - 1) % results.length : 0);
            } else if (event.key === "Enter" && results[activeIndex]) {
              event.preventDefault();
              choose(results[activeIndex]);
            }
          }}
          onBlur={() => { window.setTimeout(() => { setOpen(false); setQuery(""); }, 120); }}
        />
        {value && (
          <button
            type="button"
            aria-label="Clear business type"
            className="absolute inset-y-0 right-2 rounded px-2 text-sm text-slate-500 hover:bg-slate-100"
            onClick={() => { onChange(""); setQuery(""); setOpen(true); }}
          >Clear</button>
        )}
      </div>
      {open && (
        <ul id={`${id}-results`} role="listbox" className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
          {results.length ? results.map((type, index) => (
            <li
              id={`${id}-option-${index}`}
              key={type}
              role="option"
              aria-selected={index === activeIndex}
              className={`cursor-pointer rounded-md px-3 py-2 text-sm ${index === activeIndex ? "bg-blue-50 text-blue-900" : "text-slate-800 hover:bg-slate-50"}`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(type)}
            >{type}</li>
          )) : <li className="px-3 py-2 text-sm text-slate-500" role="presentation">No matching business types</li>}
        </ul>
      )}
      <input type="hidden" name="type" value={value} />
    </div>
  );
}

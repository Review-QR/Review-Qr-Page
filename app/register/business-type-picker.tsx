"use client";

import { useMemo, useState } from "react";
import { searchBusinessTypes } from "@/lib/config/business-types";

const inputClass = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

export default function BusinessTypePicker() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");
  const [open, setOpen] = useState(false);
  const matches = useMemo(() => searchBusinessTypes(query).slice(0, 8), [query]);

  function choose(name: string) {
    setSelected(name);
    setQuery(name);
    setOpen(false);
  }

  return (
    <div className="relative">
      <label htmlFor="business-type-search" className="block text-sm font-semibold text-slate-800">Business Type</label>
      <input
        id="business-type-search"
        className={inputClass}
        type="search"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open && matches.length > 0}
        aria-controls="business-type-results"
        autoComplete="off"
        placeholder="Search business types"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(event) => { setQuery(event.target.value); setSelected(""); setOpen(true); }}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
          if (event.key === "Enter" && matches.length === 1) { event.preventDefault(); choose(matches[0].name); }
        }}
        required
      />
      <input type="hidden" name="type" value={selected} />
      {open && matches.length > 0 && (
        <ul id="business-type-results" role="listbox" className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
          {matches.map((type) => (
            <li key={type.id} role="option" aria-selected={selected === type.name}>
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => choose(type.name)} className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-amber-50 focus:bg-amber-50 focus:outline-none">
                <span className="text-sm font-medium text-slate-900">{type.name}</span>
                <span className="text-xs text-slate-500">{type.group}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {query && !selected && matches.length === 0 && <p className="mt-1 text-xs text-slate-500">No matching business types.</p>}
      {selected && <p className="mt-1 text-xs text-slate-500">Selected: {selected}</p>}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getBusinessCategory, searchBusinessCategories } from "@/lib/config/business-catalog";
import BusinessCategoryIcon from "@/app/components/business-category-icon";

type Props = {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  required?: boolean;
  inputClassName?: string;
};

export default function SearchableBusinessType({
  value,
  onChange,
  name = "type",
  required = true,
  inputClassName,
}: Props) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useRef(`business-type-options-${Math.random().toString(36).slice(2)}`);
  const localEdit = useRef(false);

  useEffect(() => {
    if (localEdit.current) {
      localEdit.current = false;
      return;
    }
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const options = useMemo(() => searchBusinessCategories(query, 12), [query]);
  const selected = getBusinessCategory(value);

  function choose(type: string) {
    localEdit.current = false;
    onChange(type);
    setQuery(type);
    setOpen(false);
  }

  function handleChange(next: string) {
    setQuery(next);
    setActiveIndex(0);
    setOpen(true);
    const exactCanonical = getBusinessCategory(next);
    if (exactCanonical?.name.toLocaleLowerCase() === next.trim().toLocaleLowerCase()) {
      choose(exactCanonical.name);
      return;
    }
    if (value) {
      localEdit.current = true;
      onChange("");
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.min(index + 1, Math.max(options.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && open && options[activeIndex]) {
      event.preventDefault();
      choose(options[activeIndex].name);
    } else if (event.key === "Escape") {
      setOpen(false);
      setQuery(value);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name={name} value={value} />
      <input
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId.current}
        aria-activedescendant={open && options[activeIndex] ? `${listId.current}-${options[activeIndex].slug}` : undefined}
        value={query}
        onChange={(event) => handleChange(event.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search business type — e.g. Lib, Rest, Sal"
        autoComplete="off"
        required={required}
        className={inputClassName ?? "w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"}
      />

      {selected && value === selected.name && (
        <p className="mt-1 text-xs text-emerald-700" aria-live="polite">Selected: {selected.name}</p>
      )}

      {open && (
        <div id={listId.current} role="listbox" aria-label="Business types" className="absolute z-40 mt-1 max-h-64 w-full overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
          {options.length ? options.map((category, index) => (
            <button
              id={`${listId.current}-${category.slug}`}
              key={category.id}
              type="button"
              role="option"
              aria-selected={value === category.name || activeIndex === index}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(category.name)}
              className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${activeIndex === index ? "bg-blue-50 text-blue-900" : "text-slate-800 hover:bg-slate-50"}`}
            >
              <BusinessCategoryIcon name={category.primaryIcon} className="h-5 w-5 shrink-0 text-blue-700" />
              <span className="font-medium">{category.name}</span>
            </button>
          )) : (
            <p className="px-3 py-4 text-sm text-slate-500">No matching business types. Try another search.</p>
          )}
        </div>
      )}
    </div>
  );
}

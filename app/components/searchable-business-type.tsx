"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BUSINESS_TYPES } from "@/lib/business-types";

type Props = {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  required?: boolean;
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

const aliases: Record<string, string> = {
  lib: "Library",
  libr: "Library",
  rest: "Restaurant",
  resta: "Restaurant",
  restaur: "Restaurant",
  sal: "Salon",
  salo: "Salon",
  salon: "Salon",
};

export default function SearchableBusinessType({
  value,
  onChange,
  name = "type",
  required = true,
}: Props) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => setQuery(value), [value]);

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const options = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];
    return BUSINESS_TYPES.filter((type) => normalize(type).includes(q)).slice(0, 8);
  }, [query]);

  function choose(type: string) {
    onChange(type);
    setQuery(type);
    setOpen(false);
  }

  function handleChange(next: string) {
    setQuery(next);
    setOpen(true);

    const q = normalize(next);
    if (!q) {
      onChange("");
      return;
    }

    const alias = aliases[q];
    if (alias) {
      onChange(alias);
      setQuery(alias);
      setOpen(false);
      return;
    }

    onChange(next);
  }

  function handleBlur() {
    const q = normalize(query);
    if (!q) return;
    const alias = aliases[q];
    if (alias) choose(alias);
  }

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name={name} value={value} />
      <input
        value={query}
        onChange={(event) => handleChange(event.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        placeholder="Type: Lib, Rest, Sal..."
        autoComplete="off"
        required={required}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
      />

      {open && options.length > 0 && (
        <div className="absolute z-40 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl">
          {options.map((type) => (
            <button
              key={type}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(type)}
              className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-100"
            >
              {type}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

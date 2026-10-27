"use client";

export function DiscoveryControls({
  city,
  category,
  search,
  sort,
  minRating,
  lat,
  lng,
}: {
  city: string;
  category: string;
  search: string;
  sort: string;
  minRating: string;
  lat: string;
  lng: string;
}) {
  async function useLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const url = new URL(window.location.href);
      url.searchParams.set("lat", String(coords.latitude));
      url.searchParams.set("lng", String(coords.longitude));
      url.searchParams.set("sort", "nearest");
      window.location.assign(url);
    });
  }

  const controlFocus =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";

  return (
    <form
      className="grid gap-3 rounded-3xl border border-slate-200/90 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]"
      action={`/${encodeURIComponent(city)}/${encodeURIComponent(category)}`}
    >
      {/* Search Input */}
      <div className="grid gap-1">
        <label htmlFor="discovery-search-input" className="text-xs font-bold uppercase tracking-wider text-slate-500">Search this area</label>
        <div className="relative flex items-center">
          <span className="pointer-events-none absolute left-3 text-slate-400">🔍</span>
          <input
            id="discovery-search-input"
            className={`w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-3 text-sm font-medium text-slate-900 transition focus:border-blue-500 focus:bg-white ${controlFocus}`}
            name="q"
            placeholder="Search dish, service, or shop (e.g. Samosa, Haircut, Chhavni)"
            defaultValue={search}
          />
        </div>
      </div>

      {/* Sort Select */}
      <div className="grid gap-1">
        <label htmlFor="discovery-sort-select" className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Sort by
        </label>
        <select
          id="discovery-sort-select"
          className={`w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm font-semibold text-slate-800 transition focus:border-blue-500 focus:bg-white ${controlFocus}`}
          name="sort"
          defaultValue={sort}
        >
          <option value="recommended">⭐ Recommended</option>
          <option value="highest-rated">★ Highest Rated</option>
          <option value="most-reviewed">💬 Most Reviewed</option>
          <option value="nearest" disabled={!lat || !lng}>
            📍 Nearest ({lat && lng ? "Active" : "Click 'Use my location'"})
          </option>
        </select>
      </div>

      {/* Rating Filter */}
      <div className="grid gap-1">
        <label htmlFor="discovery-rating-select" className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Min Rating
        </label>
        <select
          id="discovery-rating-select"
          className={`w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm font-semibold text-slate-800 transition focus:border-blue-500 focus:bg-white ${controlFocus}`}
          name="minRating"
          defaultValue={minRating}
        >
          <option value="">All Ratings</option>
          <option value="3">3.0+ Stars</option>
          <option value="4">4.0+ Stars (Top)</option>
          <option value="4.5">4.5+ Stars (Best)</option>
        </select>
      </div>

      {lat && lng ? (
        <>
          <input type="hidden" name="lat" value={lat} />
          <input type="hidden" name="lng" value={lng} />
        </>
      ) : null}

      {/* Action Buttons */}
      <div className="flex items-end gap-2">
        <button className={`min-h-11 rounded-xl bg-blue-700 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 ${controlFocus}`} type="submit">Apply</button>
        <button
          className={`min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 ${controlFocus}`}
          type="button"
          onClick={useLocation}
          title="Calculate distance from your current location"
        >
          📍 Near Me
        </button>
      </div>
    </form>
  );
}

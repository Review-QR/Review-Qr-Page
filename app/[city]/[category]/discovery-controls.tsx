"use client";

export function DiscoveryControls({ city, category, search, sort, minRating, lat, lng }: { city: string; category: string; search: string; sort: string; minRating: string; lat: string; lng: string }) {
  async function useLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const url = new URL(window.location.href);
      url.searchParams.set("lat", String(coords.latitude)); url.searchParams.set("lng", String(coords.longitude)); url.searchParams.set("sort", "nearest");
      window.location.assign(url);
    });
  }
  const controlFocus = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";
  return <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]" action={`/${encodeURIComponent(city)}/${encodeURIComponent(category)}`}>
    <label className="grid gap-1 text-sm font-medium text-slate-700">Search this area<input className={`rounded-lg border border-slate-300 px-3 py-2 font-normal ${controlFocus}`} name="q" placeholder="Business or address" defaultValue={search} /></label>
    <label className="grid gap-1 text-sm font-medium text-slate-700">Sort<select className={`rounded-lg border border-slate-300 px-3 py-2 ${controlFocus}`} name="sort" defaultValue={sort}><option value="recommended">Recommended</option><option value="highest-rated">Highest rated</option><option value="most-reviewed">Most reviewed</option><option value="nearest" disabled={!lat || !lng}>Nearest</option></select></label>
    <label className="grid gap-1 text-sm font-medium text-slate-700">Rating<select className={`rounded-lg border border-slate-300 px-3 py-2 ${controlFocus}`} name="minRating" defaultValue={minRating}><option value="">Any rating</option><option value="3">3.0+</option><option value="4">4.0+</option><option value="4.5">4.5+</option></select></label>
    {lat && lng ? <><input type="hidden" name="lat" value={lat}/><input type="hidden" name="lng" value={lng}/></> : null}
    <div className="flex items-end gap-2"><button className={`rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white ${controlFocus}`} type="submit">Apply</button><button className={`rounded-lg border border-slate-300 px-3 py-2 text-sm ${controlFocus}`} type="button" onClick={useLocation}>Use my location</button></div>
  </form>;
}

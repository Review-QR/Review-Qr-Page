"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  SuperAppBusiness,
  calcDistanceKm,
  estimateStoreEtaMinutes,
  getStoreRating,
  getRestaurantThumbnail,
} from "./customer-types";

export type MapMode = "stores" | "pin_adjust" | "order_route";

interface BahraichInteractiveMapProps {
  mode: MapMode;
  businesses?: SuperAppBusiness[];
  userCoords: { lat: number; lng: number } | null;
  onSelectStore?: (store: SuperAppBusiness) => void;
  // Pin adjust (N-22)
  initialPin?: { lat: number; lng: number };
  onPinConfirmed?: (pin: { lat: number; lng: number; addressText: string; mohalla: string; pincode: string }) => void;
  onUseGps?: () => Promise<{ lat: number; lng: number } | null>;
  // Live route tracking (N-26)
  storeCoords?: { lat: number; lng: number; name: string };
  riderCoords?: { lat: number; lng: number; name?: string } | null;
  customerPinCoords?: { lat: number; lng: number; label?: string };
  heightClass?: string;
}

const DEFAULT_CENTER = { lat: 27.5744, lng: 81.5977 };
const TILE_SIZE = 256;

function latLngToTileXY(lat: number, lng: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const clampedLat = Math.max(-85.05112878, Math.min(85.05112878, lat));
  const x = ((lng + 180) / 360) * n;
  const latRad = (clampedLat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return { x, y };
}

function tileXYToLatLng(tx: number, ty: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const lng = (tx / n) * 360 - 180;
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * ty) / n)));
  const lat = (latRad * 180) / Math.PI;
  return { lat, lng };
}

function computeBestZoom(
  points: Array<{ lat: number; lng: number }>,
  width: number,
  height: number,
  minZ = 14,
  maxZ = 17,
): number {
  if (points.length < 2) return 15;
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  for (let z = maxZ; z >= minZ; z--) {
    const nw = latLngToTileXY(maxLat, minLng, z);
    const se = latLngToTileXY(minLat, maxLng, z);
    const spanW = Math.abs(se.x - nw.x) * TILE_SIZE;
    const spanH = Math.abs(se.y - nw.y) * TILE_SIZE;
    if (spanW <= width * 0.62 && spanH <= height * 0.58) {
      return z;
    }
  }
  return minZ;
}

/**
 * Interactive Bahraich Street/Gali-Mohalla Map supporting:
 * - N-12: Store Pin Discovery Map
 * - N-22: Draggable / Tap-to-Adjust Dropoff Gate Pin
 * - N-26: Live Order Route Polyline (Store -> Rider -> Customer)
 */
export default function BahraichInteractiveMap({
  mode,
  businesses = [],
  userCoords,
  onSelectStore,
  initialPin,
  onPinConfirmed,
  onUseGps,
  storeCoords,
  riderCoords,
  customerPinCoords,
  heightClass = "h-80",
}: BahraichInteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number }>({
    w: 360,
    h: mode === "order_route" ? 208 : 300,
  });

  const [zoom, setZoom] = useState<number>(mode === "stores" ? 15 : 16);
  const [center, setCenter] = useState<{ lat: number; lng: number }>(
    initialPin || customerPinCoords || userCoords || DEFAULT_CENTER,
  );
  const [selectedStoreId, setSelectedStoreId] = useState<string>(businesses[0]?.id || "");
  const [pinPos, setPinPos] = useState<{ lat: number; lng: number }>(
    initialPin || userCoords || DEFAULT_CENTER,
  );
  const [pinLabel, setPinLabel] = useState<string>("Civil Lines, Bahraich");
  const [pinMohalla, setPinMohalla] = useState<string>("Civil Lines");
  const [pinPincode, setPinPincode] = useState<string>("271801");
  const [isGeocodingPin, setIsGeocodingPin] = useState(false);

  const [routePoints, setRoutePoints] = useState<Array<{ lat: number; lng: number }>>([]);
  const [routeMeta, setRouteMeta] = useState<{ distance: string; duration: string } | null>(null);
  const [useOsmFallback, setUseOsmFallback] = useState<boolean>(false);
  const [failedTileCount, setFailedTileCount] = useState<number>(0);

  // Drag-to-pan pointer tracking
  const dragStateRef = useRef<{
    active: boolean;
    moved: boolean;
    startX: number;
    startY: number;
    startCenter: { lat: number; lng: number };
  }>({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    startCenter: DEFAULT_CENTER,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 40 && rect.height > 40) {
        setContainerSize({ w: Math.round(rect.width), h: Math.round(rect.height) });
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (mode === "pin_adjust" && initialPin) {
      setPinPos(initialPin);
      setCenter(initialPin);
    }
  }, [mode, initialPin?.lat, initialPin?.lng]);

  const fitOrderRouteView = useCallback(() => {
    if (mode !== "order_route" || !storeCoords) return;
    const dest = customerPinCoords || userCoords || DEFAULT_CENTER;
    const pts = [storeCoords, dest];
    if (riderCoords) pts.push(riderCoords);
    const lats = pts.map((p) => p.lat);
    const lngs = pts.map((p) => p.lng);
    setCenter({
      lat: (Math.min(...lats) + Math.max(...lats)) / 2,
      lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
    });
    setZoom(computeBestZoom(pts, containerSize.w, containerSize.h, 14, 17));
  }, [
    mode,
    storeCoords?.lat,
    storeCoords?.lng,
    customerPinCoords?.lat,
    customerPinCoords?.lng,
    userCoords?.lat,
    userCoords?.lng,
    riderCoords?.lat,
    riderCoords?.lng,
    containerSize.w,
    containerSize.h,
  ]);

  useEffect(() => {
    if (mode === "order_route") {
      fitOrderRouteView();
    }
  }, [mode, fitOrderRouteView]);

  // Reverse geocode when user moves the dropoff pin in N-22
  useEffect(() => {
    if (mode !== "pin_adjust") return;
    let active = true;
    const timer = setTimeout(async () => {
      setIsGeocodingPin(true);
      try {
        const res = await fetch(`/api/hyperlocal/reverse-geocode?lat=${pinPos.lat}&lng=${pinPos.lng}`);
        if (res.ok && active) {
          const data = await res.json();
          setPinLabel(data.formattedAddress || data.locationName || `Bahraich (${pinPos.lat.toFixed(4)}, ${pinPos.lng.toFixed(4)})`);
          setPinMohalla(data.mohalla || data.locationName || "Civil Lines");
          setPinPincode(data.pincode || "271801");
        }
      } catch {
      } finally {
        if (active) setIsGeocodingPin(false);
      }
    }, 280);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [mode, pinPos.lat, pinPos.lng]);

  // Fetch route polyline for N-26
  useEffect(() => {
    if (mode !== "order_route" || !storeCoords) return;
    const dest = customerPinCoords || userCoords || DEFAULT_CENTER;
    let active = true;

    fetch(
      `/api/hyperlocal/directions?originLat=${storeCoords.lat}&originLng=${storeCoords.lng}&destLat=${dest.lat}&destLng=${dest.lng}`,
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active && d?.success && Array.isArray(d.points)) {
          setRoutePoints(d.points);
          setRouteMeta({ distance: d.distanceText || "1.4 km", duration: d.durationText || "14 mins" });
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [mode, storeCoords?.lat, storeCoords?.lng, customerPinCoords?.lat, customerPinCoords?.lng, userCoords?.lat, userCoords?.lng]);

  // True Web Mercator pixel grid centered in viewport (zero tile stretching or seam mismatch)
  const tileGrid = useMemo(() => {
    const cTile = latLngToTileXY(center.lat, center.lng, zoom);
    const minTx = Math.floor(cTile.x - containerSize.w / (2 * TILE_SIZE));
    const maxTx = Math.floor(cTile.x + containerSize.w / (2 * TILE_SIZE));
    const minTy = Math.floor(cTile.y - containerSize.h / (2 * TILE_SIZE));
    const maxTy = Math.floor(cTile.y + containerSize.h / (2 * TILE_SIZE));
    const n = Math.pow(2, zoom);
    const tiles: Array<{ tx: number; ty: number; wrappedTx: number; leftPx: number; topPx: number }> = [];
    for (let ty = minTy; ty <= maxTy; ty++) {
      if (ty < 0 || ty >= n) continue;
      for (let tx = minTx; tx <= maxTx; tx++) {
        const wrappedTx = ((tx % n) + n) % n;
        const leftPx = Math.round(containerSize.w / 2 + (tx - cTile.x) * TILE_SIZE);
        const topPx = Math.round(containerSize.h / 2 + (ty - cTile.y) * TILE_SIZE);
        tiles.push({ tx, ty, wrappedTx, leftPx, topPx });
      }
    }
    return { cTile, tiles };
  }, [center.lat, center.lng, zoom, containerSize.w, containerSize.h]);

  const projectToPixel = useCallback(
    (lat: number, lng: number) => {
      const pt = latLngToTileXY(lat, lng, zoom);
      const xPx = containerSize.w / 2 + (pt.x - tileGrid.cTile.x) * TILE_SIZE;
      const yPx = containerSize.h / 2 + (pt.y - tileGrid.cTile.y) * TILE_SIZE;
      return { xPx, yPx };
    },
    [zoom, containerSize.w, containerSize.h, tileGrid.cTile.x, tileGrid.cTile.y],
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button, a")) return;
    dragStateRef.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      startCenter: { ...center },
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.active) return;
    const dx = e.clientX - dragStateRef.current.startX;
    const dy = e.clientY - dragStateRef.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      dragStateRef.current.moved = true;
    }
    if (!dragStateRef.current.moved) return;
    const startTile = latLngToTileXY(
      dragStateRef.current.startCenter.lat,
      dragStateRef.current.startCenter.lng,
      zoom,
    );
    const next = tileXYToLatLng(startTile.x - dx / TILE_SIZE, startTile.y - dy / TILE_SIZE, zoom);
    setCenter(next);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const wasMoved = dragStateRef.current.moved;
    dragStateRef.current.active = false;
    dragStateRef.current.moved = false;
    if (wasMoved || mode !== "pin_adjust") return;

    if ((e.target as HTMLElement).closest("button, a")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const dxTiles = (clickX - containerSize.w / 2) / TILE_SIZE;
    const dyTiles = (clickY - containerSize.h / 2) / TILE_SIZE;
    const { lat, lng } = tileXYToLatLng(tileGrid.cTile.x + dxTiles, tileGrid.cTile.y + dyTiles, zoom);
    setPinPos({ lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) });
  };

  const selectedStore =
    businesses.find((b) => b.id === selectedStoreId) || businesses[0] || null;

  const polylineSvgPoints = useMemo(() => {
    if (mode !== "order_route" || !storeCoords) return "";
    const dest = customerPinCoords || userCoords || DEFAULT_CENTER;
    const rawPts =
      routePoints.length >= 3
        ? routePoints
        : riderCoords
          ? [storeCoords, { lat: storeCoords.lat, lng: riderCoords.lng }, riderCoords, { lat: dest.lat, lng: riderCoords.lng }, dest]
          : [storeCoords, { lat: storeCoords.lat, lng: dest.lng }, dest];
    return rawPts
      .map((p) => {
        const { xPx, yPx } = projectToPixel(p.lat, p.lng);
        return `${xPx.toFixed(1)},${yPx.toFixed(1)}`;
      })
      .join(" ");
  }, [
    mode,
    storeCoords,
    customerPinCoords,
    userCoords,
    riderCoords,
    routePoints,
    projectToPixel,
  ]);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const isOfflineTiles = failedTileCount >= tileGrid.tiles.length && tileGrid.tiles.length > 0;

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          dragStateRef.current.active = false;
        }}
        className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-[#c3c6d4] bg-[#eaeef3] select-none touch-none ${
          mode === "pin_adjust" ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing"
        }`}
      >
        {/* Crisp Local Vector Grid Fallback (Only visible if external map tiles are unreachable offline) */}
        {isOfflineTiles && (
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(148,163,184,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.35) 1px, transparent 1px)",
              backgroundSize: "34px 34px",
            }}
          >
            <span className="absolute top-12 left-4 rounded bg-white/80 px-1.5 py-0.5 text-[8px] font-bold text-slate-600">
              Main Market Marg
            </span>
            <span className="absolute bottom-4 right-12 rounded bg-white/80 px-1.5 py-0.5 text-[8px] font-bold text-slate-600">
              Civil Lines • Bahraich
            </span>
          </div>
        )}

        {/* Pixel-Exact 256x256 Mapbox Streets v12 @2x / OSM Street & Gali-Mohalla Tiles */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {tileGrid.tiles.map((t) => {
            const tileUrl =
              mapboxToken && !useOsmFallback
                ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/256/${zoom}/${t.wrappedTx}/${t.ty}@2x?access_token=${mapboxToken}`
                : `https://tile.openstreetmap.org/${zoom}/${t.wrappedTx}/${t.ty}.png`;
            return (
              <img
                key={`${useOsmFallback ? "osm" : "mb"}_${zoom}_${t.tx}_${t.ty}`}
                src={tileUrl}
                alt=""
                draggable={false}
                onError={(e) => {
                  if (mapboxToken && !useOsmFallback) {
                    setUseOsmFallback(true);
                  } else {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                    setFailedTileCount((c) => c + 1);
                  }
                }}
                style={{
                  position: "absolute",
                  left: `${t.leftPx}px`,
                  top: `${t.topPx}px`,
                  width: `${TILE_SIZE}px`,
                  height: `${TILE_SIZE}px`,
                  maxWidth: "none",
                }}
              />
            );
          })}
        </div>

        {/* Top Left Map Badge */}
        <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#003178] shadow-sm border border-[#c3c6d4]/80">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            {mode === "stores"
              ? `Bahraich Live Map • ${businesses.length} Stores`
              : mode === "pin_adjust"
                ? "Tap on street / gate to place Pin"
                : `Live Street Route • ${routeMeta?.duration || "14 mins"} (${routeMeta?.distance || "1.4 km"})`}
          </span>
        </div>

        {/* Zoom & Re-center Controls */}
        <div
          className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(18, z + 1))}
            className="h-7 w-7 rounded-lg bg-white/95 border border-[#c3c6d4] text-[#003178] font-black text-sm shadow-xs hover:bg-white"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(12, z - 1))}
            className="h-7 w-7 rounded-lg bg-white/95 border border-[#c3c6d4] text-[#003178] font-black text-sm shadow-xs hover:bg-white"
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => {
              if (mode === "order_route") {
                fitOrderRouteView();
              } else if (mode === "pin_adjust") {
                setCenter(pinPos);
              } else {
                setCenter(userCoords || DEFAULT_CENTER);
              }
            }}
            className="h-7 w-7 rounded-lg bg-white/95 border border-[#c3c6d4] text-[#003178] font-black text-xs shadow-xs hover:bg-white"
            aria-label="Re-center map"
            title="Re-center"
          >
            ⌖
          </button>
        </div>

        {/* MODE 1: N-12 Bahraich Store Pins */}
        {mode === "stores" && (
          <>
            {(() => {
              const c = userCoords || DEFAULT_CENTER;
              const { xPx, yPx } = projectToPixel(c.lat, c.lng);
              return (
                <div
                  style={{ left: `${xPx}px`, top: `${yPx}px` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
                >
                  <div className="h-4 w-4 rounded-full bg-[#006875] border-2 border-white shadow-md ring-4 ring-[#006875]/25" />
                </div>
              );
            })()}

            {businesses.map((store, idx) => {
              const sLat = store.location_latitude ?? 27.5744 + (idx % 3 - 1) * 0.0025;
              const sLng = store.location_longitude ?? 81.5977 + (Math.floor(idx / 3) - 0.5) * 0.003;
              const { xPx, yPx } = projectToPixel(sLat, sLng);
              if (xPx < -40 || xPx > containerSize.w + 40 || yPx < -20 || yPx > containerSize.h + 20) {
                return null;
              }
              const isSelected = selectedStore?.id === store.id;
              return (
                <button
                  key={store.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStoreId(store.id);
                    setCenter({ lat: sLat, lng: sLng });
                  }}
                  style={{ left: `${xPx}px`, top: `${yPx}px` }}
                  className={`absolute -translate-x-1/2 -translate-y-full z-20 transition-transform ${
                    isSelected ? "scale-110 z-30" : "hover:scale-105"
                  }`}
                >
                  <div
                    className={`px-2 py-1 rounded-full text-[10px] font-extrabold shadow-md border flex items-center gap-1 whitespace-nowrap ${
                      isSelected
                        ? "bg-[#003178] text-white border-white"
                        : "bg-white text-[#131b2e] border-[#c3c6d4]"
                    }`}
                  >
                    <span>📍</span>
                    <span className="max-w-[96px] truncate">{store.name.split(" ")[0]}</span>
                    <span className={isSelected ? "text-[#9cf0ff]" : "text-emerald-700"}>
                      ★{getStoreRating(store.id)}
                    </span>
                  </div>
                </button>
              );
            })}
          </>
        )}

        {/* MODE 2: N-22 Adjust Dropoff Gate Pin */}
        {mode === "pin_adjust" && (
          <>
            {(() => {
              const { xPx, yPx } = projectToPixel(pinPos.lat, pinPos.lng);
              return (
                <div
                  style={{ left: `${xPx}px`, top: `${yPx}px` }}
                  className="absolute -translate-x-1/2 -translate-y-full z-20 pointer-events-none"
                >
                  <div className="bg-[#003178] text-white px-2.5 py-1 rounded-xl text-[10px] font-bold shadow-lg whitespace-nowrap mb-1">
                    🏠 Meet at Gate Here
                  </div>
                  <div className="mx-auto h-5 w-5 rounded-full bg-[#0d47a1] border-3 border-white shadow-lg" />
                </div>
              );
            })()}
          </>
        )}

        {/* MODE 3: N-26 Live Street/Gali Route Polyline & Markers */}
        {mode === "order_route" && storeCoords && (
          <>
            {polylineSvgPoints && (
              <svg
                viewBox={`0 0 ${containerSize.w} ${containerSize.h}`}
                className="absolute inset-0 w-full h-full z-10 pointer-events-none"
              >
                <polyline
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity="0.9"
                  points={polylineSvgPoints}
                />
                <polyline
                  fill="none"
                  stroke="#003178"
                  strokeWidth="3.2"
                  strokeDasharray="7 5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={polylineSvgPoints}
                />
              </svg>
            )}

            {/* Store Marker */}
            {(() => {
              const { xPx, yPx } = projectToPixel(storeCoords.lat, storeCoords.lng);
              const clampX = Math.max(44, Math.min(containerSize.w - 44, xPx));
              const clampY = Math.max(42, Math.min(containerSize.h - 20, yPx));
              return (
                <div
                  style={{ left: `${clampX}px`, top: `${clampY}px` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
                >
                  <div className="rounded-xl bg-white border border-[#003178] px-2 py-0.5 text-[10px] font-extrabold text-[#003178] shadow-md whitespace-nowrap">
                    🏪 {storeCoords.name.split(" ")[0]}
                  </div>
                </div>
              );
            })()}

            {/* Customer Destination Pin */}
            {(() => {
              const dest = customerPinCoords || userCoords || DEFAULT_CENTER;
              const { xPx, yPx } = projectToPixel(dest.lat, dest.lng);
              const clampX = Math.max(40, Math.min(containerSize.w - 40, xPx));
              const clampY = Math.max(42, Math.min(containerSize.h - 20, yPx));
              return (
                <div
                  style={{ left: `${clampX}px`, top: `${clampY}px` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
                >
                  <div className="rounded-xl bg-[#059669] border border-white text-white px-2 py-0.5 text-[10px] font-extrabold shadow-md whitespace-nowrap">
                    🏠 {customerPinCoords?.label || "Gate"}
                  </div>
                </div>
              );
            })()}

            {/* Live Rider Pin */}
            {(() => {
              const dest = customerPinCoords || userCoords || DEFAULT_CENTER;
              const rLat = riderCoords?.lat ?? (storeCoords.lat + dest.lat) / 2;
              const rLng = riderCoords?.lng ?? (storeCoords.lng + dest.lng) / 2;
              const { xPx, yPx } = projectToPixel(rLat, rLng);
              const clampX = Math.max(42, Math.min(containerSize.w - 42, xPx));
              const clampY = Math.max(42, Math.min(containerSize.h - 20, yPx));
              return (
                <div
                  style={{ left: `${clampX}px`, top: `${clampY}px` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
                >
                  <div className="rounded-full bg-[#003178] border-2 border-white px-2.5 py-0.5 text-[10px] font-black text-white shadow-lg animate-pulse whitespace-nowrap">
                    🛵 {riderCoords?.name ? riderCoords.name.split(" ")[0] : "Rider"}
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </div>

      {/* Mode Footer Card */}
      {mode === "stores" && selectedStore && (
        <div className="rounded-2xl border border-[#c3c6d4] bg-white p-3 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={getRestaurantThumbnail(selectedStore.name)}
              alt={selectedStore.name}
              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#eaedff]"
            />
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-[#131b2e] truncate">
                {selectedStore.name}
              </div>
              <div className="text-[11px] text-[#434652] flex items-center gap-2">
                <span className="text-emerald-700 font-bold">★ {getStoreRating(selectedStore.id)}</span>
                <span>• {estimateStoreEtaMinutes(selectedStore, userCoords)} mins</span>
                <span>
                  • {calcDistanceKm(userCoords?.lat, userCoords?.lng, selectedStore.location_latitude, selectedStore.location_longitude)} km
                </span>
              </div>
            </div>
          </div>
          {onSelectStore && (
            <button
              type="button"
              onClick={() => onSelectStore(selectedStore)}
              className="shrink-0 rounded-xl bg-[#003178] hover:bg-[#0d47a1] text-white px-3 py-2 text-xs font-bold transition"
            >
              Open Menu →
            </button>
          )}
        </div>
      )}

      {mode === "pin_adjust" && (
        <div className="rounded-2xl border border-[#c3c6d4] bg-white p-3 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#006875]">
                {isGeocodingPin ? "Detecting Mohalla..." : `Detected Gate Pin • ${pinPincode}`}
              </div>
              <div className="text-xs font-bold text-[#131b2e] mt-0.5">{pinLabel}</div>
              <div className="text-[10px] font-mono text-[#737783]">
                {pinPos.lat.toFixed(5)}, {pinPos.lng.toFixed(5)}
              </div>
            </div>
            {onUseGps && (
              <button
                type="button"
                onClick={async () => {
                  const gps = await onUseGps();
                  if (gps) {
                    setPinPos(gps);
                    setCenter(gps);
                  }
                }}
                className="shrink-0 rounded-xl border border-[#003178]/30 bg-[#f2f3ff] px-2.5 py-1.5 text-[11px] font-bold text-[#003178]"
              >
                📡 My GPS
              </button>
            )}
          </div>
          {onPinConfirmed && (
            <button
              type="button"
              onClick={() =>
                onPinConfirmed({
                  lat: pinPos.lat,
                  lng: pinPos.lng,
                  addressText: pinLabel,
                  mohalla: pinMohalla,
                  pincode: pinPincode,
                })
              }
              className="w-full rounded-xl bg-[#003178] hover:bg-[#0d47a1] py-2.5 text-xs font-extrabold text-white transition"
            >
              Save Dropoff Gate Pin →
            </button>
          )}
        </div>
      )}

      {mode === "order_route" && storeCoords && (
        <div className="flex items-center justify-between gap-2 px-1">
          <span className="text-[11px] font-semibold text-[#434652]">
            {routeMeta ? `${routeMeta.distance} • ETA ${routeMeta.duration}` : "Calculating fastest Bahraich road route..."}
          </span>
          <a
            href={`https://www.google.com/maps/dir/?api=1&origin=${storeCoords.lat},${storeCoords.lng}&destination=${(customerPinCoords || userCoords || DEFAULT_CENTER).lat},${(customerPinCoords || userCoords || DEFAULT_CENTER).lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-[#003178] hover:underline"
          >
            Open Google Maps ↗
          </a>
        </div>
      )}
    </div>
  );
}

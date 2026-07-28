import { useCallback, useEffect, useRef, useState } from 'react';
import type { NearbyLocation } from '../types/nearBy.types';
import { getNearbyBusinesses } from '../api/nearBy.api';

export type ViewportBounds = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

// Grid steps in degrees, chosen by zoom level (the box size).
const GRID_STEPS = [0.01, 0.02, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10];

function viewportCenter(b: ViewportBounds) {
  return { lat: (b.minLat + b.maxLat) / 2, lng: (b.minLng + b.maxLng) / 2 };
}

// Build the fetch box. It is centered EXACTLY on the viewport center, so the
// server (which sorts by distance to the box center and returns the 30 nearest)
// always returns the locations closest to YOUR map center. Only the box SIZE is
// quantized to a zoom-based step: this keeps the box stable across tiny zoom
// changes (so the covered-area cache still works) without ever shifting the
// center off you. Cross-user cache sharing is handled server-side, where the
// bbox is rounded to a coarse grid before keying the cache.
function snapBounds(b: ViewportBounds): ViewportBounds {
  const span = Math.max(b.maxLat - b.minLat, b.maxLng - b.minLng);
  // Epsilon tolerance: floating-point noise can make a span like 0.02 read as
  // 0.020000000000000018, which would skip to the next (much larger) step.
  const step = GRID_STEPS.find((s) => s >= span - 1e-9) ?? GRID_STEPS[GRID_STEPS.length - 1];
  const c = viewportCenter(b);
  const half = step; // generous radius around the true center; the 30 nearest fill the view
  return { minLat: c.lat - half, maxLat: c.lat + half, minLng: c.lng - half, maxLng: c.lng + half };
}

export function useNearbyWithZoom(sector?: string | null, search?: string) {
  const [locations, setLocations] = useState<NearbyLocation[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastViewportRef = useRef<ViewportBounds | null>(null);
  // Area covered by the last successful fetch. Only set when the response came
  // back with FEWER rows than the server limit - that means we received every
  // location in the box, so any viewport inside it is provably fully covered
  // and skipping the network is safe (the endpoint is rate-limited to 20/min).
  // A full page (30 rows) may be truncated, so we never skip after one.
  const coveredAreaRef = useRef<ViewportBounds | null>(null);
  const accumulatedRef = useRef<Map<number, NearbyLocation>>(new Map());
  // Client cache of results per snapped cell. Because snapBounds makes the bbox
  // deterministic, revisiting a cell (panning back, zooming in/out across cells
  // already seen) is a guaranteed key hit and serves with NO network request,
  // even for full 30-row cells the covered-area skip can't help with. Short TTL
  // mirrors the server cache so data stays fresh.
  const cellCacheRef = useRef<Map<string, { results: NearbyLocation[]; ts: number }>>(new Map());
  const sectorRef = useRef(sector);
  sectorRef.current = sector;
  const searchRef = useRef(search);
  searchRef.current = search;

  // Merge a cell's results into the accumulated marker set: evict markers that
  // fell outside the snapped box, add the new ones, and update the covered area.
  const applyResults = useCallback((results: NearbyLocation[], snapped: ViewportBounds) => {
    // < 30 rows = the server sent everything in this box (its page limit is 30).
    // Exactly 30 may be truncated, so the area does not count as covered.
    coveredAreaRef.current = results.length < 30 ? snapped : null;

    accumulatedRef.current.forEach((loc, id) => {
      const lat = Number(loc.latitude);
      const lng = Number(loc.longitude);
      if (lat < snapped.minLat || lat > snapped.maxLat || lng < snapped.minLng || lng > snapped.maxLng) {
        accumulatedRef.current.delete(id);
      }
    });

    results.forEach((loc) => accumulatedRef.current.set(loc.location_id, loc));

    // Sort by distance to the ACTUAL viewport center so the list always shows the
    // locations closest to the center of the visible map first (the server orders
    // by the snapped center, and accumulated markers span multiple fetches).
    const vp = lastViewportRef.current;
    const all = Array.from(accumulatedRef.current.values());
    if (vp) {
      const c = viewportCenter(vp);
      all.sort((a, b) => {
        const da = (Number(a.latitude) - c.lat) ** 2 + (Number(a.longitude) - c.lng) ** 2;
        const db = (Number(b.latitude) - c.lat) ** 2 + (Number(b.longitude) - c.lng) ** 2;
        return da - db;
      });
    }
    setLocations(all);
  }, []);

  const doFetch = useCallback(async (viewport: ViewportBounds, force = false) => {
    lastViewportRef.current = viewport;

    // Abort any in-flight request UP FRONT (P3-5). If we don't, the covered-area / cache-hit early
    // returns below leave a previous request running; when it resolves it calls applyResults with
    // its OLD snapped box - drawing stale markers and, worse, resetting coveredAreaRef to a stale
    // box (which can then skip a fetch the current viewport actually needs).
    abortRef.current?.abort();

    // Skip when the viewport is still inside an area we hold COMPLETE data for.
    // Zooming out or panning beyond the covered box refetches naturally.
    const covered = coveredAreaRef.current;
    if (!force && covered) {
      const contained =
        viewport.minLat >= covered.minLat && viewport.maxLat <= covered.maxLat &&
        viewport.minLng >= covered.minLng && viewport.maxLng <= covered.maxLng;
      if (contained) return;
    }

    const snapped = snapBounds(viewport);
    const cacheKey = `${snapped.minLat}:${snapped.maxLat}:${snapped.minLng}:${snapped.maxLng}:${sectorRef.current || ''}:${searchRef.current || ''}`;

    // Serve a fresh cached cell with no network request.
    const CELL_TTL = 30 * 1000;
    const hit = cellCacheRef.current.get(cacheKey);
    if (!force && hit && Date.now() - hit.ts < CELL_TTL) {
      applyResults(hit.results, snapped);
      return;
    }

    // Fresh controller for this request (the previous one was already aborted at the top).
    const controller = new AbortController();
    abortRef.current = controller;

    setIsFetching(true);
    setIsError(false);

    try {
      const params = {
        ...snapped,
        ...(sectorRef.current ? { sector: sectorRef.current } : {}),
        ...(searchRef.current ? { name: searchRef.current } : {}),
      };
      const results = await getNearbyBusinesses(params, controller.signal);

      if (controller.signal.aborted) return;
      cellCacheRef.current.set(cacheKey, { results, ts: Date.now() });
      applyResults(results, snapped);
    } catch {
      // If this controller was aborted, the request was superseded (native abort OR axios
      // CanceledError) — bail silently. Only surface a real network/server failure.
      if (controller.signal.aborted) return;
      setIsError(true);
    } finally {
      if (!controller.signal.aborted) setIsFetching(false);
    }
  }, [applyResults]);

  // When sector changes, reset accumulated markers and re-fetch current viewport
  useEffect(() => {
    accumulatedRef.current.clear();
    coveredAreaRef.current = null; // filters changed - covered area no longer valid
    setLocations([]);
    if (lastViewportRef.current) doFetch(lastViewportRef.current, true);
  }, [sector, doFetch]);

  // When search changes, debounce 400ms then reset + refetch
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      accumulatedRef.current.clear();
      coveredAreaRef.current = null; // filters changed - covered area no longer valid
      setLocations([]);
      if (lastViewportRef.current) doFetch(lastViewportRef.current, true);
    }, 400);
    return () => { if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current); };
  }, [search, doFetch]);

  const onViewportChange = useCallback(
    (viewport: ViewportBounds) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => doFetch(viewport), 400);
    },
    [doFetch],
  );

  const isLoading = isFetching && locations.length === 0;

  return { locations, isLoading, isFetching, isError, onViewportChange };
}

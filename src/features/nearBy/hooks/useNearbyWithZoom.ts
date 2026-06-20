import { useCallback, useEffect, useRef, useState } from 'react';
import type { NearbyLocation } from '../types/nearBy.types';
import { getNearbyBusinesses } from '../api/nearBy.api';

export type ViewportBounds = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

// Globally-aligned grid steps in degrees. A viewport is snapped to whichever
// step is just larger than its span, so every user viewing roughly the same area
// at the same zoom sends the IDENTICAL bbox. Identical bboxes collapse onto one
// server cache entry, so thousands of users in the same area share a handful of
// DB queries instead of each triggering their own. Snapping also enlarges the
// box past the viewport, which replaces the old prefetch padding and lets the
// user pan within the cell without refetching (fewer requests = no rate-limit).
const GRID_STEPS = [0.01, 0.02, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10];

function snapBounds(b: ViewportBounds): ViewportBounds {
  const span = Math.max(b.maxLat - b.minLat, b.maxLng - b.minLng);
  const step = GRID_STEPS.find((s) => s >= span) ?? GRID_STEPS[GRID_STEPS.length - 1];
  const snap = (v: number, dir: 'floor' | 'ceil') =>
    (dir === 'floor' ? Math.floor(v / step) : Math.ceil(v / step)) * step;
  return {
    minLat: snap(b.minLat, 'floor'),
    maxLat: snap(b.maxLat, 'ceil'),
    minLng: snap(b.minLng, 'floor'),
    maxLng: snap(b.maxLng, 'ceil'),
  };
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
    setLocations(Array.from(accumulatedRef.current.values()));
  }, []);

  const doFetch = useCallback(async (viewport: ViewportBounds, force = false) => {
    lastViewportRef.current = viewport;

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

    // Cancel any in-flight request for a stale viewport
    abortRef.current?.abort();
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
      const results = await getNearbyBusinesses(params);

      if (controller.signal.aborted) return;
      cellCacheRef.current.set(cacheKey, { results, ts: Date.now() });
      applyResults(results, snapped);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
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

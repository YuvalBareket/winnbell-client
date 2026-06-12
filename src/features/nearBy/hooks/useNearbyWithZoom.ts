import { useCallback, useEffect, useRef, useState } from 'react';
import type { NearbyLocation } from '../types/nearBy.types';
import { getNearbyBusinesses } from '../api/nearBy.api';

export type ViewportBounds = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

function padBounds(b: ViewportBounds, factor: number): ViewportBounds {
  const latPad = (b.maxLat - b.minLat) * factor;
  const lngPad = (b.maxLng - b.minLng) * factor;
  return {
    minLat: b.minLat - latPad,
    maxLat: b.maxLat + latPad,
    minLng: b.minLng - lngPad,
    maxLng: b.maxLng + lngPad,
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
  const sectorRef = useRef(sector);
  sectorRef.current = sector;
  const searchRef = useRef(search);
  searchRef.current = search;

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

    // Cancel any in-flight request for a stale viewport
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsFetching(true);
    setIsError(false);

    const padded = padBounds(viewport, 0.5);

    try {
      const params = {
        ...padded,
        ...(sectorRef.current ? { sector: sectorRef.current } : {}),
        ...(searchRef.current ? { name: searchRef.current } : {}),
      };
      const results = await getNearbyBusinesses(params);

      if (controller.signal.aborted) return;
      // < 30 rows = the server sent everything in this box (its page limit is 30).
      // Exactly 30 may be truncated, so the area does not count as covered.
      coveredAreaRef.current = results.length < 30 ? padded : null;

      // Evict markers that have scrolled out of the padded fetch area
      accumulatedRef.current.forEach((loc, id) => {
        const lat = Number(loc.latitude);
        const lng = Number(loc.longitude);
        if (lat < padded.minLat || lat > padded.maxLat || lng < padded.minLng || lng > padded.maxLng) {
          accumulatedRef.current.delete(id);
        }
      });

      results.forEach((loc) => accumulatedRef.current.set(loc.location_id, loc));
      setLocations(Array.from(accumulatedRef.current.values()));
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setIsError(true);
    } finally {
      if (!controller.signal.aborted) setIsFetching(false);
    }
  }, []);

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

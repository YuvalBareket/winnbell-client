import { useCallback, useEffect, useRef, useState } from 'react';
import type { NearbyLocation } from '../types/nearBy.types';
import { getNearbyBusinesses } from '../api/nearBy.api';

export type ViewportBounds = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

function isCovered(viewport: ViewportBounds, fetched: ViewportBounds): boolean {
  return (
    viewport.minLat >= fetched.minLat &&
    viewport.maxLat <= fetched.maxLat &&
    viewport.minLng >= fetched.minLng &&
    viewport.maxLng <= fetched.maxLng
  );
}

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

export function useNearbyWithZoom(sector?: string | null) {
  const [locations, setLocations] = useState<NearbyLocation[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchingRef = useRef(false);
  const lastFetchedBoundsRef = useRef<ViewportBounds | null>(null);
  const lastZoomRef = useRef<number>(0);
  const accumulatedRef = useRef<Map<number, NearbyLocation>>(new Map());
  const lastViewportRef = useRef<ViewportBounds | null>(null);
  const sectorRef = useRef(sector);
  sectorRef.current = sector;

  const doFetch = useCallback(async (viewport: ViewportBounds) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    lastViewportRef.current = viewport;
    setIsFetching(true);
    setIsError(false);

    const padded = padBounds(viewport, 0.5);
    lastFetchedBoundsRef.current = padded;

    try {
      const params = sectorRef.current
        ? { ...padded, sector: sectorRef.current }
        : padded;
      const results = await getNearbyBusinesses(params);

      accumulatedRef.current.forEach((loc, id) => {
        const lat = Number(loc.latitude);
        const lng = Number(loc.longitude);
        if (lat < padded.minLat || lat > padded.maxLat || lng < padded.minLng || lng > padded.maxLng) {
          accumulatedRef.current.delete(id);
        }
      });

      results.forEach((loc) => accumulatedRef.current.set(loc.location_id, loc));
      setLocations(Array.from(accumulatedRef.current.values()));
    } catch {
      setIsError(true);
    } finally {
      setIsFetching(false);
      fetchingRef.current = false;
    }
  }, []);

  // When sector changes, reset and re-fetch current viewport
  useEffect(() => {
    accumulatedRef.current.clear();
    lastFetchedBoundsRef.current = null;
    setLocations([]);
    if (lastViewportRef.current) {
      doFetch(lastViewportRef.current);
    }
  }, [sector, doFetch]);

  const onViewportChange = useCallback(
    (viewport: ViewportBounds, zoom: number) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const zoomedIn = zoom > lastZoomRef.current;
        lastZoomRef.current = zoom;
        if (!zoomedIn && lastFetchedBoundsRef.current && isCovered(viewport, lastFetchedBoundsRef.current)) return;
        doFetch(viewport);
      }, 400);
    },
    [doFetch],
  );

  const isLoading = isFetching && locations.length === 0;

  return { locations, isLoading, isFetching, isError, onViewportChange };
}

import { useCallback, useRef, useState } from 'react';
import type { NearbyLocation } from '../types/nearBy.types';
import { getNearbyBusinesses } from '../api/nearBy.api';

export type ViewportBounds = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

// True if the viewport is fully inside the last fetched (buffered) bounds
function isCovered(viewport: ViewportBounds, fetched: ViewportBounds): boolean {
  return (
    viewport.minLat >= fetched.minLat &&
    viewport.maxLat <= fetched.maxLat &&
    viewport.minLng >= fetched.minLng &&
    viewport.maxLng <= fetched.maxLng
  );
}

// Expand bounds by a fractional buffer in every direction
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

export function useNearbyWithZoom() {
  const [locations, setLocations] = useState<NearbyLocation[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchingRef = useRef(false);
  const lastFetchedBoundsRef = useRef<ViewportBounds | null>(null);
  const lastZoomRef = useRef<number>(0);
  const accumulatedRef = useRef<Map<number, NearbyLocation>>(new Map());

  const doFetch = useCallback(async (viewport: ViewportBounds) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setIsFetching(true);
    setIsError(false);

    // Fetch with 50% padding so panning within the buffer doesn't re-trigger
    const padded = padBounds(viewport, 0.5);
    lastFetchedBoundsRef.current = padded;

    try {
      const results = await getNearbyBusinesses(padded);

      // Merge into accumulated set
      results.forEach((loc) => accumulatedRef.current.set(loc.location_id, loc));

      // Evict locations that are outside the padded fetch area
      accumulatedRef.current.forEach((loc, id) => {
        const lat = Number(loc.latitude);
        const lng = Number(loc.longitude);
        if (
          lat < padded.minLat || lat > padded.maxLat ||
          lng < padded.minLng || lng > padded.maxLng
        ) {
          accumulatedRef.current.delete(id);
        }
      });

      setLocations(Array.from(accumulatedRef.current.values()));
    } catch {
      setIsError(true);
    } finally {
      setIsFetching(false);
      fetchingRef.current = false;
    }
  }, []);

  const onViewportChange = useCallback(
    (viewport: ViewportBounds, zoom: number) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        const zoomedIn = zoom > lastZoomRef.current;
        lastZoomRef.current = zoom;
        // Skip only when panning/zooming-out within the already-fetched buffer
        if (!zoomedIn && lastFetchedBoundsRef.current && isCovered(viewport, lastFetchedBoundsRef.current)) return;
        doFetch(viewport);
      }, 400);
    },
    [doFetch],
  );

  const isLoading = isFetching && locations.length === 0;

  return { locations, isLoading, isFetching, isError, onViewportChange };
}

import { useCallback, useRef, useState } from 'react';
import type { NearbyLocation } from '../types/nearBy.types';
import { getNearbyBusinesses } from '../api/nearBy.api';

interface FetchedCircle {
  lat: number;
  lon: number;
  radius: number;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Returns true if the query circle is fully contained in any previously fetched circle
function isCovered(lat: number, lon: number, radius: number, fetched: FetchedCircle[]): boolean {
  return fetched.some((f) => haversineKm(lat, lon, f.lat, f.lon) + radius <= f.radius);
}

// Returns true if the viewport center is already inside a fetched circle with a similar or larger radius.
// Avoids re-fetching when the user pans a short distance within an already-loaded area.
function isLargelyLoaded(lat: number, lon: number, radius: number, fetched: FetchedCircle[]): boolean {
  return fetched.some(
    (f) => haversineKm(lat, lon, f.lat, f.lon) < f.radius * 0.4 && radius <= f.radius * 1.1,
  );
}

export function useNearbyWithZoom() {
  const accumulatedRef = useRef<Map<number, NearbyLocation>>(new Map());
  const [locations, setLocations] = useState<NearbyLocation[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchedCirclesRef = useRef<FetchedCircle[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchingRef = useRef(false);

  const doFetch = useCallback(async (lat: number, lon: number, radius: number) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setIsFetching(true);
    setIsError(false);
    try {
      const results = await getNearbyBusinesses({ latitude: lat, longitude: lon, radius });
      results.forEach((loc) => accumulatedRef.current.set(loc.location_id, loc));
      setLocations(Array.from(accumulatedRef.current.values()));
      fetchedCirclesRef.current.push({ lat, lon, radius });
    } catch {
      setIsError(true);
    } finally {
      setIsFetching(false);
      fetchingRef.current = false;
    }
  }, []);

  const onViewportChange = useCallback(
    (lat: number, lon: number, radiusKm: number) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        if (isCovered(lat, lon, radiusKm, fetchedCirclesRef.current)) return;
        if (isLargelyLoaded(lat, lon, radiusKm, fetchedCirclesRef.current)) return;

        doFetch(lat, lon, radiusKm);
      }, 350);
    },
    [doFetch],
  );

  // isLoading = true only on the very first fetch (no data yet) → shows skeleton
  // isFetching = true on every fetch including background → for optional subtle indicator
  const isLoading = isFetching && locations.length === 0;

  return { locations, isLoading, isFetching, isError, onViewportChange };
}

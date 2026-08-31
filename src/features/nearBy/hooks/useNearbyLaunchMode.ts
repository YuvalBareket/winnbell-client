import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { NearbyLocation } from '../types/nearBy.types';
import { getNearbyBusinesses } from '../api/nearBy.api';
import { queryKeys } from '../../../shared/constants/queryKeys';
import type { ViewportBounds } from './useNearbyWithZoom';

// TEMPORARY LAUNCH MODE (2026-08-31): with ~10 participating locations, the map fetches
// EVERYTHING once per sector and never refetches on pan/zoom - no tiles, no covered-area
// tracking, no cell cache. Panning only re-sorts the already-loaded list locally so the
// closest locations stay on top. REVERT when the location count approaches the 30-row
// map budget: swap NearbyPage back to useNearbyWithZoom (same return shape, one line).
//
// The server ignores this bbox for filtering (launch-mode service) and only uses its
// center for ordering, which the local sort overrides anyway. A fixed US-wide box means
// every user shares ONE server cache entry per sector.
const US_BBOX: ViewportBounds = { minLat: 24, maxLat: 49, minLng: -125, maxLng: -66 };

export function useNearbyLaunchMode(sector?: string | null) {
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);

  const { data = [], isLoading, isFetching, isError } = useQuery<NearbyLocation[]>({
    queryKey: queryKeys.nearby.launchAll(sector || 'all'),
    queryFn: ({ signal }) => getNearbyBusinesses(
      { ...US_BBOX, ...(sector ? { sector } : {}) },
      signal,
    ),
    // Mirrors the server-side 2-minute cache: map data only changes on draw open/close
    // or a business joining, none of which need second-level freshness.
    staleTime: 120_000,
  });

  // Keep the old hook's list UX: nearest-to-map-center first.
  const locations = useMemo(() => {
    if (!center) return data;
    return [...data].sort((a, b) => {
      const da = (Number(a.latitude) - center.lat) ** 2 + (Number(a.longitude) - center.lng) ** 2;
      const db = (Number(b.latitude) - center.lat) ** 2 + (Number(b.longitude) - center.lng) ** 2;
      return da - db;
    });
  }, [data, center]);

  // Same callback contract as useNearbyWithZoom, but a viewport change is now purely
  // local: record the new center for sorting. Zero network.
  const onViewportChange = useCallback((viewport: ViewportBounds) => {
    setCenter({
      lat: (viewport.minLat + viewport.maxLat) / 2,
      lng: (viewport.minLng + viewport.maxLng) / 2,
    });
  }, []);

  return { locations, isLoading, isFetching, isError, onViewportChange };
}

import { api } from './client';

/**
 * Full response of GET /auth/region-check. Every consumer (RegionGate, LandingPage warm
 * query, useCurrentLocation map fallback) shares ONE TanStack cache entry under
 * queryKeys.region.check, so they must all read the same declared shape - previously each
 * declared its own subset, which made the shared cache a type trap.
 */
export interface RegionCheckResponse {
  blocked: boolean;
  country: string | null;
  state: string | null;
  approx_location: { latitude: number; longitude: number } | null;
}

/** One fetch per staleTime window app-wide; pair with queryKeys.region.check. */
export const REGION_CHECK_STALE_TIME = 5 * 60_000;

export const fetchRegionCheck = (): Promise<RegionCheckResponse> =>
  api.get<RegionCheckResponse>('/auth/region-check').then(r => r.data);

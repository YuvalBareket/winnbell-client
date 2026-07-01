import { useQuery } from '@tanstack/react-query';
import { searchParticipatingLocations } from '../../tickets/api/ticketsApi';
import type { NearbyLocation } from '../types/nearBy.types';

/**
 * Global business search for the map page: finds participating businesses ANYWHERE, not just the
 * current map viewport (the map's /business/nearby query is viewport-bounded). The server caps
 * results at 20, so this stays within the map budget. Results are mapped into the NearbyLocation
 * shape so the nearby list renders them identically and tapping one can fly the map to it.
 *
 * Only runs for a 2+ char query. Pass an already-debounced value as `query`.
 */
export function useBusinessSearch(query: string, enabled: boolean) {
  const q = query.trim();
  return useQuery<NearbyLocation[]>({
    queryKey: ['businessSearch', q],
    queryFn: async () => {
      const rows = await searchParticipatingLocations(q);
      return rows
        .filter((r) => r.latitude != null && r.longitude != null)
        .map((r) => ({
          location_id: r.location_id,
          id: r.business_id,
          name: r.business_name,
          address: r.address,
          sector: r.sector,
          logo_url: r.logo_url,
          latitude: Number(r.latitude),
          longitude: Number(r.longitude),
        }));
    },
    enabled: enabled && q.length >= 2,
    staleTime: 30_000,
  });
}

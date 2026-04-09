import { useQuery } from '@tanstack/react-query';
import { fetchBusinessStats } from '../api/stats.api';
import { queryKeys } from '../../../shared/constants/queryKeys';

export const useBusinessStats = (locationId?: number, drawId?: number) => {
  return useQuery({
    queryKey: queryKeys.business.stats(locationId, drawId),
    queryFn: () => fetchBusinessStats(locationId, drawId),
    staleTime: 5 * 60_000,
    gcTime:    15 * 60_000,
    refetchOnWindowFocus: false, // historical data — no need to re-validate on focus
  });
};

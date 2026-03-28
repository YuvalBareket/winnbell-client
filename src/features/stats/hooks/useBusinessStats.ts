import { useQuery } from '@tanstack/react-query';
import { fetchBusinessStats } from '../api/stats.api';

export const useBusinessStats = (locationId?: number, drawId?: number) => {
  return useQuery({
    queryKey: ['business', 'stats', locationId ?? 'all', drawId ?? 'all'],
    queryFn: () => fetchBusinessStats(locationId, drawId),
    staleTime: 60_000,
  });
};

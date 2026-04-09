import { useQuery } from '@tanstack/react-query';
import { getActiveDraws, getDrawHistory } from '../api/draw.api';
import { queryKeys } from '../../../shared/constants/queryKeys';

export const useGetDraws = () => {
  return useQuery({
    queryKey: queryKeys.draws.active,
    queryFn: getActiveDraws,
    staleTime: 2 * 60_000,
  });
};

export const useGetDrawHistory = () => {
  return useQuery({
    queryKey: queryKeys.draws.history,
    queryFn: getDrawHistory,
    staleTime: 10 * 60_000,  // history never changes
    gcTime:    30 * 60_000,
    refetchOnWindowFocus: false,
  });
};

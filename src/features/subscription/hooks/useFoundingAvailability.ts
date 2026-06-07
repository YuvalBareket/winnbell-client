import { useQuery } from '@tanstack/react-query';
import { fetchFoundingAvailability } from '../api/subscription.api';
import { queryKeys } from '../../../shared/constants/queryKeys';

export const useFoundingAvailability = () => {
  return useQuery({
    queryKey: [...queryKeys.subscription.all, 'founding-availability'],
    queryFn: fetchFoundingAvailability,
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
};

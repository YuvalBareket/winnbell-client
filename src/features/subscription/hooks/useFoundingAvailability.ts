import { useQuery } from '@tanstack/react-query';
import { fetchFoundingAvailability } from '../api/subscription.api';

export const useFoundingAvailability = () => {
  return useQuery({
    queryKey: ['subscription', 'founding-availability'],
    queryFn: fetchFoundingAvailability,
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
};

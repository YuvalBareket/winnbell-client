import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/constants/queryKeys';
import { fetchSubscription } from '../api/subscription.api';
import type { SubscriptionDetails } from '../types/subscription.types';

export type { SubscriptionDetails };

export const useSubscription = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.subscription.all,
    queryFn: fetchSubscription,
    staleTime: 60_000,
    enabled,
  });
};

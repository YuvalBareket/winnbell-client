import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/constants/queryKeys';
import { fetchSubscription, updateSubscriptionPlan, fetchSubscriptionInvoices } from '../api/subscription.api';
import type { SubscriptionDetails, SubscriptionInvoice } from '../types/subscription.types';

export type { SubscriptionDetails, SubscriptionInvoice };

export const useSubscription = (enabled = true) => {
  return useQuery<SubscriptionDetails | null>({
    queryKey: queryKeys.subscription.all,
    queryFn: fetchSubscription,
    staleTime: 60_000,
    enabled,
  });
};

export const useSubscriptionInvoices = () => {
  return useQuery<SubscriptionInvoice[]>({
    queryKey: queryKeys.subscription.invoices,
    queryFn: fetchSubscriptionInvoices,
    staleTime: 60_000,
  });
};

export const useUpdateSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entries_per_location: number) => updateSubscriptionPlan(entries_per_location),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
};

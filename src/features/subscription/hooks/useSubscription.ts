import { useQuery } from '@tanstack/react-query';
import { api } from '../../../shared/api/client';
import { queryKeys } from '../../../shared/constants/queryKeys';

export interface SubscriptionDetails {
  id: number;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_subscription_id: string;
  draw_id: number | null;
  draw_name: string | null;
  draw_date: string | null;
  draw_status: string | null;
  prize_amount: number | null;
}

const fetchSubscription = (): Promise<SubscriptionDetails> =>
  api.get('/business/subscription').then(r => r.data);

export const useSubscription = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.subscription.all,
    queryFn: fetchSubscription,
    staleTime: 60_000,
    enabled,
  });
};

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { queryKeys } from '../../../shared/constants/queryKeys';
import { cancelSubscription } from '../api/subscription.api';

export const useCancelSubscription = (callbacks?: {
  onSuccess?: (data: { removedFromDraw: boolean; refundType: 'full' | 'prorated' | 'none'; refundAmount: number }) => void;
  onError?: (error: AxiosError<{ error: string }>) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<Awaited<ReturnType<typeof cancelSubscription>>, AxiosError<{ error: string }>, void>({
    mutationFn: cancelSubscription,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.business.myDetails });
      callbacks?.onSuccess?.(data);
    },
    onError: (err) => {
      callbacks?.onError?.(err);
    },
  });
};

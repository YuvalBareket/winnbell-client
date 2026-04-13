import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/constants/queryKeys';
import { cancelSubscription } from '../api/subscription.api';

export const useCancelSubscription = (callbacks?: {
  onSuccess?: (data: { removedFromDraw: boolean }) => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.business.myDetails });
      callbacks?.onSuccess?.(data);
    },
    onError: (err: any) => {
      callbacks?.onError?.(err);
    },
  });
};

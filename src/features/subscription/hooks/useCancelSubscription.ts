import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { queryKeys } from '../../../shared/constants/queryKeys';
import { cancelSubscription } from '../api/subscription.api';

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation<Awaited<ReturnType<typeof cancelSubscription>>, AxiosError<{ error: string }>, void>({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.business.myDetails });
    },
  });
};

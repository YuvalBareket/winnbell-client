import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/constants/queryKeys';
import { resumeSubscription } from '../api/subscription.api';

export const useResumeSubscription = (callbacks?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resumeSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.business.myDetails });
      callbacks?.onSuccess?.();
    },
    onError: (err: any) => {
      callbacks?.onError?.(err);
    },
  });
};

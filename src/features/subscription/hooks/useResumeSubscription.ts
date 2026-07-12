import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { queryKeys } from '../../../shared/constants/queryKeys';
import { resumeSubscription } from '../api/subscription.api';

export const useResumeSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation<Awaited<ReturnType<typeof resumeSubscription>>, AxiosError<{ error: string }>, void>({
    mutationFn: resumeSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.business.myDetails });
    },
  });
};

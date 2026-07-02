import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { activatePromotionalEntry } from '../api/ticketsApi';
import { queryKeys } from '../../../shared/constants/queryKeys';

export const useActivatePromotional = () => {
  const queryClient = useQueryClient();

  return useMutation<Awaited<ReturnType<typeof activatePromotionalEntry>>, AxiosError<{ message: string }>, string>({
    mutationFn: (code: string) => activatePromotionalEntry(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
    },
  });
};

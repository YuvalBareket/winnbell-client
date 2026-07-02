import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { redeemTicket } from '../api/ticketsApi';
import { queryKeys } from '../../../shared/constants/queryKeys';

export const useRedeemTicket = () => {
  const queryClient = useQueryClient();

  return useMutation<Awaited<ReturnType<typeof redeemTicket>>, AxiosError<{ message: string }>, string>({
    mutationFn: redeemTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
    },
  });
};

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { redeemTicket } from '../api/ticketsApi';
import { queryKeys } from '../../../shared/constants/queryKeys';

export const useRedeemTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: redeemTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.riskLevel });
    },
  });
};

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { redeemTicket } from '../api/ticketsApi';

export const useRedeemTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: redeemTicket,
    onSuccess: () => {
      // Refresh the "My Tickets" list so the new ticket shows up
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
    },
  });
};

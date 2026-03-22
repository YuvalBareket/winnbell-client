import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activateFreeTicket, getFreeTicketStatus } from '../api/ticketsApi';

export const useFreeTicket = () => {
  const queryClient = useQueryClient();

  const statusQuery = useQuery({
    queryKey: ['freeTicketStatus'], // Key identifies the "current user" implicitly
    queryFn: getFreeTicketStatus,
  });

  const activateMutation = useMutation({
    mutationFn: activateFreeTicket,
    onSuccess: () => {
      // Refresh the status and any ticket lists
      queryClient.invalidateQueries({ queryKey: ['freeTicketStatus'] });
      queryClient.invalidateQueries({ queryKey: ['userTickets'] });
    },
  });

  return {
    status: statusQuery.data,
    isLoading: statusQuery.isLoading,
    activate: activateMutation.mutate,
    isActivating: activateMutation.isPending,
  };
};

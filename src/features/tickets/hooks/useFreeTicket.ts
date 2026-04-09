import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activateFreeTicket, getFreeTicketStatus } from '../api/ticketsApi';
import { queryKeys } from '../../../shared/constants/queryKeys';

export const useFreeTicket = () => {
  const queryClient = useQueryClient();

  const statusQuery = useQuery({
    queryKey: queryKeys.tickets.freeStatus,
    queryFn: getFreeTicketStatus,
    staleTime: 30_000,
  });

  const activateMutation = useMutation({
    mutationFn: activateFreeTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.freeStatus });
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
    },
  });

  return {
    status: statusQuery.data,
    isLoading: statusQuery.isLoading,
    activate: activateMutation.mutate,
    isActivating: activateMutation.isPending,
  };
};

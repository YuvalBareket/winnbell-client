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
      // tickets.all (['tickets']) prefix-matches riskLevel, mine, freeStatus — one call covers all
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
    },
  });

  return {
    status: statusQuery.data,
    isLoading: statusQuery.isLoading,
    activate: activateMutation.mutate,
    activateAsync: activateMutation.mutateAsync,
    isActivating: activateMutation.isPending,
  };
};

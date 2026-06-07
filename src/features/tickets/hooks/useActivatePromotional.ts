import { useMutation, useQueryClient } from '@tanstack/react-query';
import { activatePromotionalEntry } from '../api/ticketsApi';
import { queryKeys } from '../../../shared/constants/queryKeys';

export const useActivatePromotional = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => activatePromotionalEntry(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
    },
  });
};

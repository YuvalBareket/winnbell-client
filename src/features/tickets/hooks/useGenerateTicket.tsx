import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateBusinessTicket } from '../api/ticketsApi';
import { queryKeys } from '../../../shared/constants/queryKeys';

export const useGenerateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (locationId: number) => generateBusinessTicket(locationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.business.activity });
    },
    onError: (error: unknown) => {
      console.error('Issue Error:', error);
    },
  });
};

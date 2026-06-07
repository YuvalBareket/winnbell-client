import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteLocation } from '../api/business.api';
import { queryKeys } from '../../../shared/constants/queryKeys';

export const useRemoveLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (locationId: number) => deleteLocation(locationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.business.myDetails });
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.all });
    },
  });
};

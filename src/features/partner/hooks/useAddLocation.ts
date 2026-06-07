import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addLocation } from '../api/business.api';
import { queryKeys } from '../../../shared/constants/queryKeys';
import type { UpdateLocationInput } from '../types/business.types';

export const useAddLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateLocationInput) => addLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.business.myDetails });
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.all });
    },
  });
};

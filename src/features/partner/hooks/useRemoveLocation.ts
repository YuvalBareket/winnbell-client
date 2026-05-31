import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteLocation } from '../api/business.api';

export const useRemoveLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (locationId: number) => deleteLocation(locationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business', 'my-details'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
};

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateLocation } from '../api/business.api';
import type { UpdateLocationInput } from '../types/business.types';

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ locationId, data }: { locationId: number; data: UpdateLocationInput }) =>
      updateLocation(locationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business', 'my-details'] });
    },
  });
};

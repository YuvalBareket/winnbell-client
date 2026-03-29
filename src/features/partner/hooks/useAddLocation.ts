import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addLocation } from '../api/business.api';
import type { UpdateLocationInput } from '../types/business.types';

export const useAddLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateLocationInput) => addLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business', 'my-details'] });
    },
  });
};

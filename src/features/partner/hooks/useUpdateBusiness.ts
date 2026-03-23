import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateBusiness } from '../api/business.api';
import type { UpdateBusinessInput } from '../types/business.types';

export const useUpdateBusiness = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBusinessInput) => updateBusiness(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business', 'my-details'] });
    },
  });
};

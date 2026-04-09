import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBusinesses, generateTickets } from '../api/adminApi';
import { queryKeys } from '../../../shared/constants/queryKeys';

export const useAdminBusinesses = () => {
  return useQuery({
    queryKey: queryKeys.admin.businesses,
    queryFn: async () => {
      const { data } = await fetchBusinesses();
      return data;
    },
    staleTime: 2 * 60_000,
  });
};

export const useGenerateTickets = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateTickets,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.businesses });
    },
  });
};

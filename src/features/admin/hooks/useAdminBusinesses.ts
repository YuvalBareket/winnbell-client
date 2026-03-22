import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBusinesses, generateTickets } from '../api/adminApi';

export const useAdminBusinesses = () => {
  return useQuery({
    queryKey: ['admin', 'businesses'],
    queryFn: async () => {
      const { data } = await fetchBusinesses();
      return data;
    },
  });
};

export const useGenerateTickets = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateTickets,
    onSuccess: () => {
      // Invalidate and refetch so the table stats update immediately
      queryClient.invalidateQueries({ queryKey: ['admin', 'businesses'] });
    },
  });
};

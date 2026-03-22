import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchBusinesses,
  fetchActiveDraws,
  generateTickets,
  createBusiness,
  fetchAllDraws,
  createDraw,
} from '../api/adminApi';

export const useAdminBusinesses = () => {
  return useQuery({
    queryKey: ['admin', 'businesses'],
    queryFn: async () => {
      const { data } = await fetchBusinesses();
      return data;
    },
  });
};

export const useActiveDraws = () => {
  return useQuery({
    queryKey: ['admin', 'draws'],
    queryFn: async () => {
      const { data } = await fetchActiveDraws();
      return data;
    },
  });
};

export const useGenerateTickets = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateTickets,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'businesses'] });
    },
  });
};
export const useCreateBusiness = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBusiness,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'businesses'] });
    },
  });
};
export const useAllDraws = () => {
  return useQuery({
    queryKey: ['admin', 'draws-all'],
    queryFn: async () => {
      const { data } = await fetchAllDraws();
      return data;
    },
  });
};

export const useCreateDraw = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDraw,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'draws-all'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'draws'] }); // Also refresh the dropdown list
    },
  });
};

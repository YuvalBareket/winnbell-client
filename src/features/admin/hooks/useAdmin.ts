import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchBusinesses,
  fetchActiveDraws,
  generateTickets,
  createBusiness,
  fetchAllDraws,
  createDraw,
  openDraw,
  closeDraw,
  pickWinner,
  fetchAdminOverview,
  fetchAllUsers,
  updateUserRole,
  toggleUserActive,
} from '../api/adminApi';
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

export const useActiveDraws = () => {
  return useQuery({
    queryKey: queryKeys.admin.draws,
    queryFn: async () => {
      const { data } = await fetchActiveDraws();
      return data;
    },
    staleTime: 30_000,
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

export const useCreateBusiness = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBusiness,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.businesses });
    },
  });
};

export const useAllDraws = () => {
  return useQuery({
    queryKey: queryKeys.admin.drawsAll,
    queryFn: async () => {
      const { data } = await fetchAllDraws();
      return data;
    },
    staleTime: 30_000,
  });
};

export const useCreateDraw = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDraw,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.drawsAll });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.draws });
      queryClient.invalidateQueries({ queryKey: queryKeys.draws.all });
    },
  });
};

export const useOpenDraw = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (drawId: number) => openDraw(drawId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.drawsAll });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.draws });
      queryClient.invalidateQueries({ queryKey: queryKeys.draws.all });
    },
  });
};

export const useCloseDraw = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (drawId: number) => closeDraw(drawId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.drawsAll });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.draws });
      queryClient.invalidateQueries({ queryKey: queryKeys.draws.all });
    },
  });
};

export const usePickWinner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (drawId: number) => pickWinner(drawId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.drawsAll });
      queryClient.invalidateQueries({ queryKey: queryKeys.draws.all });
    },
  });
};

export const useAdminOverview = () => {
  return useQuery({
    queryKey: queryKeys.admin.overview,
    queryFn: async () => {
      const { data } = await fetchAdminOverview();
      return data;
    },
    staleTime: 2 * 60_000,
  });
};

export const useAdminUsers = () => {
  return useQuery({
    queryKey: queryKeys.admin.users,
    queryFn: async () => {
      const { data } = await fetchAllUsers();
      return data;
    },
    staleTime: 2 * 60_000,
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
    },
  });
};

export const useToggleUserActive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, is_active }: { userId: number; is_active: boolean }) =>
      toggleUserActive(userId, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
    },
  });
};

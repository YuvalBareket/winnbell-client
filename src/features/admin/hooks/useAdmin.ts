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
      queryClient.invalidateQueries({ queryKey: ['admin', 'draws'] });
    },
  });
};

export const useOpenDraw = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (drawId: number) => openDraw(drawId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'draws-all'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'draws'] });
    },
  });
};

export const useCloseDraw = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (drawId: number) => closeDraw(drawId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'draws-all'] });
    },
  });
};

export const usePickWinner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (drawId: number) => pickWinner(drawId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'draws-all'] });
    },
  });
};

export const useAdminOverview = () => {
  return useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: async () => {
      const { data } = await fetchAdminOverview();
      return data;
    },
  });
};

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data } = await fetchAllUsers();
      return data;
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

export const useToggleUserActive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, is_active }: { userId: number; is_active: boolean }) =>
      toggleUserActive(userId, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

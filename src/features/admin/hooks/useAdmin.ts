import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchBusinesses,
  fetchActiveDraws,
  createBusiness,
  fetchAllDraws,
  createDraw,
  openDraw,
  closeDraw,
  pickWinner,
  reopenDraw,
  fetchAdminOverview,
  fetchAllUsers,
  updateUserRole,
  toggleUserActive,
  fetchDrawBusinesses,
  fetchAdminAnalytics,
  fetchLocationBreakdown,
  setUserRiskScore,
  fetchPlatformSettings,
  savePlatformSettings,
  updateDraw,
  deleteDraw,
  fetchUserDetail,
  fetchEntryVolume,
  fetchCampaignComparison,
  duplicateDraw,
} from '../api/adminApi';
import type { AdminAnalytics, AdminUsersPage, BusinessStatsPage, LocationBreakdownPage, UpdateDrawInput } from '../types/admin.types';
import { queryKeys } from '../../../shared/constants/queryKeys';

export const useAdminBusinesses = (params: { page: number; limit: number; search: string }) => {
  return useQuery({
    queryKey: [queryKeys.admin.businesses, params],
    queryFn: async () => {
      const { data } = await fetchBusinesses({
        page: params.page,
        limit: params.limit,
        search: params.search || undefined,
      });
      return data as BusinessStatsPage;
    },
    staleTime: 2 * 60_000,
    placeholderData: (prev) => prev,
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

export const useReopenDraw = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (drawId: number) => reopenDraw(drawId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.drawsAll });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.draws });
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

export const useAdminUsers = (params: {
  page: number;
  limit: number;
  search: string;
  role: string;
  riskLevel: string;
}) => {
  return useQuery({
    queryKey: [...queryKeys.admin.users, params],
    queryFn: async () => {
      const { data } = await fetchAllUsers({
        page: params.page,
        limit: params.limit,
        search: params.search || undefined,
        role: params.role || undefined,
        riskLevel: params.riskLevel || undefined,
      });
      return data as AdminUsersPage;
    },
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });
};

export const useSetUserRisk = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, riskScore }: { userId: number; riskScore: number }) =>
      setUserRiskScore(userId, riskScore),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.overview });
      queryClient.invalidateQueries({ queryKey: ['admin', 'user-detail', userId] });
    },
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

export const useDrawBusinesses = (drawId: number | null) => {
  return useQuery({
    queryKey: ['admin', 'draw-businesses', drawId],
    queryFn: async () => {
      const { data } = await fetchDrawBusinesses(drawId!);
      return data as Array<{
        id: number; name: string; sector: string; logo_url: string | null;
        fee_at_entry: number; contribution_amount: number; joined_at: string;
      }>;
    },
    enabled: drawId !== null,
    staleTime: 60_000,
  });
};

export const useToggleUserActive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, is_active }: { userId: number; is_active: boolean }) =>
      toggleUserActive(userId, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.overview });
    },
  });
};

export const useAdminAnalytics = (businessId?: number | null, drawId?: number | null) => {
  return useQuery({
    queryKey: ['admin', 'analytics', businessId ?? null, drawId ?? null],
    queryFn: async () => {
      const { data } = await fetchAdminAnalytics(businessId, drawId);
      return data as AdminAnalytics;
    },
    staleTime: 5 * 60_000,
  });
};

export const usePlatformSettings = () => {
  return useQuery({
    queryKey: ['admin', 'platform-settings'],
    queryFn: async () => {
      const { data } = await fetchPlatformSettings();
      return data;
    },
    staleTime: 60_000,
  });
};

export const useSavePlatformSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { global_entry_cap: number | null; allowed_states: string[] }) =>
      savePlatformSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'platform-settings'] });
    },
  });
};

export const useLocationBreakdown = (params: {
  businessId?: number | null;
  search: string;
  page: number;
  limit: number;
}) => {
  return useQuery({
    queryKey: ['admin', 'locations', params.businessId ?? null, params.search, params.page, params.limit],
    queryFn: async () => {
      const { data } = await fetchLocationBreakdown(params);
      return data as LocationBreakdownPage;
    },
    staleTime: 2 * 60_000,
    placeholderData: (prev) => prev,
  });
};

export const useUpdateDraw = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ drawId, data }: { drawId: number; data: UpdateDrawInput }) =>
      updateDraw(drawId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.drawsAll });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.draws });
    },
  });
};

export const useDeleteDraw = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (drawId: number) => deleteDraw(drawId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.drawsAll });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.draws });
    },
  });
};

export const useUserDetail = (userId: number | null) => {
  return useQuery({
    queryKey: ['admin', 'user-detail', userId],
    queryFn: async () => {
      const { data } = await fetchUserDetail(userId!);
      return data as { user: any; entries: any[] };
    },
    enabled: userId !== null,
    staleTime: 30_000,
  });
};

export const useEntryVolume = (drawId?: number | null, businessId?: number | null) => {
  return useQuery({
    queryKey: ['admin', 'entry-volume', drawId ?? null, businessId ?? null],
    queryFn: async () => {
      const { data } = await fetchEntryVolume({ drawId, businessId });
      return data as { date: string; count: number }[];
    },
    staleTime: 2 * 60_000,
  });
};

export const useCampaignComparison = () => {
  return useQuery({
    queryKey: ['admin', 'campaign-comparison'],
    queryFn: async () => {
      const { data } = await fetchCampaignComparison();
      return data as {
        id: number; name: string; status: string; prize_amount: number;
        draw_date: string; total_entries: number; quarantined: number; business_count: number;
      }[];
    },
    staleTime: 2 * 60_000,
  });
};

export const useDuplicateDraw = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (drawId: number) => duplicateDraw(drawId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.drawsAll });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.draws });
    },
  });
};

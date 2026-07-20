import { useQuery, useInfiniteQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  fetchBusinesses,
  fetchActiveDraws,
  createBusiness,
  fetchAllDraws,
  createDraw,
  openDraw,
  closeDraw,
  pickWinner,
  confirmWinner,
  reopenDraw,
  setDrawPrizeRevealed,
  fetchDrawCandidate,
  fetchDrawRejectedWinners,
  fetchDrawAuditLog,
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
  addBusinessToDraw,
  removeBusinessFromDraw,
  fetchBusinessDetail,
  fetchBusinessEntries,
  adminImageDecision,
  sendNotification,
  fetchNotificationHistory,
  fetchGrowthAnalytics,
} from '../api/adminApi';
import type { AdminAnalytics, AdminUsersPage, BusinessStatsPage, LocationBreakdownPage, UpdateDrawInput, GrowthAnalytics } from '../types/admin.types';
import { queryKeys } from '../../../shared/constants/queryKeys';

export const useAdminBusinesses = (params: { limit: number; search: string }) => {
  return useInfiniteQuery({
    queryKey: [...queryKeys.admin.businesses, params.limit, params.search],
    queryFn: async ({ pageParam }) => {
      const { data } = await fetchBusinesses({
        page: pageParam as number,
        limit: params.limit,
        search: params.search || undefined,
      });
      return data as BusinessStatsPage;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    staleTime: 2 * 60_000,
    placeholderData: keepPreviousData,
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
    mutationFn: ({ drawId, applyPenalty = false, reason }: { drawId: number; applyPenalty?: boolean; reason?: string }) =>
      pickWinner(drawId, applyPenalty, reason),
    onSuccess: (_, { drawId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.drawsAll });
      queryClient.invalidateQueries({ queryKey: queryKeys.draws.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.drawCandidate(drawId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.drawRejected(drawId) });
    },
  });
};

export const useConfirmWinner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (drawId: number) => confirmWinner(drawId),
    onSuccess: (_, drawId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.drawsAll });
      queryClient.invalidateQueries({ queryKey: queryKeys.draws.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.drawCandidate(drawId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.draws.result(drawId) });
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

export const useSetDrawPrizeRevealed = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ drawId, revealed }: { drawId: number; revealed: boolean }) =>
      setDrawPrizeRevealed(drawId, revealed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.drawsAll });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.draws });
      // Public hub caches the masked prize - refresh so a reveal shows up immediately.
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
  limit: number;
  search: string;
  role: string;
  riskLevel: string;
}) => {
  return useInfiniteQuery({
    queryKey: [...queryKeys.admin.users, params.limit ?? null, params.search ?? '', params.role ?? '', params.riskLevel ?? ''],
    queryFn: async ({ pageParam }) => {
      const { data } = await fetchAllUsers({
        page: pageParam as number,
        limit: params.limit,
        search: params.search || undefined,
        role: params.role || undefined,
        riskLevel: params.riskLevel || undefined,
      });
      return data as AdminUsersPage;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: AdminUsersPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
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
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.userDetail(userId) });
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

type DrawBusinessRow = {
  id: number; name: string; sector: string; logo_url: string | null;
  fee_at_entry: number; joined_at: string;
};

type DrawBusinessesPage = { rows: DrawBusinessRow[]; total: number };

export const useDrawBusinesses = (drawId: number | null, search = '', sector = '') => {
  return useInfiniteQuery({
    queryKey: queryKeys.admin.drawBusinesses(drawId, search, sector),
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await fetchDrawBusinesses(drawId!, pageParam as number, search, sector);
      return data as DrawBusinessesPage;
    },
    getNextPageParam: (lastPage, allPages) => {
      const fetched = allPages.reduce((sum, p) => sum + p.rows.length, 0);
      return fetched < lastPage.total ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: drawId !== null,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
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
    queryKey: queryKeys.admin.analytics(businessId ?? null, drawId ?? null),
    queryFn: async () => {
      const { data } = await fetchAdminAnalytics(businessId, drawId);
      return data as AdminAnalytics;
    },
    staleTime: 5 * 60_000,
  });
};

export const usePlatformSettings = () => {
  return useQuery({
    queryKey: queryKeys.admin.platformSettings,
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
    mutationFn: (data: {
      global_entry_cap: number | null;
      allowed_states: string[];
      founding_member_cap?: number;
      founding_phase_active?: boolean;
    }) => savePlatformSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.platformSettings });
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
    queryKey: queryKeys.admin.locations(params.businessId, params.search, params.page, params.limit),
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

// Minimal types for the fields actually consumed by UserDetailDrawer
type AdminUserDetail = {
  id: number;
  full_name: string | null;
  email: string;
  role: string;
  is_active: boolean;
  is_email_verified: boolean;
  risk_score: number;
  risk_flags: string[];
  risk_last_flagged_at: string | null;
  business_name: string | null;
  created_at: string;
  [key: string]: unknown;
};

type AdminUserEntry = {
  id: number;
  draw_name: string | null;
  business_name: string | null;
  entry_source: string;
  activated_at: string | null;
  is_quarantined: boolean;
  quarantine_reason: string | null;
  receipt_image_url: string | null;
  image_validation_status: string | null;
  risk_score_delta: number;
  risk_flags: string[];
  [key: string]: unknown;
};

export const useUserDetail = (userId: number | null) => {
  return useQuery({
    queryKey: queryKeys.admin.userDetail(userId),
    queryFn: async () => {
      const { data } = await fetchUserDetail(userId!);
      return data as { user: AdminUserDetail; entries: AdminUserEntry[] };
    },
    enabled: userId !== null,
    staleTime: 30_000,
  });
};

export const useEntryVolume = (drawId?: number | null, businessId?: number | null) => {
  return useQuery({
    queryKey: queryKeys.admin.entryVolume(drawId, businessId),
    queryFn: async () => {
      const { data } = await fetchEntryVolume({ drawId, businessId });
      return data as { date: string; count: number }[];
    },
    staleTime: 2 * 60_000,
  });
};

export const useCampaignComparison = () => {
  return useQuery({
    queryKey: queryKeys.admin.campaignComparison,
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

export const useAddBusinessToDraw = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ drawId, businessId }: { drawId: number; businessId: number }) =>
      addBusinessToDraw(drawId, businessId),
    onSuccess: (_, { drawId }) => {
      // Prefix-invalidate all variants of draw-businesses for this drawId
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.drawBusinessesAll(drawId) });
    },
  });
};

export const useRemoveBusinessFromDraw = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ drawId, businessId }: { drawId: number; businessId: number }) =>
      removeBusinessFromDraw(drawId, businessId),
    onSuccess: (_, { drawId }) => {
      // Prefix-invalidate all variants of draw-businesses for this drawId
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.drawBusinessesAll(drawId) });
    },
  });
};

export const useAdminImageDecision = (onSettled?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, decision }: { ticketId: number; decision: 'approve' | 'reject' }) =>
      adminImageDecision(ticketId, decision),
    onSuccess: () => {
      // Prefix-invalidate all user-detail and business-detail variants (no id = broad match)
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.userDetailAll });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.businessDetailAll });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
      onSettled?.();
    },
  });
};

// Minimal types for the fields actually consumed by BusinessDetailDrawer
type AdminBusinessDetail = {
  name: string;
  sector: string;
  description: string | null;
  logo_url: string | null;
  subscription_status: string | null;
  in_open_draw: boolean;
  fee_at_entry: number | null;
  entries_per_location: number | null;
  min_transaction_amount: number | null;
  created_at: string;
  owner_name: string | null;
  owner_email: string | null;
  owner_is_active: boolean;
  owner_risk_score: number;
  owner_risk_flags: string[];
  [key: string]: unknown;
};

type AdminBusinessLocation = {
  id: number;
  name: string;
  address: string | null;
  is_active: boolean;
  activated_tickets: number;
  quarantined_tickets: number;
  [key: string]: unknown;
};

type AdminBusinessEntry = {
  id: number;
  draw_name: string | null;
  user_name: string | null;
  user_email: string | null;
  location_name: string | null;
  location_id: number | null;
  entry_source: string;
  transaction_amount: number | null;
  activated_at: string | null;
  is_quarantined: boolean;
  quarantine_reason: string | null;
  receipt_image_url: string | null;
  image_validation_status: string | null;
  risk_score_delta: number;
  [key: string]: unknown;
};

export const useBusinessDetail = (businessId: number | null) => {
  return useQuery({
    queryKey: queryKeys.admin.businessDetail(businessId),
    queryFn: async () => {
      const { data } = await fetchBusinessDetail(businessId!);
      return data as {
        business: AdminBusinessDetail;
        locations: AdminBusinessLocation[];
        campaignSummary: { draw_id: number; draw_name: string; count: number; quarantined: number }[];
      };
    },
    enabled: businessId !== null,
    staleTime: 30_000,
  });
};

export const useBusinessEntries = (businessId: number | null, drawId: number | null, page: number) => {
  return useQuery({
    queryKey: queryKeys.admin.businessEntries(businessId, drawId, page),
    queryFn: async () => {
      const { data } = await fetchBusinessEntries(businessId!, drawId, page);
      return data as { rows: AdminBusinessEntry[]; total: number };
    },
    enabled: businessId !== null,
    staleTime: 30_000,
  });
};

export const useSendNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; body: string; url?: string; audience: 'all' | 'users' | 'businesses' }) =>
      sendNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.notificationHistory });
    },
  });
};

export const useNotificationHistory = () => {
  return useQuery({
    queryKey: queryKeys.admin.notificationHistory,
    queryFn: async () => {
      const { data } = await fetchNotificationHistory();
      return data as {
        id: number;
        title: string;
        body: string;
        url: string | null;
        audience: 'all' | 'users' | 'businesses';
        sent_count: number;
        created_at: string;
      }[];
    },
    staleTime: 60_000,
  });
};

export const useDrawCandidate = (drawId: number | null) => {
  return useQuery({
    queryKey: queryKeys.admin.drawCandidate(drawId),
    queryFn: async () => {
      const { data } = await fetchDrawCandidate(drawId!);
      return data;
    },
    enabled: drawId !== null,
    staleTime: 10_000,
  });
};

export const useDrawRejectedWinners = (drawId: number | null) => {
  return useQuery({
    queryKey: queryKeys.admin.drawRejected(drawId),
    queryFn: async () => {
      const { data } = await fetchDrawRejectedWinners(drawId!);
      return data as {
        id: number;
        rejectedAt: string;
        riskPenalty: number;
        reason: string | null;
        ticketId: number;
        ticketCode: string;
        receiptIdentifier: string | null;
        transactionAmount: number | null;
        transactionDate: string | null;
        receiptImageUrl: string | null;
        entrySource: string | null;
        userId: number;
        userName: string;
        userEmail: string;
        userRiskScore: number;
        businessName: string | null;
        locationName: string | null;
      }[];
    },
    enabled: drawId !== null,
    staleTime: 10_000,
  });
};

export const useDrawAuditLog = (drawId: number | null) => {
  return useQuery({
    queryKey: queryKeys.admin.drawAudit(drawId),
    queryFn: async () => {
      const { data } = await fetchDrawAuditLog(drawId!);
      return data as { id: number; action: string; metadata: unknown; created_at: string }[];
    },
    enabled: drawId !== null,
    staleTime: 10_000,
  });
};

export const useGrowthAnalytics = () => {
  return useQuery({
    queryKey: queryKeys.admin.growthAnalytics,
    queryFn: async () => {
      const { data } = await fetchGrowthAnalytics();
      return data as GrowthAnalytics;
    },
    staleTime: 2 * 60_000,
  });
};

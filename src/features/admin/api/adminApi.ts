import { api } from '../../../shared/api/client';
import type {
  AdminUsersPage,
  BusinessStatsPage,
  CreateDrawInput,
  Draw,
  UpdateDrawInput,
  GrowthAnalytics,
  BusinessHealthSummary,
} from '../types/admin.types';

export const fetchBusinesses = (params: { page: number; limit: number; search?: string; filter?: string; excludeDrawId?: number }) =>
  api.get<BusinessStatsPage>('/admin/businesses', { params });
export const fetchHealthSummary = () =>
  api.get<BusinessHealthSummary>('/admin/businesses/health-summary');
export const fetchActiveDraws = () => api.get<Draw[]>('/admin/draws');
export const fetchAllDraws = () => api.get<Draw[]>('/admin/draws-all');
export const createDraw = (data: CreateDrawInput) =>
  api.post('/admin/draw', data);
export const openDraw = (drawId: number) =>
  api.post(`/admin/draws/${drawId}/open`);
export const closeDraw = (drawId: number) =>
  api.post(`/admin/draws/${drawId}/close`);
export const pickWinner = (drawId: number, applyPenalty = false, reason?: string) =>
  api.post(`/admin/draws/${drawId}/pick-winner`, { applyPenalty, reason });
export const fetchDrawCandidate = (drawId: number) =>
  api.get(`/admin/draws/${drawId}/candidate`);
export const fetchDrawRejectedWinners = (drawId: number) =>
  api.get(`/admin/draws/${drawId}/rejected-winners`);
export const fetchDrawAuditLog = (drawId: number) =>
  api.get(`/admin/draws/${drawId}/audit-log`);
export const confirmWinner = (drawId: number) =>
  api.post(`/admin/draws/${drawId}/confirm-winner`);
export const reopenDraw = (drawId: number) =>
  api.post(`/admin/draws/${drawId}/reopen`);
export const setDrawPrizeRevealed = (drawId: number, revealed: boolean) =>
  api.patch(`/admin/draws/${drawId}/prize-reveal`, { revealed });
export const fetchAdminOverview = () => api.get('/admin/overview');
export const fetchAllUsers = (params: {
  page: number;
  limit: number;
  search?: string;
  role?: string;
  riskLevel?: string;
}) => api.get<AdminUsersPage>('/admin/users', { params });
export const setUserRiskScore = async (userId: number, riskScore: number): Promise<void> => {
  await api.patch(`/admin/users/${userId}/risk`, { risk_score: riskScore });
};
export const updateUserRole = (userId: number, role: string) =>
  api.patch(`/admin/users/${userId}/role`, { role });
export const toggleUserActive = (userId: number, is_active: boolean) =>
  api.patch(`/admin/users/${userId}/active`, { is_active });
export const fetchDrawBusinesses = (drawId: number, page = 1, search = '', sector = '') =>
  api.get(`/admin/draws/${drawId}/businesses`, {
    params: { page, limit: 25, search: search || undefined, sector: sector || undefined },
  });
export const fetchAdminAnalytics = (businessId?: number | null, drawId?: number | null) =>
  api.get('/admin/analytics', {
    params: {
      ...(businessId ? { businessId } : {}),
      ...(drawId ? { drawId } : {}),
    },
  });

export const fetchLocationBreakdown = (params: {
  businessId?: number | null;
  search?: string;
  page: number;
  limit: number;
}) => {
  const { businessId, search, page, limit } = params;
  return api.get('/admin/analytics/locations', {
    params: {
      ...(businessId ? { businessId } : {}),
      ...(search ? { search } : {}),
      page,
      limit,
    },
  });
};

export const fetchPlatformSettings = () =>
  api.get<{
    global_entry_cap: number | null;
    allowed_states: string[];
    founding_member_cap: number;
    founding_phase_active: boolean;
  }>('/admin/settings');

export const savePlatformSettings = (data: {
  global_entry_cap: number | null;
  allowed_states: string[];
  founding_member_cap?: number;
  founding_phase_active?: boolean;
}) => api.patch('/admin/settings', data);

export const updateDraw = (drawId: number, data: UpdateDrawInput) =>
  api.patch(`/admin/draws/${drawId}`, data);

export const deleteDraw = (drawId: number) =>
  api.delete(`/admin/draws/${drawId}`);

export const fetchUserDetail = (userId: number) =>
  api.get(`/admin/users/${userId}`);

export const fetchEntryVolume = (params: { drawId?: number | null; businessId?: number | null }) =>
  api.get('/admin/analytics/entry-volume', {
    params: {
      ...(params.drawId ? { drawId: params.drawId } : {}),
      ...(params.businessId ? { businessId: params.businessId } : {}),
    },
  });

export const fetchCampaignComparison = () =>
  api.get('/admin/analytics/campaigns');

export const duplicateDraw = (drawId: number) =>
  api.post(`/admin/draws/${drawId}/duplicate`);

export const addBusinessToDraw = (drawId: number, businessId: number) =>
  api.post(`/admin/draws/${drawId}/businesses/${businessId}`);

export const removeBusinessFromDraw = (drawId: number, businessId: number) =>
  api.delete(`/admin/draws/${drawId}/businesses/${businessId}`);

export const fetchBusinessDetail = (businessId: number) =>
  api.get(`/admin/businesses/${businessId}`);

export const adminImageDecision = (ticketId: number, decision: 'approve' | 'reject') =>
  api.patch(`/admin/tickets/${ticketId}/image-decision`, { decision });

export const fetchBusinessEntries = (businessId: number, drawId: number | null, page: number) =>
  api.get(`/admin/businesses/${businessId}/entries`, {
    params: { drawId: drawId ?? undefined, page, limit: 50 },
  });

export const sendNotification = (data: { title: string; body: string; url?: string; audience: 'all' | 'users' | 'businesses' }) =>
  api.post('/admin/notifications/send', data);

export const fetchNotificationHistory = () =>
  api.get('/admin/notifications/history');

export const fetchGrowthAnalytics = () =>
  api.get<GrowthAnalytics>('/admin/analytics/growth');

// Admin business view (read-only dashboard): active locations for the filter dropdowns.
// Derived from the business detail endpoint - the server has no dedicated /locations route.
export const fetchAdminBusinessLocations = (businessId: number) =>
  api
    .get<{ locations?: Array<{ id: number; name: string; is_active: boolean }> }>(`/admin/businesses/${businessId}`)
    .then((r) => (r.data.locations ?? []).filter((l) => l.is_active).map(({ id, name }) => ({ id, name })));

import { api } from '../../../shared/api/client';
import type {
  AdminUsersPage,
  BusinessStatsPage,
  CreateBusinessInput,
  CreateDrawInput,
  Draw,
  UpdateDrawInput,
} from '../types/admin.types';

export const fetchBusinesses = (params: { page: number; limit: number; search?: string }) =>
  api.get<BusinessStatsPage>('/admin/businesses', { params });
export const fetchActiveDraws = () => api.get<Draw[]>('/admin/draws');
export const createBusiness = (data: CreateBusinessInput) =>
  api.post('/admin/business', data);
export const fetchAllDraws = () => api.get<Draw[]>('/admin/draws-all');
export const createDraw = (data: CreateDrawInput) =>
  api.post('/admin/draw', data);
export const openDraw = (drawId: number) =>
  api.post(`/admin/draws/${drawId}/open`);
export const closeDraw = (drawId: number) =>
  api.post(`/admin/draws/${drawId}/close`);
export const pickWinner = (drawId: number) =>
  api.post(`/admin/draws/${drawId}/pick-winner`);
export const reopenDraw = (drawId: number) =>
  api.post(`/admin/draws/${drawId}/reopen`);
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
export const fetchDrawBusinesses = (drawId: number) =>
  api.get(`/admin/draws/${drawId}/businesses`);
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

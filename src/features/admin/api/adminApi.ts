import { api } from '../../../shared/api/client';
import type {
  AdminUser,
  BusinessStats,
  CreateBusinessInput,
  CreateDrawInput,
  Draw,
  TicketBatchRequest,
} from '../types/admin.types';

export const fetchBusinesses = () =>
  api.get<BusinessStats[]>('/admin/businesses');
export const fetchActiveDraws = () => api.get<Draw[]>('/admin/draws');
export const generateTickets = (data: TicketBatchRequest) =>
  api.post('/admin/generate-tickets', data);
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
export const fetchAllUsers = () => api.get<AdminUser[]>('/admin/users');
export const setUserRiskScore = async (userId: number, riskScore: number): Promise<void> => {
  await api.patch(`/admin/users/${userId}/risk`, { risk_score: riskScore });
};
export const updateUserRole = (userId: number, role: string) =>
  api.patch(`/admin/users/${userId}/role`, { role });
export const toggleUserActive = (userId: number, is_active: boolean) =>
  api.patch(`/admin/users/${userId}/active`, { is_active });
export const fetchDrawBusinesses = (drawId: number) =>
  api.get(`/admin/draws/${drawId}/businesses`);
export const fetchAdminAnalytics = (businessId?: number | null) =>
  api.get('/admin/analytics', { params: businessId ? { businessId } : undefined });

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
  api.get<{ global_entry_cap: number | null; allowed_states: string[] }>('/admin/settings');

export const savePlatformSettings = (data: { global_entry_cap: number | null; allowed_states: string[] }) =>
  api.patch('/admin/settings', data);

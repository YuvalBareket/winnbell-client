import { api } from '../../../shared/api/client';
import type {
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

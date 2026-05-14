import { api } from '../../../shared/api/client';
import type { ITicket } from '../types/myTicket.types';

export interface MyTicketsResponse {
  tickets: ITicket[];
  effectiveCount: number;
  totalCount?: number;
  cap?: number | null;
  perLocationCap?: number | null;
  activeLocationCount?: number;
}

export const getMyTickets = async (
  draw_id: number,
  location_id?: number,
): Promise<MyTicketsResponse> => {
  const params: Record<string, unknown> = { draw_id };
  if (location_id !== undefined) params.location_id = location_id;
  const { data } = await api.get('/tickets/my-tickets/', { params });
  return data;
};

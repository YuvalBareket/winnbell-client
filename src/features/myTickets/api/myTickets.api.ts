import { api } from '../../../shared/api/client';
import type { ITicket } from '../types/myTicket.types';

export interface MyTicketsResponse {
  tickets: ITicket[];
  effectiveCount: number;
}

export const getMyTickets = async (
  draw_id: number,
): Promise<MyTicketsResponse> => {
  const { data } = await api.get(`/tickets/my-tickets/?draw_id=${draw_id}`);
  return data;
};

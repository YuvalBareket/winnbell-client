import { api } from '../../../shared/api/client';
import type { ITicket } from '../types/myTicket.types';

export const getMyTickets = async (
  draw_id: number,
): Promise<{
  tickets: ITicket[];
}> => {
  const { data } = await api.get(`/tickets/my-tickets/?draw_id=${draw_id}`);
  return data;
};

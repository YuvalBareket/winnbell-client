import { api } from '../../../shared/api/client';

export const redeemTicket = async (code: string) => {
  const { data } = await api.post('/tickets/redeem', { code });
  return data;
};
export const activateFreeTicket = async () => {
  const { data } = await api.post('/tickets/activate-free');
  return data;
};

export const getFreeTicketStatus = async () => {
  const { data } = await api.get(`/tickets/free-status`);
  return data; // Should return { canActivate: boolean, nextAvailableDate: string }
};
export const generateBusinessTicket = async (locationId: number): Promise<{ success: boolean; code: string }> => {
  const response = await api.post<{ success: boolean; code: string }>('/tickets/generate', {
    location_id: locationId,
  });
  return response.data;
};

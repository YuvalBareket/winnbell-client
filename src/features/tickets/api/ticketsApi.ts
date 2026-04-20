import { api } from '../../../shared/api/client';
import type { EntryMode } from '../../partner/types/business.types';

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
  return data;
};

export const generateBusinessTicket = async (locationId: number): Promise<{ success: boolean; code: string }> => {
  const response = await api.post<{ success: boolean; code: string }>('/tickets/generate', {
    location_id: locationId,
  });
  return response.data;
};

export interface ParticipatingBusiness {
  id: number;
  name: string;
  sector: string;
  logo_url: string | null;
  entry_mode: EntryMode;
}

export interface ParticipatingBusinessesResponse {
  entry_mode: EntryMode;
  businesses: ParticipatingBusiness[];
}

export const getParticipatingBusinesses = (): Promise<ParticipatingBusinessesResponse> =>
  api.get('/business/participating').then(r => r.data);

export interface ParticipatingLocation {
  location_id: number;
  location_name: string;
  address: string;
  business_id: number;
  business_name: string;
  sector: string;
  logo_url: string | null;
}

export const searchParticipatingLocations = (q: string): Promise<ParticipatingLocation[]> =>
  api.get('/business/participating/locations/search', { params: { q } }).then(r => r.data);

export interface ReceiptEntryPayload {
  locationId: number;
  receiptIdentifier: string;
  transactionAmount: number;
  receiptImageUrl?: string;
  typingDurationMs?: number;
  receiptInputMethod?: 'typed' | 'pasted';
}

export interface ReceiptEntryResponse {
  success: boolean;
  ticketId: number;
  code: string;
}

export const submitReceiptEntry = (payload: ReceiptEntryPayload): Promise<ReceiptEntryResponse> =>
  api.post('/tickets/receipt-entry', payload).then(r => r.data);

export const getReceiptUploadUrl = (): Promise<{ uploadUrl: string; publicUrl: string }> =>
  api.get('/tickets/receipt-upload-url').then(r => r.data);

export interface RiskLevelResponse {
  requiresImage: boolean;
  isThrottled: boolean;
}

export const getMyRiskLevel = (): Promise<RiskLevelResponse> =>
  api.get('/tickets/my-risk-level').then(r => r.data);

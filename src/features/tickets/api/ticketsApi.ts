import { api } from '../../../shared/api/client';

export const activateFreeTicket = async () => {
  const { data } = await api.post('/tickets/activate-free');
  return data;
};

export interface FreeTicketStatusResponse {
  canActivate: boolean;
  reason?: string;
  nextAvailableDate?: string;
}

export const getFreeTicketStatus = async (): Promise<FreeTicketStatusResponse> => {
  const { data } = await api.get<FreeTicketStatusResponse>(`/tickets/free-status`);
  return data;
};

export interface ParticipatingLocation {
  location_id: number;
  location_name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  business_id: number;
  business_name: string;
  sector: string;
  logo_url: string | null;
  min_transaction_amount: number | null;
  receipt_example_image_url: string | null;
  cap_reached?: boolean;
}

export const searchParticipatingLocations = (q: string): Promise<ParticipatingLocation[]> =>
  api.get('/business/participating/locations/search', { params: { q } }).then(r => r.data);

export const fetchParticipatingLocationById = (locationId: number): Promise<ParticipatingLocation | null> =>
  api.get(`/business/participating/locations/${locationId}`).then(r => r.data).catch(() => null);

export interface ReceiptEntryPayload {
  locationId: number;
  receiptIdentifier: string;
  transactionAmount: number;
  transactionDate: string; // ISO date string (YYYY-MM-DD)
  receiptImageUrl?: string;
  typingDurationMs?: number;
  receiptInputMethod?: 'typed' | 'pasted' | 'scanned';
}

export interface ReceiptEntryResponse {
  success: boolean;
  ticketId: number;
  code: string;
  tickets: Array<{ ticketId: number; code: string }>;
  entryCount: number;
}

export const submitReceiptEntry = (payload: ReceiptEntryPayload): Promise<ReceiptEntryResponse> =>
  api.post('/tickets/receipt-entry', payload).then(r => r.data);

// Bounded so a stalled API request can't hang the upload flow (the R2 PUT that follows
// carries its own timeout in useUploadReceiptImage).
export const getReceiptUploadUrl = (size: number): Promise<{ uploadUrl: string; publicUrl: string }> =>
  api.get('/tickets/receipt-upload-url', { params: { size }, timeout: 15_000 }).then(r => r.data);

export interface ReceiptScanResult {
  ok: boolean;
  identifier: string | null;
  amount: number | null;
  date: string | null; // YYYY-MM-DD
}

// Reads an already-uploaded receipt photo and returns the form fields (autofill). Soft
// contract: unreadable photos come back { ok: false }, never an error status.
export const scanReceiptImage = (receiptImageUrl: string): Promise<ReceiptScanResult> =>
  api.post('/tickets/receipt-scan', { receiptImageUrl }).then(r => r.data);

export interface RiskLevelResponse {
  requiresImage: boolean;
  isThrottled: boolean;
  drawEntryCount: number;
  dailyCount: number;
  dailyLimit: number;
  isPhoneVerified: boolean;
  // Referred signup whose welcome entry has not been granted yet - it is granted at phone-verify
  // time, so the client prompts verification to claim it. (Location-flyer/QR signups no longer
  // earn a welcome entry, so this is always false for them.)
  welcomeBonusPending: boolean;
}

export const getMyRiskLevel = (): Promise<RiskLevelResponse> =>
  api.get<RiskLevelResponse>('/tickets/my-risk-level').then(r => r.data);

export const activatePromotionalEntry = (code: string): Promise<{ success: boolean; entryId: number; drawName: string }> =>
  api.post('/tickets/activate-promotional', { code }).then(r => r.data);

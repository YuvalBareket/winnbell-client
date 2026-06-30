import { api } from '../../../shared/api/client';

export interface CampaignHeaderData {
  has_campaign: boolean;
  campaign_name: string | null;
  prize_amount: number | null;
  draw_date: string | null;
  days_remaining: number | null;
  entries_used: number;
  entry_cap: number | null;
  cap_reached: boolean;
  needs_review_count: number;
}

export interface CampaignKpiData {
  entries: number;
  revenue: number;
  customers: number;
}

export type DateRange = 'today' | 'wtd' | 'mtd';

export interface CampaignEntry {
  ticket_id: number;
  location_name: string;
  customer_masked: string;
  transaction_amount: number | null;
  entry_source: string;
  status: 'active' | 'under_review';
  reviewable: boolean;
  created_at: string;
}

export interface CampaignEntriesResult {
  items: CampaignEntry[];
  next_cursor: number | null;
}

export const fetchCampaignHeader = async (locationId?: number): Promise<CampaignHeaderData> => {
  const params = locationId ? { location_id: locationId } : {};
  const res = await api.get<CampaignHeaderData>('/business/campaign/header', { params });
  return res.data;
};

export const fetchCampaignKpis = async (
  dateRange: DateRange,
  locationId?: number,
): Promise<CampaignKpiData> => {
  const params: any = { date_range: dateRange };
  if (locationId) params.location_id = locationId;
  const res = await api.get<CampaignKpiData>('/business/campaign/kpis', { params });
  return res.data;
};

export const fetchCampaignEntries = async (params: {
  location_id?: number;
  needs_review?: boolean;
  cursor?: number;
  limit?: number;
}): Promise<CampaignEntriesResult> => {
  const queryParams: any = {};
  if (params.location_id !== undefined) queryParams.location_id = params.location_id;
  if (params.needs_review !== undefined) queryParams.needs_review = params.needs_review;
  if (params.cursor !== undefined) queryParams.cursor = params.cursor;
  if (params.limit !== undefined) queryParams.limit = params.limit;

  const res = await api.get<CampaignEntriesResult>('/business/campaign/entries', {
    params: queryParams,
  });
  return res.data;
};

export const approveEntry = async (ticketId: number): Promise<void> => {
  await api.patch(`/business/tickets/${ticketId}/qualify`, { disqualify: false });
};

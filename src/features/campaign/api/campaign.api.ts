import { api } from '../../../shared/api/client';

export interface CampaignHeaderData {
  has_campaign: boolean;
  status?: string;
  campaign_name: string | null;
  prize_amount: number | null;
  start_date: string | null;
  draw_date: string | null;
  days_remaining: number | null;
  entries_used: number;
  entry_cap: number | null;
  cap_reached: boolean;
}

export interface CampaignListItem {
  draw_id: number;
  name: string;
  prize_amount: number;
  start_date: string;
  draw_date: string;
  status: string;
  is_current: boolean;
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
  receipt_identifier: string | null; // null for free/promo entries
  transaction_amount: number | null;
  entry_source: string;
  entry_count: number; // entries this submission granted (receipt over threshold can earn several)
  status: 'active' | 'under_review';
  created_at: string;
}

export interface CampaignEntriesResult {
  items: CampaignEntry[];
  next_cursor: string | null;
}

export const fetchCampaigns = async (): Promise<CampaignListItem[]> => {
  const res = await api.get<CampaignListItem[]>('/business/campaign/list');
  return res.data;
};

export const fetchCampaignHeader = async (locationId?: number, campaignId?: number): Promise<CampaignHeaderData> => {
  const params: Record<string, unknown> = {};
  if (locationId) params.location_id = locationId;
  if (campaignId != null) params.draw_id = campaignId;
  const res = await api.get<CampaignHeaderData>('/business/campaign/header', { params });
  return res.data;
};

export const fetchCampaignKpis = async (
  dateRange: DateRange,
  locationId?: number,
  campaignId?: number,
): Promise<CampaignKpiData> => {
  const params: Record<string, unknown> = { date_range: dateRange };
  if (locationId) params.location_id = locationId;
  if (campaignId != null) params.draw_id = campaignId;
  const res = await api.get<CampaignKpiData>('/business/campaign/kpis', { params });
  return res.data;
};

export const fetchCampaignEntries = async (params: {
  location_id?: number;
  cursor?: string;
  limit?: number;
  campaign_id?: number;
}): Promise<CampaignEntriesResult> => {
  const queryParams: Record<string, unknown> = {};
  if (params.location_id !== undefined) queryParams.location_id = params.location_id;
  if (params.cursor !== undefined) queryParams.cursor = params.cursor;
  if (params.limit !== undefined) queryParams.limit = params.limit;
  if (params.campaign_id !== undefined) queryParams.draw_id = params.campaign_id;

  const res = await api.get<CampaignEntriesResult>('/business/campaign/entries', {
    params: queryParams,
  });
  return res.data;
};

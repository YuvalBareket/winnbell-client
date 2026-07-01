import { api } from '../../../shared/api/client';

export type AnalyticsBucket = 'day' | 'month';
export type AnalyticsCategory = 'overview' | 'acquisition' | 'engagement' | 'revenue';

export interface AnalyticsSeriesPoint {
  bucket: string;
  entries: number;
  participants: number;
  revenue: number;
}

export interface AnalyticsAcquisitionSeriesPoint {
  bucket: string;
  new_users: number;
  profile_views: number;
}

// Each category endpoint returns ONLY its own KPIs + the series that section renders.
export interface OverviewResponse {
  total_participants: number;
  total_entries: number;
  avg_entries_per_participant: number;
  new_participants: number;
  returning_participants: number;
  new_pct: number;
  returning_pct: number;
  entry_cap: { used: number; cap: number | null; pct: number };
  draw_capacity: { draw_id: number; label: string; status: string; used: number; cap: number | null; pct: number }[];
  series: AnalyticsSeriesPoint[];
}

export interface AcquisitionResponse {
  new_users_acquired: number;
  business_discovery: number;
  profile_views: number;
  conversion_pct: number;
  acquisitionSeries: AnalyticsAcquisitionSeriesPoint[];
}

export interface EngagementResponse {
  repeat_participation_pct: number;
  avg_entries_per_user: number;
  returning_participant_count: number;
  loyal_customers: number;
  series: AnalyticsSeriesPoint[];
}

export interface RevenueResponse {
  total_qualifying_revenue: number;
  threshold: number;
  avg_purchase_amount: number;
  qualifying_receipts: number;
  series: AnalyticsSeriesPoint[];
}

export interface AnalyticsResponseMap {
  overview: OverviewResponse;
  acquisition: AcquisitionResponse;
  engagement: EngagementResponse;
  revenue: RevenueResponse;
}

export interface FetchAnalyticsParams {
  locationId?: number;
  from: string;
  to: string;
  bucket: AnalyticsBucket;
}

// One parameterized fetcher — the page calls it only for the active category.
export const fetchAnalyticsSection = async <C extends AnalyticsCategory>(
  category: C,
  { locationId, from, to, bucket }: FetchAnalyticsParams,
): Promise<AnalyticsResponseMap[C]> => {
  const params: Record<string, string | number> = { from, to, bucket };
  if (locationId !== undefined) params.locationId = locationId;
  const res = await api.get<AnalyticsResponseMap[C]>(`/business/analytics/${category}`, { params });
  return res.data;
};

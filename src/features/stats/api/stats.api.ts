import { api } from '../../../shared/api/client';

export interface StatsSummary {
  total_entries: number;
  total_revenue: number;
  avg_transaction: number;
}

export interface DailyDataPoint {
  date: string;
  entries: number;
  revenue: number;
}

export interface MonthlyDataPoint {
  month: string;     // "yyyy-MM"
  entries: number;
  revenue: number;
}

export interface LocationDataPoint {
  location_id: number;
  location_name: string;
  entries: number;
  revenue: number;
}

export interface DrawDataPoint {
  draw_id: number;
  draw_name: string;
  draw_date: string;
  draw_status: string;
  entries: number;
  revenue: number;
}

export interface CustomerGrowthPoint {
  month: string;
  new_customers: number;
  total_customers: number;
}

export interface BusinessStatsData {
  summary: StatsSummary;
  daily: DailyDataPoint[];
  monthly: MonthlyDataPoint[];
  locations: LocationDataPoint[];
  draws: DrawDataPoint[];
  customer_growth: CustomerGrowthPoint[];
}

export const fetchBusinessStats = async (
  locationId?: number,
  drawId?: number,
): Promise<BusinessStatsData> => {
  const params: Record<string, number> = {};
  if (locationId) params.location_id = locationId;
  if (drawId) params.draw_id = drawId;
  const res = await api.get<BusinessStatsData>('/business/stats', { params });
  return res.data;
};

import { api } from '../../../shared/api/client';

export interface StatsSummary {
  total_issued: number;
  total_activated: number;
  activation_rate: number;
}

export interface DailyDataPoint {
  date: string;
  issued: number;
  activated: number;
}

export interface MonthlyDataPoint {
  month: string;     // "yyyy-MM"
  issued: number;
  activated: number;
}

export interface LocationDataPoint {
  location_id: number;
  location_name: string;
  issued: number;
  activated: number;
}

export interface DrawDataPoint {
  draw_id: number;
  draw_name: string;
  prize_amount: number;
  draw_date: string;
  draw_status: string;
  issued: number;
  activated: number;
}

export interface BusinessStatsData {
  summary: StatsSummary;
  daily: DailyDataPoint[];
  monthly: MonthlyDataPoint[];
  locations: LocationDataPoint[];
  draws: DrawDataPoint[];
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

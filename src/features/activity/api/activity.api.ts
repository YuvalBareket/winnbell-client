import { api } from '../../../shared/api/client';

export interface ActivitySummary {
  receipts_period: number;
  revenue_period: number;
  entries_period: number;
  monthly_cap: number | null;
}

export interface ActivityItem {
  ticket_id: number;
  location_name: string;
  transaction_amount: number | null;
  receipt_identifier_masked: string | null;
  entry_source: string;
  status: 'active' | 'under_review';
  quarantine_reason: string | null;
  created_at: string;
}

export interface ActivityResult {
  summary: ActivitySummary;
  items: ActivityItem[];
  next_cursor: number | null;
}

export type DateRange = 'today' | '7d' | '30d';

export const setTicketQualification = async (ticketId: number, disqualify: boolean): Promise<void> => {
  await api.patch(`/business/tickets/${ticketId}/qualify`, { disqualify });
};

export const fetchActivity = async (params: {
  location_id?: number;
  date_range?: DateRange;
  cursor?: number;
  limit?: number;
}): Promise<ActivityResult> => {
  const res = await api.get<ActivityResult>('/business/activity', { params });
  return res.data;
};

// src/features/admin/types/index.ts

export interface AdminUser {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  is_email_verified: boolean;
  created_at: string;
  risk_score: number;
  risk_last_flagged_at: string | null;
  business_id: number | null;
  business_name: string | null;
  business_active: boolean | null;
}

export interface BusinessStats {
  id: number;
  name: string;
  sector: string;
  total_tickets_created: number;
  total_activated: number;
  ticket_balance: number;
}

export interface Draw {
  id: number;
  name: string;
  prize_amount: number;
  draw_date: string;
  status: 'Upcoming' | 'Open' | 'Closed';
  winner_user_id?: number;
  closed_at?: string;
}

export interface TicketBatchRequest {
  businessId: number;
  drawId: number;
  quantity: number;
}

export interface CreateBusinessInput {
  owner_user_id: number;
  name: string;
  sector: string;
  location: string;
  latitude?: number;
  longitude?: number;
  terms_text?: string;
}

export interface CreateDrawInput {
  name: string;
  prize_amount: number;
  draw_date: string;
}

export interface LocationBreakdownRow {
  business_id: number;
  business_name: string;
  entry_cap: number | null;
  threshold: number | null;
  location_id: number;
  location_name: string;
  address: string | null;
  total_tickets: number;
  activated: number;
  quarantined: number;
  receipt_tickets: number;
  code_tickets: number;
  avg_transaction: number | null;
  pct_just_above_threshold: number | null;
}

export interface LocationBreakdownPage {
  rows: LocationBreakdownRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminAnalytics {
  entrySourceMix: {
    code: number;
    receipt: number;
    free: number;
    promo: number;
    total: number;
  };
  amoe: {
    total_requests: number;
    approved: number;
    rejected: number;
    weekly_limit_count: number;
    campaign_ended_count: number;
  };
  fraud: {
    high_risk: number;
    medium_risk: number;
    low_risk: number;
  };
  validation: {
    quarantined: number;
    accepted: number;
    total: number;
    quarantine_reasons: { reason: string; count: number }[];
  };
  repeatBehavior: {
    users_with_submissions: number;
    avg_submissions_per_user: number;
    users_2_plus: number;
    multi_business_users: number;
  };
  userGrowth: {
    new_this_week: number;
    new_this_month: number;
    total: number;
  };
}

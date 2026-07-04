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
  entry_count: number;
  last_active_at: string | null;
}

export interface AdminUsersPage {
  rows: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BusinessStats {
  id: number;
  name: string;
  sector: string;
  entry_cap: number | null;
  is_subscribed: boolean;
  owner_name: string | null;
  owner_email: string | null;
  subscription_status: string | null;
  current_period_end: string | null;
  fee_at_entry: number | null;
  location_count: number;
  total_activated: number;
}

export interface BusinessStatsPage {
  rows: BusinessStats[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Draw {
  id: number;
  name: string;
  prize_amount: number;
  draw_date: string;
  status: 'Upcoming' | 'Open' | 'Closed';
  winner_user_id?: number;
  closed_at?: string;
  entry_count?: number;
}

export interface UpdateDrawInput {
  name?: string;
  prize_amount?: number;
  draw_date?: string;
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
    referral: number;
    total: number;
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

export interface GrowthAnalytics {
  northStar: {
    paying_businesses: number;
    new_paying_this_month: number;
    total_users: number;
    mau: number;
    mrr: number;
    business_churn_pct: number;
    user_growth_pct: number | null;
    paying_business_growth_pct: number | null;
    avg_entries_per_active_user: number;
    pct_businesses_acquired_organically: number | null;
    pct_users_acquired_organically: number;
  };
  businessGrowth: {
    total_businesses: number;
    paying_businesses: number;
    founding_members: number;
    new_businesses_this_month: number;
    new_paying_this_month: number;
    business_growth_pct: number | null;
    paying_business_growth_pct: number | null;
  };
  userGrowth: {
    total_users: number;
    new_this_month: number;
    user_growth_pct: number | null;
    mau: number;
    wau: number;
    dau: number;
    mau_over_total_pct: number;
    wau_over_mau_pct: number;
    dau_over_mau_pct: number;
  };
  acquisition: {
    total: number;
    by_source: { source: string; count: number; pct: number }[];
  };
  businessRetention: {
    monthly_subs: number;
    yearly_subs: number;
    active_paying: number;
    cancelled: number;
    pending_cancel: number;
    churn_pct: number;
    active_paying_pct: number;
  };
  userRetention: {
    m1_pct: number;
    m2_pct: number;
    m3_pct: number;
    eligible_m1: number;
    eligible_m2: number;
    eligible_m3: number;
  };
  engagement: {
    active_users: number;
    total_entries: number;
    avg_entries: number;
    median_entries: number;
    avg_businesses: number;
    single_business_pct: number;
    multi_business_pct: number;
    over_20_pct: number;
    at_30_pct: number;
    amoe_only_pct: number;
  };
  revenue: {
    mrr: number;
    arr: number;
    founding_this_month: number;
    revenue_this_month: number;
    arpb: number;
    ltv_estimate: number | null;
    trend: { draw_id: number; name: string; draw_date: string; revenue: number; businesses: number }[];
  };
  fraud: {
    quarantined_entries: number;
    rejected_winners: number;
    suspended_users: number;
    high_risk_users: number;
    threshold_probes: number;
    verifications_this_month: number;
    entries_this_month: number;
  };
  geo: {
    by_state: { state: string; count: number }[];
    by_city: { city: string; count: number }[];
  };
}

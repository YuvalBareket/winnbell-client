export interface SubscriptionDetails {
  id: number;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_subscription_id: string | null;
  billing_interval: 'monthly' | 'yearly';
  draw_id: number | null;
  draw_name: string | null;
  draw_date: string | null;
  draw_status: string | null;
  prize_amount: number | null;
  is_founding: boolean;
  founding_seat_number: number | null;
  founding_draws_remaining: number | null;
  fee_at_entry: number | null;
  entries_per_location: number | null;
  active_location_count: number;
}

export interface FoundingAvailability {
  taken: number;
  remaining: number;
  cap: number;
  price: number;
  active: boolean;
}

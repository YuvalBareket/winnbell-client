export interface SubscriptionDetails {
  id: number;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_subscription_id: string;
  draw_id: number | null;
  draw_name: string | null;
  draw_date: string | null;
  draw_status: string | null;
  prize_amount: number | null;
}

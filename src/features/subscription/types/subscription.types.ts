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
  // The next campaign the business will be enrolled into when the admin opens it
  // (null if no upcoming campaign has been created yet).
  next_campaign_id: number | null;
  next_campaign_name: string | null;
  next_campaign_date: string | null;
  next_campaign_prize: number | null;
}

export interface InvoiceLineItem {
  description: string | null;
  quantity: number | null;
  amount: number;
  period_start: number | undefined;
  period_end: number | undefined;
}

export interface SubscriptionInvoice {
  id: string;
  date: number;
  amount_paid: number;
  amount_due: number;
  status: string | null;
  invoice_description: string | null;
  description: InvoiceLineItem[];
  invoice_pdf: string | null;
  hosted_invoice_url: string | null;
  // 'founding' = one-time annual founding payment (render line text verbatim).
  kind?: 'founding';
}

export interface FoundingAvailability {
  taken: number;
  remaining: number;
  cap: number;
  price: number;
  active: boolean;
}

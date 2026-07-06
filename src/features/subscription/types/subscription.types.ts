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
  fee_at_entry: number | null;
  entries_per_location: number | null;
  // Staged plan change (tier or location count, incl. the founding hand-off): the new plan
  // waits here and goes live when the next campaign opens; the running campaign keeps its
  // current plan. NULL = no staged change.
  pending_fee_at_entry: number | null;
  pending_entries_per_location: number | null;
  // True while a founding member may start a regular plan (final included month, or the
  // founding year already ended). Mirrors the server-side checkout guard exactly.
  founding_transition_available?: boolean;
  // Business opted out of the campaign it already paid for (no refund); resets at open.
  skip_next_campaign?: boolean;
  // True between the 24th charge and the paid campaign's open: opt-out is available and
  // plan/location changes settle their price difference immediately.
  in_charged_window?: boolean;
  active_location_count: number;
  // Locations the NEXT campaign runs with (live minus scheduled removals plus staged adds).
  next_campaign_location_count?: number;
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

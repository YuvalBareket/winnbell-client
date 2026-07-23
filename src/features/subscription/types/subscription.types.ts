export interface SubscriptionDetails {
  id: number;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_subscription_id: string | null;
  billing_interval: 'monthly' | 'yearly';
  draw_id: number | null;
  draw_name: string | null;
  // Campaign period: opens midnight NY on the 1st (draw_start_date), drawn on the last day (draw_date).
  draw_start_date: string | null;
  draw_date: string | null;
  draw_status: string | null;
  prize_amount: number | null;
  is_founding: boolean;
  founding_seat_number: number | null;
  // Special Terms Section 6: second-year renewal at the exact price of the initial term.
  founding_amount_paid?: number | null;
  // ONE-TIME option: true once the single renewal was used (no further renewals offered).
  // Null for location managers (owner billing fact).
  founding_renewed?: boolean | null;
  // True while the one-time renewal may be purchased (final window of the term).
  // Server-computed with the SAME helper the renewal checkout guard uses - the client
  // never does its own window math, so banner and guard can never disagree.
  founding_renewal_open?: boolean;
  // What the one-time renewal will charge, in dollars (original monthly rate x renewal
  // term). Server-computed with the SAME formula the renewal checkout charges, so the
  // banner price and the Stripe charge can never disagree. Null for location managers.
  founding_renewal_price?: number | null;
  fee_at_entry: number | null;
  entries_per_location: number | null;
  // Staged plan change (tier or location count, incl. the founding hand-off): the new plan
  // waits here and goes live when the next campaign opens; the running campaign keeps its
  // current plan. NULL = no staged change.
  pending_fee_at_entry: number | null;
  pending_entries_per_location: number | null;
  // True while a founding member may start a regular plan (final included month, or the
  // founding term already ended). Mirrors the server-side checkout guard exactly.
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
  next_campaign_start_date: string | null;
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
  // Price per location for the whole founding term (server shared/founding.ts constant).
  price: number;
  active: boolean;
  // Monthly rate per location - the root value everything derives from.
  monthlyPrice?: number;
  // Term lengths in months, served by the server (single source: shared/founding.ts).
  termMonths?: number;
  renewalTermMonths?: number;
  // Campaign entries granted per location, served by the server.
  entriesPerLocation?: number;
}

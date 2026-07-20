export interface IDrawSummary {
  id: number;
  name: string;
  // NULL while an UPCOMING campaign's prize is still hidden (admin has not revealed it) -
  // the server masks it on the wire, so the amount is genuinely unknown to the client.
  prize_amount: number | null;
  // Campaign period: opens midnight NY on the 1st (start_date), drawn on the last day.
  start_date?: string;
  draw_date: string;
  status: string;
}

export interface IDrawResult extends IDrawSummary {
  closed_at?: string;
  winner_user_id?: number;
  winner_name?: string;
  winning_ticket_code?: string;
  winner_business_name?: string;
  winner_location_name?: string;
  winner_location_id?: number;
  entry_count?: number;
}

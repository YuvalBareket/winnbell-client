export interface IDrawSummary {
  id: number;
  name: string;
  prize_amount: number;
  draw_date: string;
  status: string;
}

export interface IDrawResult extends IDrawSummary {
  closed_at: string;
  winner_user_id?: number;
  winner_name?: string;
  winning_ticket_code?: string;
  winner_business_name?: string;
  winner_location_name?: string;
}

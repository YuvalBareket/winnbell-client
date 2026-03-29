// src/features/admin/types/index.ts

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
  prize_percentage: number;
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
  prize_amount?: number;
  prize_percentage?: number;
  draw_date: string;
}

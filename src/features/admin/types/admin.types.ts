// src/features/admin/types/index.ts

export interface BusinessStats {
  id: number;
  name: string;
  sector: string;
  totalTickets: number;
  activatedTickets: number;
  ticketBalance: number;
}

export interface Draw {
  id: number;
  name: string;
  prizeName: string;
  drawDate: string;
  status: 'Open' | 'Closed';
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
  prize_name: string;
  prize_amount: number;
  draw_date: string;
}

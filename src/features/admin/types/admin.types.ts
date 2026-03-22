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

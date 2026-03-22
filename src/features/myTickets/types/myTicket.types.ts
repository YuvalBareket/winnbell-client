export interface ITicket {
  id: number;
  code: string;
  status: 'Issued' | 'Activated';
  business_name: string;
  business_sector: string;
  activated_at: string;
  draw_name: string;
}
export interface TicketBase {
  id: number;
  code: string;
  status: 'Issued' | 'Activated';
  activated_at?: string;
}

// What a User sees
export interface UserTicket extends TicketBase {
  business_name: string;
  business_sector: string;
}

// What a Business sees
export interface BusinessTicket extends TicketBase {
  location_name: string;
  activated_by_user?: string;
  activated_by_email?: string;
}

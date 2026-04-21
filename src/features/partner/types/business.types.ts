export interface LocationInput {
  name: string;
  address: string;
  lat: number | null;
  lon: number | null;
}

export interface BusinessSetupInput {
  businessName: string;
  businessSector: string;
  description: string;
  min_transaction_amount: number | null;
  locations: LocationInput[];
}

export interface UpdateLocationInput {
  name: string;
  address: string;
  lat: number;
  lon: number;
}

export interface UpdateBusinessInput {
  businessSector: string;
  description: string;
  terms_text: string;
}

export interface BusinessLocation {
  id: number;
  name: string;
  address: string;
  manager_id: number | null;
  manager_name: string | null;
  is_active: boolean;
}

// 'code' = MVP: business generates codes, customers activate them
// 'receipt' = v2: customers self-submit receipt identifier + amount
export type EntryMode = 'code' | 'receipt';

export interface BusinessData {
  id: number;
  name: string;
  sector: string;
  description: string;
  terms_text: string;
  logo_url: string | null;
  is_subscribed: boolean;
  is_participating: boolean;
  entry_mode: EntryMode;
  entry_cap: number | null;              // NULL = falls back to global cap
  min_transaction_amount: number | null; // NULL = no minimum
  global_entry_cap: number | null;       // platform ceiling set by admin
  subscription_status: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  locations: BusinessLocation[];
}

export interface LocationInput {
  name: string;
  address: string;
  lat: number | null;
  lon: number | null;
  suite?: string;
  phone?: string;
}

export interface BusinessSetupInput {
  businessName: string;
  businessSector: string;
  description: string;
  website_url?: string;
  logo_url?: string;
  min_transaction_amount?: number;
  locations: LocationInput[];
}

export interface UpdateLocationInput {
  name: string;
  address: string;
  lat: number;
  lon: number;
  suite?: string | null;
  phone?: string | null;
}

export interface UpdateBusinessInput {
  businessSector: string;
  description: string;
  terms_text: string;
  website_url?: string;
}

export interface BusinessLocation {
  id: number;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  manager_id: number | null;
  manager_name: string | null;
  is_active: boolean;
  // Staged location changes (applied when the next campaign opens): a new location added
  // during a running campaign waits with activate_at_open; a removed one keeps serving
  // with deactivate_at_open until the campaign boundary.
  activate_at_open?: boolean;
  deactivate_at_open?: boolean;
  suite?: string | null;
  phone?: string | null;
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
  receipt_example_image_url: string | null;
  website_url?: string | null;
  is_subscribed: boolean;
  is_participating: boolean;
  entry_mode: EntryMode;
  entry_cap: number | null;              // NULL = falls back to global cap
  min_transaction_amount: number;        // always present; minimum required per receipt
  pending_min_transaction_amount: number | null; // set when changed during active campaign
  global_entry_cap: number | null;       // platform ceiling set by admin
  subscription_status: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  locations: BusinessLocation[];
}

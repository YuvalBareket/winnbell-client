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
  terms_text: string;
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

export interface BusinessData {
  id: number;
  name: string;
  sector: string;
  description: string;
  terms_text: string;
  is_active: boolean;
  subscription_status: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  locations: BusinessLocation[];
}

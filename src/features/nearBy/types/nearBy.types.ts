// src/types/business.ts

export type BusinessSector = 'Food' | 'Retail' | 'Service';

export interface IBusiness {
  id: number;
  owner_user_id: number;
  name: string;
  sector: BusinessSector;
  location: string;
  latitude: number;
  longitude: number;
  logo_url?: string;
  terms_text?: string;
  ticket_balance: number;
  created_at: string;
  // Optional field if the backend calculates distance
  distance_km?: number;
}

export interface ILocationCoords {
  latitude: number;
  longitude: number;
}

export interface INearbyParams extends ILocationCoords {
  radius?: number; // Optional radius in km
}

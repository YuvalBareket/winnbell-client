export type BusinessSector = string;

// Matches exactly what GET /business/nearby returns
export interface NearbyLocation {
  location_id: number;
  address: string;
  latitude: number;
  longitude: number;
  id: number;            // business id
  name: string;
  sector: BusinessSector;
  description: string;
  terms_text: string;
  logo_url: string | null;
  receipt_example_image_url: string | null;
  min_transaction_amount: number | null;
  distance_km: number;
  website_url?: string | null;
  phone?: string | null;
  other_locations?: Array<{ id: number; name: string; address: string }>;
}

export interface ILocationCoords {
  latitude: number;
  longitude: number;
}

export interface INearbyParams {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  sector?: string;
}

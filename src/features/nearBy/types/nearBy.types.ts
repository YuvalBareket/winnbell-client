export type BusinessSector = string;

export interface NearbyLocation {
  location_id: number;
  address: string;
  latitude: number;
  longitude: number;
  id: number;
  name: string;
  sector: BusinessSector;
  logo_url: string | null;
}

export interface NearbyLocationDetail extends NearbyLocation {
  description: string;
  terms_text: string;
  receipt_example_image_url: string | null;
  min_transaction_amount: number | null;
  pending_min_transaction_amount: number | null;
  website_url?: string | null;
  phone?: string | null;
  other_locations?: Array<{ id: number; name: string; address: string }>;
  location_name?: string;
  business_name?: string;
  business_id?: number;
  cap_reached?: boolean;
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
  limit?: number;
  name?: string;
}

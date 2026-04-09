export type BusinessSector = 'Food' | 'Retail' | 'Service';

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
  distance_km: number;
}

export interface ILocationCoords {
  latitude: number;
  longitude: number;
}

export interface INearbyParams extends ILocationCoords {
  radius?: number;
}

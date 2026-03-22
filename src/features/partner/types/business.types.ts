export interface LocationInput {
  name: string;
  address: string;
  lat: number | null;
  lon: number | null;
}

export interface BusinessSetupInput {
  businessSector: string;
  description: string;
  terms_text: string;
  locations: LocationInput[];
}

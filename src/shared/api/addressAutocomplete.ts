import { api } from './client';

export interface AddressSuggestion {
  label: string;
  placeId: string;
}

export interface AddressCoords {
  label: string;
  lat: number;
  lon: number;
}

export const autoCompleteAddress = async (text: string): Promise<AddressSuggestion[]> => {
  const q = encodeURIComponent(text.trim());
  const res = await api.post<AddressSuggestion[]>(`/business/address/?q=${q}`, {});
  return res.data;
};

export const getAddressCoords = async (placeId: string): Promise<AddressCoords> => {
  const res = await api.get<AddressCoords>(`/business/address-coords?placeId=${encodeURIComponent(placeId)}`);
  return res.data;
};

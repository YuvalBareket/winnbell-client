import { api } from './client';

export interface AddressSuggestion {
  label: string;
  lat: number;
  lon: number;
}

export const autoCompleteAddress = async (text: string): Promise<AddressSuggestion[]> => {
  const q = encodeURIComponent(text.trim());
  const res = await api.post<AddressSuggestion[]>(`/business/address/?q=${q}`, {});
  return res.data;
};

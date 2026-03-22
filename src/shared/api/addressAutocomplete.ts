import { api } from './client';

export const autoCompleteAddress = async (text: string): Promise<any> => {
  const q = encodeURIComponent(text.trim());
  const res = await api.post(`/business/address/?q=${q}`, {});
  return res.data;
};

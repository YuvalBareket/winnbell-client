import { api } from '../../../shared/api/client';
import type { IDrawSummary } from '../types';

export const getActiveDraws = async (): Promise<IDrawSummary[]> => {
  const { data } = await api.get('/draws/active');
  return data;
};

import { api } from '../../../shared/api/client';
import type { IDrawResult, IDrawSummary } from '../types';

export const getActiveDraws = async (): Promise<IDrawSummary[]> => {
  const { data } = await api.get('/draws/active');
  return data;
};

export const getDrawHistory = async (): Promise<IDrawResult[]> => {
  const { data } = await api.get('/draws/history');
  return data;
};

export const getDrawResult = async (drawId: number): Promise<IDrawResult> => {
  const { data } = await api.get(`/draws/${drawId}/result`);
  return data;
};

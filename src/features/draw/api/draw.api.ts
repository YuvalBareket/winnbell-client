import { api } from '../../../shared/api/client';
import type { IDrawResult, IDrawSummary } from '../types';

export const getActiveDraws = async (): Promise<IDrawSummary[]> => {
  const { data } = await api.get('/draws/active');
  return data;
};

// The campaign visitor-facing pages talk about: the open draw, or the next Upcoming
// one when nothing is open (its prize is null until the admin reveals it). Null when
// neither exists.
export const getCurrentDraw = async (): Promise<IDrawSummary | null> => {
  const { data } = await api.get('/draws/current');
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

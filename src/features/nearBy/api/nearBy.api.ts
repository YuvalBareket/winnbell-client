import { api } from '../../../shared/api/client';
import type { NearbyLocation, INearbyParams } from '../types/nearBy.types';

export const getNearbyBusinesses = async (
  params: INearbyParams,
  signal?: AbortSignal,
): Promise<NearbyLocation[]> => {
  const { data } = await api.get<NearbyLocation[]>('/business/nearby', { params, signal });
  return data;
};

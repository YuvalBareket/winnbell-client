import { api } from '../../../shared/api/client';
import type { NearbyLocation, INearbyParams } from '../types/nearBy.types';

export const getNearbyBusinesses = async (
  params: INearbyParams,
): Promise<NearbyLocation[]> => {
  const { data } = await api.get<NearbyLocation[]>('/business/nearby', { params });
  return data;
};

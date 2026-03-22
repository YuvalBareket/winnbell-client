import { api } from '../../../shared/api/client';
import type { IBusiness, INearbyParams } from '../types/nearBy.types';

export const getNearbyBusinesses = async (
  params: INearbyParams,
): Promise<IBusiness[]> => {
  const { data } = await api.get<IBusiness[]>('/business/nearby', { params });
  return data;
};

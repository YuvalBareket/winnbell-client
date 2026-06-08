import { api } from '../../../shared/api/client';
import type { NearbyLocation, NearbyLocationDetail, INearbyParams } from '../types/nearBy.types';

export const getNearbyBusinesses = async (
  params: INearbyParams,
  signal?: AbortSignal,
): Promise<NearbyLocation[]> => {
  const { data } = await api.get<NearbyLocation[]>('/business/nearby', { params, signal });
  return data;
};

export const getLocationDetail = async (locationId: number): Promise<NearbyLocationDetail> => {
  const { data } = await api.get<NearbyLocationDetail>(`/business/participating/locations/${locationId}`);
  return data;
};

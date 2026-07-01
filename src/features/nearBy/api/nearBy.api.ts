import { api } from '../../../shared/api/client';
import type { NearbyLocation, NearbyLocationDetail, INearbyParams } from '../types/nearBy.types';

export const getNearbyBusinesses = async (
  params: INearbyParams,
  signal?: AbortSignal,
): Promise<NearbyLocation[]> => {
  const { data } = await api.get<NearbyLocation[]>('/business/nearby', { params, signal });
  return data;
};

export const getLocationProfileById = async (locationId: number): Promise<NearbyLocationDetail> => {
  // The server records a profile view (regular Users only) as part of serving this endpoint.
  const { data } = await api.get<NearbyLocationDetail>(`/business/locations/${locationId}/profile`);
  return data;
};

// src/services/businessService.ts

import { api } from '../../../shared/api/client';
import type {
  BusinessData,
  BusinessSetupInput,
  UpdateBusinessInput,
  UpdateLocationInput,
} from '../types/business.types';

export const setupBusinessProfile = async (data: BusinessSetupInput): Promise<{ businessId: number }> => {
  const response = await api.post<{ businessId: number }>('/business/setup', data);
  return response.data;
};

export const fetchMyBusinessDetails = async (): Promise<BusinessData> => {
  const response = await api.get<BusinessData>('/business/my-business');
  return response.data;
};

export const createInviteLink = async (locationId: number): Promise<{ inviteLink: string }> => {
  const response = await api.post<{ inviteLink: string }>(`/business/locations/${locationId}/invite`);
  return response.data;
};

export const updateBusiness = async (data: UpdateBusinessInput): Promise<void> => {
  await api.patch('/business', data);
};

export const updateLocation = async (
  locationId: number,
  data: UpdateLocationInput,
): Promise<void> => {
  await api.patch(`/business/locations/${locationId}`, data);
};

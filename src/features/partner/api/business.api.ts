// src/services/businessService.ts

import { api } from '../../../shared/api/client';
import type {
  BusinessData,
  BusinessSetupInput,
  UpdateBusinessInput,
  UpdateLocationInput,
} from '../types/business.types';

export interface UpdateCampaignSettingsInput {
  min_transaction_amount: number | null;
}

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

export const addLocation = async (
  data: UpdateLocationInput,
): Promise<{ locationId: number }> => {
  const response = await api.post<{ locationId: number }>('/business/locations', data);
  return response.data;
};

export const deleteLocation = async (locationId: number): Promise<void> => {
  await api.delete(`/business/locations/${locationId}`);
};

export const removeLocationManager = async (locationId: number): Promise<void> => {
  await api.delete(`/business/locations/${locationId}/manager`);
};

export const getUploadUrl = async (contentType: string): Promise<{ uploadUrl: string; key: string }> => {
  const response = await api.get<{ uploadUrl: string; key: string }>('/business/upload-url', {
    params: { contentType },
  });
  return response.data;
};

export const updateBusinessLogo = async (key: string): Promise<void> => {
  await api.patch('/business/logo', { key });
};

export const updateCampaignSettingsApi = async (data: UpdateCampaignSettingsInput): Promise<void> => {
  await api.patch('/business/campaign-settings', data);
};

// src/services/businessService.ts

import { api } from '../../../shared/api/client';
import type {
  BusinessData,
  BusinessSetupInput,
  UpdateBusinessInput,
  UpdateLocationInput,
} from '../types/business.types';

export interface UpdateCampaignSettingsInput {
  min_transaction_amount?: number;
  receipt_example_image_url?: string | null;
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
  // Server returns only the signed token; build the full link from the current origin
  // (like the referral link) so it always matches the environment the owner is using.
  const response = await api.post<{ token: string }>(`/business/locations/${locationId}/invite`);
  return { inviteLink: `${window.location.origin}/register/Location?token=${response.data.token}` };
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
): Promise<{ locationId: number; stagedForNextCampaign?: boolean }> => {
  const response = await api.post<{ locationId: number; stagedForNextCampaign?: boolean }>('/business/locations', data);
  return response.data;
};

export const deleteLocation = async (locationId: number): Promise<{ success: boolean; scheduledForNextCampaign?: boolean }> => {
  const response = await api.delete<{ success: boolean; scheduledForNextCampaign?: boolean }>(`/business/locations/${locationId}`);
  return response.data;
};

export const removeLocationManager = async (locationId: number): Promise<void> => {
  await api.delete(`/business/locations/${locationId}/manager`);
};

export const getUploadUrl = async (contentType: string, size: number): Promise<{ uploadUrl: string; key: string; publicUrl: string | null }> => {
  const response = await api.get<{ uploadUrl: string; key: string; publicUrl: string | null }>('/business/upload-url', {
    params: { contentType, size },
  });
  return response.data;
};

export const updateBusinessLogo = async (key: string): Promise<void> => {
  await api.patch('/business/logo', { key });
};

export const updateCampaignSettingsApi = async (data: UpdateCampaignSettingsInput): Promise<void> => {
  await api.patch('/business/campaign-settings', data);
};

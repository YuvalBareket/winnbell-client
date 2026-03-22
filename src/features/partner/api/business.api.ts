// src/services/businessService.ts

import { api } from '../../../shared/api/client';
import type { BusinessSetupInput } from '../types/business.types';

export const setupBusinessProfile = async (data: BusinessSetupInput) => {
  const response = await api.post('/business/setup', data);
  return response.data;
};
// client/src/features/partner/api/business.api.ts

export const fetchMyBusinessDetails = async () => {
  // This endpoint should return the business info + associated locations
  const response = await api.get('/business/my-business');
  return response.data;
};
export const createInviteLink = async (locationId: number) => {
  // We hit the new endpoint we just created in the backend
  const response = await api.post(`/business/locations/${locationId}/invite`);
  return response.data; // Returns { inviteLink: '...' }
};

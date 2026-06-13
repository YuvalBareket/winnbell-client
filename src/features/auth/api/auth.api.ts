import axios from 'axios';
import { api } from '../../../shared/api/client';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '../types/auth.types';
// Adjust this import path if needed based on your folder structure

export const registerUserFn = async (
  data: RegisterRequest,
): Promise<AuthResponse> => {
  // Added '/api' here because it's missing from baseURL
  const response = await api.post<AuthResponse>('/auth/register', data);
  return response.data;
};
export const loginUserFn = async (
  data: LoginRequest,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export const syncUserFn = async (
  accessToken: string,
  options?: { role?: string | null; inviteToken?: string | null },
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    '/auth/sync',
    { role: options?.role || null, inviteToken: options?.inviteToken || null },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  return response.data;
};

export const getRegionConfig = async (): Promise<{ allowed_states: string[] }> => {
  const response = await api.get<{ allowed_states: string[] }>('/auth/region-config');
  return response.data;
};

// Revokes all internal app sessions for the user identified by the Supabase access
// token. Uses a bare axios call (not the shared `api` instance) on purpose: `api`'s
// request interceptor overwrites the Authorization header with the internal Redux
// token, which would clobber the Supabase token this endpoint must verify. This
// mirrors how client.ts calls /auth/refresh outside the interceptors.
export const revokeAllSessionsFn = async (accessToken: string): Promise<void> => {
  const baseURL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/').replace(/\/$/, '');
  await axios.post(
    `${baseURL}/auth/revoke-sessions`,
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
};

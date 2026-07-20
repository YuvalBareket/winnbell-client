import axios from 'axios';
import { api } from '../../../shared/api/client';
import type { AuthResponse } from '../types/auth.types';

// NOTE: the legacy /auth/register + /auth/login password endpoints were removed from the
// client (and disabled on the production server) - all sign-in goes through Supabase + /sync.

export const syncUserFn = async (
  accessToken: string,
  options?: { role?: string | null; inviteToken?: string | null; referralCode?: string | null; acquisitionSource?: string | null; acquiredViaLocationId?: number | null; promoCode?: string | null },
  signal?: AbortSignal,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    '/auth/sync',
    {
      role: options?.role || null,
      inviteToken: options?.inviteToken || null,
      referralCode: options?.referralCode || null,
      acquisitionSource: options?.acquisitionSource || null,
      acquiredViaLocationId: options?.acquiredViaLocationId ?? null,
      promoCode: options?.promoCode || null,
    },
    // signal lets useSupabaseSync abort an in-flight sync when the effect re-runs (retry) or
    // unmounts, so a superseded attempt can't run concurrently with the new one (F14).
    { headers: { Authorization: `Bearer ${accessToken}` }, signal },
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

// Server-side revocation of ONE device's session on logout (deletes that refresh token so
// it can never be refreshed again). Bare axios (not `api`) so the request interceptor can't
// attach/refresh the active account's token — we pass the exact token to revoke in the body.
// Fire-and-forget: local logout has already happened; a failed server revoke is non-fatal.
export const logoutFn = async (refreshToken: string): Promise<void> => {
  const baseURL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/').replace(/\/$/, '');
  try {
    await axios.post(`${baseURL}/auth/logout`, { refreshToken });
  } catch {
    // best-effort
  }
};

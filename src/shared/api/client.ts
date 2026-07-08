import axios from 'axios';
import { store } from '../../store/store';
import { logout, removeAccount, updateAccountTokens } from '../../store/slices/authSlice';
import { supabase } from '../lib/supabase';
import { broadcastLogout } from '../lib/crossTabLogout';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Read/delete the Authorization header across axios header shapes (AxiosHeaders instance
// or plain object) without using `any`.
type HeaderBag = { get?: (k: string) => unknown; delete?: (k: string) => void; Authorization?: unknown; authorization?: unknown };
const readAuthHeader = (h: unknown): string => {
  const bag = h as HeaderBag | undefined;
  if (!bag) return '';
  const viaGet = typeof bag.get === 'function' ? bag.get('Authorization') : undefined;
  return String(viaGet ?? bag.Authorization ?? bag.authorization ?? '');
};
const deleteAuthHeader = (h: unknown): void => {
  const bag = h as HeaderBag | undefined;
  if (!bag) return;
  if (typeof bag.delete === 'function') bag.delete('Authorization');
  delete bag.Authorization;
  delete bag.authorization;
};

// 1. Request Interceptor — attach the ACTIVE account's token from Redux, UNLESS the caller
// explicitly set its own Authorization. /auth/sync must send the SUPABASE access token; with
// multi-account a user can be signed in while syncing a second account, and overwriting that
// header with the internal token made every add-account sign-in fail with 401.
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token && !readAuthHeader(config.headers)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 2. Response Interceptor — refresh token on 401, then re-issue the original request.
//
// The retry must happen HERE (not via React Query): React Query only retries
// queries, never mutations, so without this a receipt submission or code redeem
// fired just after token expiry would fail once and force the user to tap again.
// The _retry flag prevents loops; refreshPromise dedupes concurrent refreshes.
let refreshPromise: Promise<void> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config?._retry) {
      error.config._retry = true;

      // Only handle 401s from requests that carried the ACTIVE account's internal token.
      // Anything else — /auth/sync's Supabase token, or a token from an account that was
      // switched away from / already rotated by a concurrent refresh — must never consume
      // the active account's refresh token or log anyone out.
      const sentAuth = readAuthHeader(error.config?.headers);
      const sentToken = sentAuth.startsWith('Bearer ') ? sentAuth.slice(7) : sentAuth;
      const entry = store.getState().auth;
      if (!entry.token || sentToken !== entry.token) {
        return Promise.reject(error);
      }
      // Pin the account this 401 belongs to NOW. The user may switch accounts while the
      // refresh below is in flight; every follow-up action (retry token, account drop) must
      // target THIS account, never "whichever account is active by then".
      const failingId = entry.activeAccountId;
      const failingUser = entry.user;

      if (entry.refreshToken && failingUser) {
        try {
          if (!refreshPromise) {
            const base = (error.config.baseURL || import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
            const refreshTokenToUse = entry.refreshToken;
            refreshPromise = axios
              .post(`${base}/auth/refresh`, { refreshToken: refreshTokenToUse })
              .then(({ data }) => {
                // updateAccountTokens (NOT login): writes the rotated tokens back to this
                // account without re-activating it if the user switched away mid-refresh.
                // Re-read the account by its pinned id at write-back time:
                //  - if it's no longer saved (removed mid-refresh) we skip the dispatch entirely,
                //    so a just-removed account can never be resurrected with fresh tokens (F9);
                //  - we use its CURRENT user object, not the one captured at 401 time, so a
                //    concurrent update (e.g. businessIsActive) isn't clobbered (F11).
                const current = (store.getState().auth.accounts ?? []).find((a) => a.user.id === failingId);
                if (current) {
                  store.dispatch(updateAccountTokens({ user: current.user, token: data.token, refreshToken: data.refreshToken }));
                }
              })
              .finally(() => { refreshPromise = null; });
          }
          await refreshPromise;
          // Mutations (POST/PUT/PATCH/DELETE) are NOT retried by React Query, so re-issue
          // them here with the fresh token (this is why this path exists). GET requests are
          // left to React Query's own retry (retry: 1 in main.tsx) — re-issuing a GET response
          // from the axios 1.x error interceptor is the brittle pattern that broke query
          // recovery (e.g. the risk-level screen), so for GETs we reject and let the query retry.
          const method = (error.config.method ?? 'get').toLowerCase();
          const isMutation = method !== 'get' && method !== 'head' && method !== 'options';
          // Retry with the refreshed token of the SAME account the request was fired as.
          // Never let the request interceptor attach the CURRENT active token here — after a
          // mid-refresh account switch that would re-issue the mutation as the wrong user.
          const refreshedAcc = (store.getState().auth.accounts ?? []).find((a) => a.user.id === failingId);
          if (isMutation && refreshedAcc) {
            deleteAuthHeader(error.config.headers);
            error.config.headers.Authorization = `Bearer ${refreshedAcc.token}`;
            return api(error.config);
          }
          return Promise.reject(error);
        } catch (refreshErr) {
          // Drop the account ONLY when the server definitively rejected the refresh token
          // (401/403). A transient failure - network blip, server restart, 5xx, 429 - says
          // nothing about the token's validity; dropping on those logged users out
          // mid-session over a single hiccup. Reject this one request instead: the next
          // 401 retries the refresh with the same still-valid token.
          const refreshStatus = (refreshErr as { response?: { status?: number } })?.response?.status;
          if (refreshStatus !== 401 && refreshStatus !== 403) {
            return Promise.reject(error);
          }
          // Definitive rejection — fall through to dropping the account
        }
      }

      // Refresh failed or unavailable: drop ONLY the failing account. If another account is
      // saved on this device, fall back to it (Instagram-style) instead of logging everything
      // out; only when it was the last account do we perform the full logout.
      const now = store.getState().auth;
      const stillSaved = (now.accounts ?? []).some((a) => a.user.id === failingId);
      if (failingId == null || !stillSaved) {
        // Already removed by a concurrent handler — nothing left to do.
        return Promise.reject(error);
      }
      const others = now.accounts.filter((a) => a.user.id !== failingId);
      // Clear cached data only when the failing account is the one on screen.
      if (now.activeAccountId === failingId) {
        import('../../main').then(({ queryClient }) => queryClient.clear()).catch(() => {});
      }
      if (others.length > 0) {
        store.dispatch(removeAccount({ id: failingId }));
        // Keep the Supabase session: it may belong to the remaining account, and the app
        // runs on internal JWTs anyway (useSupabaseSync's identity check ignores a
        // mismatched session, so it can never resurrect the dropped account).
      } else {
        // Last account's refresh token was DEFINITIVELY rejected (already dead server-side,
        // so no /auth/logout revoke needed). Full logout + clear other tabs.
        const wasAuthenticated = now.isAuthenticated;
        store.dispatch(logout());
        broadcastLogout();
        if (wasAuthenticated) {
          supabase.auth.signOut().catch(() => {});
        }
      }
    }

    return Promise.reject(error);
  },
);

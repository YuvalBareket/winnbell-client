import axios from 'axios';
import { store } from '../../store/store';
import { login, logout } from '../../store/slices/authSlice';
import { supabase } from '../lib/supabase';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// 1. Request Interceptor — attach current token from Redux
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
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

      const { refreshToken, user } = store.getState().auth;

      if (refreshToken && user) {
        try {
          if (!refreshPromise) {
            const base = (error.config.baseURL || import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
            refreshPromise = axios
              .post(`${base}/auth/refresh`, { refreshToken })
              .then(({ data }) => {
                store.dispatch(login({ user, token: data.token, refreshToken: data.refreshToken }));
              })
              .finally(() => { refreshPromise = null; });
          }
          await refreshPromise;
          // Mutations (POST/PUT/PATCH/DELETE) are NOT retried by React Query, so re-issue
          // them here with the fresh token (this is why this path exists). GET requests are
          // left to React Query's own retry (retry: 3) — re-issuing a GET response from the
          // axios 1.x error interceptor is the brittle pattern that broke query recovery
          // (e.g. the risk-level screen), so for GETs we reject and let the query retry.
          const method = (error.config.method ?? 'get').toLowerCase();
          const isMutation = method !== 'get' && method !== 'head' && method !== 'options';
          if (isMutation) {
            return api(error.config);
          }
          return Promise.reject(error);
        } catch {
          // Refresh failed — fall through to logout
        }
      }

      // No refresh token or refresh failed — hard logout
      const wasAuthenticated = store.getState().auth.isAuthenticated;
      store.dispatch(logout());
      import('../../main').then(({ queryClient }) => queryClient.clear()).catch(() => {});
      if (wasAuthenticated) {
        supabase.auth.signOut().catch(() => {});
      }
    }

    return Promise.reject(error);
  },
);

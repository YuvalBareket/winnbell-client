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

// 1. Request Interceptor (Pull from Redux)
api.interceptors.request.use(
  (config) => {
    // Access the state directly from the store instance
    const state = store.getState();
    const token = state.auth.token; // Ensure this matches your slice structure

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// 2. Response Interceptor (Dispatch to Redux)
// Deduplicates concurrent refresh attempts: when multiple requests get 401
// at the same time, only the first triggers a refresh call. The rest wait
// for that single refresh to finish, then retry with the new token.
let refreshPromise: Promise<string> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const { refreshToken, user } = store.getState().auth;

      if (refreshToken && user) {
        try {
          if (!refreshPromise) {
            const base = (originalRequest.baseURL || import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
            refreshPromise = axios.post(`${base}/auth/refresh`, { refreshToken })
              .then(({ data }) => {
                store.dispatch(login({
                  user,
                  token: data.token,
                  refreshToken: data.refreshToken,
                }));
                return data.token as string;
              })
              .finally(() => { refreshPromise = null; });
          }

          const newToken = await refreshPromise;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError: unknown) {
          const status = (refreshError as { response?: { status?: number } })?.response?.status;
          // Only hard-logout on definitive auth rejection (401/403).
          // Network errors or 5xx should not destroy the session.
          if (status !== 401 && status !== 403) {
            return Promise.reject(error);
          }
        }
      }

      const wasAuthenticated = store.getState().auth.isAuthenticated;
      store.dispatch(logout());
      // Only sign out of Supabase if the user had an active session.
      // Calling signOut() with no session fires SIGNED_OUT which clears
      // pendingEmail and breaks the registration/verification flow.
      if (wasAuthenticated) {
        supabase.auth.signOut().catch(() => {});
      }
    }
    return Promise.reject(error);
  },
);

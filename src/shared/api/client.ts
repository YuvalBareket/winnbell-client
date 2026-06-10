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

// 2. Response Interceptor — refresh token on 401, then let React Query retry
//
// Axios 1.x cannot return a retried response from the error interceptor (known bug).
// Instead, we only refresh the token here and reject. React Query retries the query
// automatically and the request interceptor picks up the fresh token from Redux.
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
          // Token refreshed in Redux — reject so React Query retries with the new token
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

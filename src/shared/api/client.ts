import axios from 'axios';
import { store } from '../../store/store';
import { logout } from '../../store/slices/authSlice';
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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const wasAuthenticated = store.getState().auth.isAuthenticated;
      store.dispatch(logout());
      // Only sign out of Supabase if the user had an active session.
      // Calling signOut() with no session fires SIGNED_OUT which clears
      // pendingEmail and breaks the registration/verification flow.
      if (wasAuthenticated) {
        supabase.auth.signOut();
      }
    }
    return Promise.reject(error);
  },
);

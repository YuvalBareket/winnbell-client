import axios from 'axios';
import { store } from '../../store/store';
import { logout } from '../../store/slices/authSlice';

export const api = axios.create({
  baseURL: 'http://localhost:3000/',
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
      // Instead of manual localStorage.clear(),
      // dispatch the Redux action to clear the whole state
      store.dispatch(logout());

      // Force redirect if not handled by a router guard
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

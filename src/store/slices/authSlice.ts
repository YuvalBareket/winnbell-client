import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  AuthState,
  LoginPayload,
  TCoords,
} from '../../features/auth/types/auth.types';

const initialState: AuthState = {
  userLocation: null,
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<LoginPayload>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setUserLocation: (state, action: PayloadAction<TCoords>) => {
      state.userLocation = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

export const { login, logout, setLoading, setError, setUserLocation } =
  authSlice.actions;
export default authSlice.reducer;

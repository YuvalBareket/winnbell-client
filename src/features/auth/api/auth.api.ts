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

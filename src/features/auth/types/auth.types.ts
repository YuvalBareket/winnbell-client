export type UserRole = 'User' | 'Business' | 'Admin';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  location_id?: number | null; // Added for the Location Manager flow
  business_id?: number | null;
  requiresBusinessSetup?: boolean;
  businessIsActive?: boolean;
  created_at: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface AuthState {
  userLocation: TCoords | null;
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
export interface LoginPayload {
  user: User;
  token: string;
}
export type TCoords = { longitude: number; latitude: number };

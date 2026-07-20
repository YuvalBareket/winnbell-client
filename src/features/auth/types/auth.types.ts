// The server only ever issues these three roles. Location managers are Business-role
// users WITH location_id set - there is no 'Manager' role on the wire.
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
  businessLogoUrl?: string | null;
  requiresProfileSetup?: boolean;
  dateOfBirth?: string | null;
  gender?: string | null;
  /** Self-declared U.S. state of residence (2-letter code) from profile setup */
  state?: string | null;
  /** Returned by all auth responses; the live value is still fetched via useMyRiskLevel. */
  isPhoneVerified?: boolean;
  created_at: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  refreshToken: string;
  user: User;
}

// ── Multi-account (device-level account switching, Instagram/TikTok style) ──
// A user can save and switch between up to MAX_ACCOUNTS accounts on one device
// without logging out (e.g. a Business owner keeping a separate personal account
// for collecting their own entries). Change this single constant to raise the cap.
export const MAX_ACCOUNTS = 2;

// One saved account on this device. Each runs on its own internal JWT, which the
// API interceptor refreshes via /auth/refresh independently of Supabase, so a
// switched-to account works fully without an active Supabase session.
export interface StoredAccount {
  user: User;
  token: string;
  refreshToken: string | null;
}

export interface AuthState {
  userLocation: TCoords | null;
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  // Saved accounts on this device (max MAX_ACCOUNTS). The active account is always
  // mirrored into the fields above so existing selectors/API interceptor are unchanged.
  accounts: StoredAccount[];
  activeAccountId: number | null; // user.id of the active account
}
export interface LoginPayload {
  user: User;
  token: string;
  refreshToken: string | null;
}
export type TCoords = { longitude: number; latitude: number };

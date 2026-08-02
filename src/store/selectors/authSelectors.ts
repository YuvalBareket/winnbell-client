import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { MAX_ACCOUNTS } from '../../features/auth/types/auth.types';

// 1. Basic Selector: Get the whole Auth slice
const selectAuthState = (state: RootState) => state.auth;

// 2. Memoized Selectors (Optimized)
export const selectIsAuthenticated = createSelector(
  [selectAuthState],
  (auth) => auth.isAuthenticated,
);
export const selectIsRequiresBusinessSetup = createSelector(
  [selectAuthState],
  (auth) => auth.user?.requiresBusinessSetup ?? false,
);

export const selectRequiresProfileSetup = createSelector(
  [selectAuthState],
  (auth) => auth.user?.requiresProfileSetup ?? false,
);
export const selectBusinessIsActive = createSelector(
  [selectAuthState],
  (auth) => auth.user?.businessIsActive ?? false,
);
export const selectBusinessLogoUrl = createSelector(
  [selectAuthState],
  (auth) => auth.user?.businessLogoUrl ?? null,
);
export const selectCurrentUser = createSelector(
  [selectAuthState],
  (auth) => auth.user,
);
export const selectIsRegularUser = createSelector(
  [selectCurrentUser],
  (user) => user?.role === 'User',
);

// True only when the profile DOB CONFIRMS the user is under 21 (age-restricted sectors:
// tobacco & liquor). Missing DOB = false here; the server entry gate fails closed instead.
// Compares calendar components (a date-only string parses as UTC midnight, which is off by
// hours vs local time at the birthday boundary).
export const selectIsUnder21 = createSelector(
  [selectCurrentUser],
  (user) => {
    const isoMatch = user?.dateOfBirth ? /^(\d{4})-(\d{2})-(\d{2})/.exec(user.dateOfBirth) : null;
    if (!isoMatch) return false;
    const y = Number(isoMatch[1]); const m = Number(isoMatch[2]); const d = Number(isoMatch[3]);
    const now = new Date();
    const beforeBirthdayThisYear = (now.getMonth() + 1) < m || ((now.getMonth() + 1) === m && now.getDate() < d);
    return now.getFullYear() - y - (beforeBirthdayThisYear ? 1 : 0) < 21;
  },
);

// Case 2: Location Manager (Operator)
export const selectIsLocationManager = createSelector(
  [selectCurrentUser],
  (user) => user?.role === 'Business' && !!user.location_id,
);

// Case 3: Business Owner
export const selectIsBusiness = createSelector(
  [selectCurrentUser],
  (user) => user?.role === 'Business' && !user.location_id,
);
export const selectIsAdmin = createSelector(
  [selectCurrentUser],
  (user) => user?.role === 'Admin',
);
export const selectAuthToken = createSelector(
  [selectAuthState],
  (auth) => auth.token,
);

// Multi-account: the saved accounts on this device and the active account id.
export const selectAccounts = createSelector(
  [selectAuthState],
  (auth) => auth.accounts ?? [],
);
export const selectActiveAccountId = createSelector(
  [selectAuthState],
  (auth) => auth.activeAccountId ?? null,
);
// True when a second account can still be added on this device.
export const selectCanAddAccount = createSelector(
  [selectAccounts],
  (accounts) => accounts.length < MAX_ACCOUNTS,
);

export const selectAuthError = createSelector(
  [selectAuthState],
  (auth) => auth.error,
);

export const selectAuthLoading = createSelector(
  [selectAuthState],
  (auth) => auth.loading,
);

export const selectUserLocation = createSelector(
  [selectAuthState],
  (auth) => auth.userLocation,
);

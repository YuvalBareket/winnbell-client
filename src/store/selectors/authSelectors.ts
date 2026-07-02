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

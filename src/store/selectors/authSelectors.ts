import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';

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

// Case 3: Business Owner (Admin)
export const selectIsBusiness = createSelector(
  [selectCurrentUser],
  (user) =>
    user?.role === 'Admin' || (user?.role === 'Business' && !user.location_id),
);
export const selectAuthToken = createSelector(
  [selectAuthState],
  (auth) => auth.token,
);

export const selectAuthError = createSelector(
  [selectAuthState],
  (auth) => auth.error,
);

export const selectAuthLoading = createSelector(
  [selectAuthState],
  (auth) => auth.loading,
);

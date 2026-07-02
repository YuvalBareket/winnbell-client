import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer, createMigrate, type PersistedState } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage
import authReducer from './slices/authSlice';

// 1. Create the root reducer (combining all slices)
const rootReducer = combineReducers({
  auth: authReducer,
  // tickets: ticketReducer, // Future slices go here
  // wallet: walletReducer,
});

// 2. Migrations. v2 introduces multi-account: seed `accounts`/`activeAccountId` from a
// pre-existing single-session auth slice so users who are already logged in keep their
// session AND immediately have a valid accounts array (avoids an undefined array on load).
const migrations = {
  2: (state: PersistedState): PersistedState => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = state as any;
    const auth = s?.auth;
    if (auth && auth.user && auth.token && (!Array.isArray(auth.accounts) || auth.accounts.length === 0)) {
      return {
        ...s,
        auth: {
          ...auth,
          accounts: [{ user: auth.user, token: auth.token, refreshToken: auth.refreshToken ?? null }],
          activeAccountId: auth.user.id,
        },
      };
    }
    return state;
  },
};

// 3. Configuration for Persistence
const persistConfig = {
  key: 'root',
  version: 2,
  storage,
  whitelist: ['auth'], // Only persist the auth slice
  migrate: createMigrate(migrations, { debug: false }),
};

// 4. Export the persisted reducer
export const persistedReducer = persistReducer(persistConfig, rootReducer);

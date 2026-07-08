import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  AuthState,
  LoginPayload,
  StoredAccount,
  TCoords,
} from '../../features/auth/types/auth.types';
import { MAX_ACCOUNTS } from '../../features/auth/types/auth.types';

const initialState: AuthState = {
  userLocation: null,
  isAuthenticated: false,
  user: null,
  token: null,
  refreshToken: null,
  loading: false,
  error: null,
  accounts: [],
  activeAccountId: null,
};

// Mirror a saved account into the top-level active fields. Keeping the active account
// duplicated here means every existing selector and the axios interceptor (which read
// state.auth.user/token/refreshToken) keep working with zero changes.
function activate(state: AuthState, acc: StoredAccount): void {
  state.isAuthenticated = true;
  state.user = acc.user;
  state.token = acc.token;
  state.refreshToken = acc.refreshToken;
  state.activeAccountId = acc.user.id;
  state.error = null;
}

// Defensive: a session persisted before multi-account existed has no `accounts` array
// until the redux-persist migration runs. Never let a reducer touch an undefined array.
function ensureAccounts(state: AuthState): void {
  if (!Array.isArray(state.accounts)) state.accounts = [];
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Primary login / token-refresh write-back / active-account re-sync.
    // If the user.id is already saved, update that account in place (this is how the
    // axios refresh interceptor writes the rotated token back into the active account
    // AND how a re-sync updates it) while keeping any OTHER saved account intact.
    // A genuinely new primary login (id not saved) resets to a single account, matching
    // the pre-multi-account behavior exactly.
    login: (state, action: PayloadAction<LoginPayload>) => {
      ensureAccounts(state);
      const acc: StoredAccount = {
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
      };
      const idx = state.accounts.findIndex((a) => a.user.id === acc.user.id);
      if (idx >= 0) {
        state.accounts[idx] = acc;
      } else {
        state.accounts = [acc];
      }
      activate(state, acc);
    },

    // Explicitly add a SECOND account (keeps the existing one). Used only by the
    // add-account flow; the UI gates this so it is never called past MAX_ACCOUNTS.
    addAccount: (state, action: PayloadAction<LoginPayload>) => {
      ensureAccounts(state);
      const acc: StoredAccount = {
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
      };
      const idx = state.accounts.findIndex((a) => a.user.id === acc.user.id);
      if (idx >= 0) {
        state.accounts[idx] = acc; // already saved -> update + make active
      } else if (state.accounts.length < MAX_ACCOUNTS) {
        state.accounts.push(acc);
      } else {
        // At cap (should not happen via UI): replace the active slot so we never exceed the cap.
        const activeIdx = state.accounts.findIndex((a) => a.user.id === state.activeAccountId);
        state.accounts[activeIdx >= 0 ? activeIdx : 0] = acc;
      }
      activate(state, acc);
    },

    // Token-refresh write-back: update ONE account's tokens WITHOUT changing which account
    // is active. The axios interceptor must use this (not `login`, which activates): if the
    // user switches accounts while a refresh is in flight, completing the refresh must not
    // yank them back to the account that was active when the refresh started.
    updateAccountTokens: (state, action: PayloadAction<LoginPayload>) => {
      ensureAccounts(state);
      const acc: StoredAccount = {
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
      };
      const idx = state.accounts.findIndex((a) => a.user.id === acc.user.id);
      // Only ever UPDATE an account that is still saved. Never push here: a refresh that resolves
      // after the account was removed must not resurrect it (F9). The client.ts caller also guards
      // this, so a missing index means "removed mid-refresh" and is intentionally a no-op.
      if (idx < 0) return;
      state.accounts[idx] = acc;
      // Mirror to the top-level fields only when this account is still the active one.
      if (state.activeAccountId === acc.user.id) {
        state.isAuthenticated = true;
        state.user = acc.user;
        state.token = acc.token;
        state.refreshToken = acc.refreshToken;
      }
    },

    // Instant switch to another saved account. No network / Supabase call needed —
    // the account runs on its stored internal JWT (refreshed on demand by the interceptor).
    switchAccount: (state, action: PayloadAction<{ id: number }>) => {
      ensureAccounts(state);
      const acc = state.accounts.find((a) => a.user.id === action.payload.id);
      if (acc) activate(state, acc);
    },

    // Remove one saved account. If it was active, fall back to the remaining account,
    // else become fully logged out.
    removeAccount: (state, action: PayloadAction<{ id: number }>) => {
      ensureAccounts(state);
      state.accounts = state.accounts.filter((a) => a.user.id !== action.payload.id);
      if (state.activeAccountId === action.payload.id) {
        if (state.accounts.length > 0) {
          activate(state, state.accounts[0]);
        } else {
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
          state.refreshToken = null;
          state.activeAccountId = null;
        }
      }
    },

    // Full logout — clears every saved account on this device.
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.error = null;
      state.accounts = [];
      state.activeAccountId = null;
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
    clearBusinessSetup: (state) => {
      if (state.user) {
        state.user.requiresBusinessSetup = false;
      }
      // keep the saved-account copy in sync
      const acc = state.accounts?.find((a) => a.user.id === state.activeAccountId);
      if (acc) acc.user.requiresBusinessSetup = false;
    },
    setBusinessActive: (state) => {
      if (state.user) {
        state.user.businessIsActive = true;
      }
      const acc = state.accounts?.find((a) => a.user.id === state.activeAccountId);
      if (acc) acc.user.businessIsActive = true;
    },
    updateBusinessUser: (state, action: PayloadAction<{ businessIsActive?: boolean; businessLogoUrl?: string | null }>) => {
      const apply = (u: { businessIsActive?: boolean; businessLogoUrl?: string | null }) => {
        if (action.payload.businessIsActive !== undefined) u.businessIsActive = action.payload.businessIsActive;
        if (action.payload.businessLogoUrl !== undefined) u.businessLogoUrl = action.payload.businessLogoUrl;
      };
      if (state.user) apply(state.user);
      const acc = state.accounts?.find((a) => a.user.id === state.activeAccountId);
      if (acc) apply(acc.user);
    },
  },
});

export const {
  login, addAccount, switchAccount, removeAccount, updateAccountTokens, logout,
  setLoading, setError, setUserLocation, clearBusinessSetup, setBusinessActive, updateBusinessUser,
} = authSlice.actions;
export default authSlice.reducer;

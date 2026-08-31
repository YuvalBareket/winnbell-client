import axios from 'axios';
import { store } from '../../store/store';
import { logout, removeAccount, updateAccountTokens } from '../../store/slices/authSlice';
import { supabase } from '../lib/supabase';
import { broadcastLogout } from '../lib/crossTabLogout';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Read/delete the Authorization header across axios header shapes (AxiosHeaders instance
// or plain object) without using `any`.
type HeaderBag = { get?: (k: string) => unknown; delete?: (k: string) => void; Authorization?: unknown; authorization?: unknown };
const readAuthHeader = (h: unknown): string => {
  const bag = h as HeaderBag | undefined;
  if (!bag) return '';
  const viaGet = typeof bag.get === 'function' ? bag.get('Authorization') : undefined;
  return String(viaGet ?? bag.Authorization ?? bag.authorization ?? '');
};
const deleteAuthHeader = (h: unknown): void => {
  const bag = h as HeaderBag | undefined;
  if (!bag) return;
  if (typeof bag.delete === 'function') bag.delete('Authorization');
  delete bag.Authorization;
  delete bag.authorization;
};

// Shared refresh state, keyed PER ACCOUNT. A single shared promise would let account B's
// refresh call silently join account A's in-flight refresh: A's tokens get written back,
// B's never do, and B's retried mutation goes out with its stale token and dies quietly.
// Keying by account id dedupes concurrent refreshes for the SAME account (the important
// case: a cold-open request burst) while never cross-wiring two accounts.
const refreshPromises = new Map<number | null, Promise<void>>();

// Run ONE /auth/refresh for the pinned account and write the rotated tokens back.
// Uses bare axios (not `api`) so the interceptors can't recurse into this call.
// Write-back semantics are load-bearing (audit F9/F11): re-read the account by its
// pinned id at write-back time — a removed account is never resurrected, and the
// CURRENT user object is used so concurrent updates aren't clobbered.
const runTokenRefresh = (accountId: number | null, refreshToken: string): Promise<void> => {
  const existing = refreshPromises.get(accountId);
  if (existing) return existing;
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
  const p = axios
    .post(`${base}/auth/refresh`, { refreshToken })
    .then(({ data }) => {
      const current = (store.getState().auth.accounts ?? []).find((a) => a.user.id === accountId);
      if (current) {
        store.dispatch(updateAccountTokens({ user: current.user, token: data.token, refreshToken: data.refreshToken }));
      }
    })
    .finally(() => { refreshPromises.delete(accountId); });
  refreshPromises.set(accountId, p);
  return p;
};

// True when the internal JWT is expired or expires within `ms`. Unparsable tokens
// return false: the reactive 401 path is the authority on whether they still work.
const tokenExpiresWithin = (token: string, ms: number): boolean => {
  try {
    // base64url -> base64 needs the '=' padding restored: atob throws on inputs whose
    // length % 4 is 2 or 3, and payload length varies per user (id digits, role string),
    // so without padding some users' tokens would silently never proactively refresh.
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4)));
    return typeof payload.exp === 'number' && payload.exp * 1000 - Date.now() < ms;
  } catch {
    return false;
  }
};

// Clock-skew guard for the proactive path, per account: a device clock far in the future
// makes every token look expired forever, and without this floor each new request would
// fire its own /auth/refresh (a rotation storm that eventually invalidates the family).
// At most one PROACTIVE refresh per window per account; between windows the stale-looking
// token is sent as-is and the reactive 401 path (which never loops) remains the authority.
// The stamp is set BEFORE the attempt on purpose - stamping only on success would turn a
// server outage into one refresh POST per request; this way failures back off naturally.
const lastProactiveRefreshAt = new Map<number | null, number>();
const PROACTIVE_MIN_INTERVAL_MS = 15_000;

// 1. Request Interceptor — attach the ACTIVE account's token from Redux, UNLESS the caller
// explicitly set its own Authorization. /auth/sync must send the SUPABASE access token; with
// multi-account a user can be signed in while syncing a second account, and overwriting that
// header with the internal token made every add-account sign-in fail with 401.
//
// PROACTIVE refresh: the internal JWT lives 1h, so the first burst of requests on a cold
// open after an idle hour is GUARANTEED to 401. The expiry is readable client-side, so when
// the token is expired (or within 30s of it) refresh FIRST — one /auth/refresh, then every
// queued request goes out with the fresh token. This removes the 401 -> refresh -> retry
// waterfall (~0.5-1s) from every cold open. The reactive 401 handler below stays as the
// fallback for everything expiry can't predict (server-side revocation, clock skew).
api.interceptors.request.use(
  async (config) => {
    // Caller pinned its own Authorization (e.g. /auth/sync with the Supabase token):
    // never touch it and never spend the active account's refresh token for it.
    if (readAuthHeader(config.headers)) return config;

    const { token, refreshToken, activeAccountId } = store.getState().auth;
    if (token && refreshToken && tokenExpiresWithin(token, 30_000)) {
      const inFlight = refreshPromises.get(activeAccountId);
      if (inFlight) {
        // A refresh for THIS account is already in flight (started by a concurrent
        // request in this same cold-open burst): JOIN it instead of consulting the skew
        // guard, or requests 2..n of the burst would 401 with the expired token anyway.
        await inFlight.catch(() => {});
      } else if (Date.now() - (lastProactiveRefreshAt.get(activeAccountId) ?? 0) > PROACTIVE_MIN_INTERVAL_MS) {
        lastProactiveRefreshAt.set(activeAccountId, Date.now());
        try {
          await runTokenRefresh(activeAccountId, refreshToken);
        } catch {
          // Proactive refresh is best-effort: on ANY failure send the request with the
          // stored token and let the reactive path decide. It alone owns the
          // drop-account/logout rules (definitive 401/403 vs transient blip).
        }
      }
      // else: skew guard active with no refresh in flight — send the request as-is; the
      // reactive 401 path remains the authority.
    }

    const freshToken = store.getState().auth.token;
    if (freshToken) {
      config.headers.Authorization = `Bearer ${freshToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 2. Response Interceptor — refresh token on 401, then re-issue the original request.
//
// The retry must happen HERE (not via React Query): React Query only retries
// queries, never mutations, so without this a receipt submission or code redeem
// fired just after token expiry would fail once and force the user to tap again.
// The _retry flag prevents loops; refreshPromise dedupes concurrent refreshes.

// Throttle for the null-refresh-token repair path (audit P2-7): a burst of 401s from a
// corrupted account must trigger ONE Supabase-session nudge, not one per failed request.
let nullTicketRepairAt = 0;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config?._retry) {
      error.config._retry = true;

      // Only handle 401s from requests that carried the ACTIVE account's internal token.
      // Anything else — /auth/sync's Supabase token, or a token from an account that was
      // switched away from / already rotated by a concurrent refresh — must never consume
      // the active account's refresh token or log anyone out.
      const sentAuth = readAuthHeader(error.config?.headers);
      const sentToken = sentAuth.startsWith('Bearer ') ? sentAuth.slice(7) : sentAuth;
      const entry = store.getState().auth;
      if (!entry.token || sentToken !== entry.token) {
        return Promise.reject(error);
      }
      // Pin the account this 401 belongs to NOW. The user may switch accounts while the
      // refresh below is in flight; every follow-up action (retry token, account drop) must
      // target THIS account, never "whichever account is active by then".
      const failingId = entry.activeAccountId;
      const failingUser = entry.user;

      if (entry.refreshToken && failingUser) {
        try {
          // updateAccountTokens (NOT login) inside runTokenRefresh: writes the rotated
          // tokens back to the pinned account without re-activating it if the user
          // switched away mid-refresh (F9/F11 — see runTokenRefresh above).
          await runTokenRefresh(failingId, entry.refreshToken);
          // Mutations (POST/PUT/PATCH/DELETE) are NOT retried by React Query, so re-issue
          // them here with the fresh token (this is why this path exists). GET requests are
          // left to React Query's own retry (retry: 1 in main.tsx) — re-issuing a GET response
          // from the axios 1.x error interceptor is the brittle pattern that broke query
          // recovery (e.g. the risk-level screen), so for GETs we reject and let the query retry.
          const method = (error.config.method ?? 'get').toLowerCase();
          const isMutation = method !== 'get' && method !== 'head' && method !== 'options';
          // Retry with the refreshed token of the SAME account the request was fired as.
          // Never let the request interceptor attach the CURRENT active token here — after a
          // mid-refresh account switch that would re-issue the mutation as the wrong user.
          const refreshedAcc = (store.getState().auth.accounts ?? []).find((a) => a.user.id === failingId);
          if (isMutation && refreshedAcc) {
            deleteAuthHeader(error.config.headers);
            error.config.headers.Authorization = `Bearer ${refreshedAcc.token}`;
            return api(error.config);
          }
          return Promise.reject(error);
        } catch (refreshErr) {
          // Drop the account ONLY when the server definitively rejected the refresh token
          // (401/403). A transient failure - network blip, server restart, 5xx, 429 - says
          // nothing about the token's validity; dropping on those logged users out
          // mid-session over a single hiccup. Reject this one request instead: the next
          // 401 retries the refresh with the same still-valid token.
          const refreshStatus = (refreshErr as { response?: { status?: number } })?.response?.status;
          if (refreshStatus !== 401 && refreshStatus !== 403) {
            return Promise.reject(error);
          }
          // Definitive rejection — fall through to dropping the account
        }
      } else if (failingUser) {
        // No stored refresh token (corrupted/legacy persisted state - audit P2-7). The
        // server never rejected anything, so don't log the user out yet: if the Supabase
        // session still belongs to THIS account, nudge it - the TOKEN_REFRESHED event
        // makes useSupabaseSync re-sync (its needsResync check passes for a null ticket)
        // and mint a fresh internal token pair with all the usual identity/role guards.
        // This request fails once; the repaired tokens serve the next one. If there is
        // no matching Supabase session, nothing can recover the account - fall through
        // to the normal drop below.
        try {
          const { data: s } = await supabase.auth.getSession();
          const sessionEmail = s.session?.user?.email?.toLowerCase();
          const failingEmail = String(failingUser.email ?? '').toLowerCase();
          if (sessionEmail && failingEmail && sessionEmail === failingEmail) {
            if (Date.now() - nullTicketRepairAt > 30_000) {
              nullTicketRepairAt = Date.now();
              supabase.auth.refreshSession().catch(() => {});
            }
            return Promise.reject(error);
          }
        } catch {
          // Session lookup itself failed (transient) - that says nothing about the
          // account, and we never log out without a definitive server rejection.
          return Promise.reject(error);
        }
      }

      // Refresh failed or unavailable: drop ONLY the failing account. If another account is
      // saved on this device, fall back to it (Instagram-style) instead of logging everything
      // out; only when it was the last account do we perform the full logout.
      const now = store.getState().auth;
      const stillSaved = (now.accounts ?? []).some((a) => a.user.id === failingId);
      if (failingId == null || !stillSaved) {
        // Already removed by a concurrent handler — nothing left to do.
        return Promise.reject(error);
      }
      const others = now.accounts.filter((a) => a.user.id !== failingId);
      // Clear cached data only when the failing account is the one on screen.
      if (now.activeAccountId === failingId) {
        import('../../main').then(({ queryClient }) => queryClient.clear()).catch(() => {});
      }
      if (others.length > 0) {
        store.dispatch(removeAccount({ id: failingId }));
        // Keep the Supabase session: it may belong to the remaining account, and the app
        // runs on internal JWTs anyway (useSupabaseSync's identity check ignores a
        // mismatched session, so it can never resurrect the dropped account).
      } else {
        // Last account's refresh token was DEFINITIVELY rejected (already dead server-side,
        // so no /auth/logout revoke needed). Full logout + clear other tabs.
        const wasAuthenticated = now.isAuthenticated;
        store.dispatch(logout());
        broadcastLogout();
        if (wasAuthenticated) {
          supabase.auth.signOut().catch(() => {});
        }
      }
    }

    return Promise.reject(error);
  },
);

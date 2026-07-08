import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAppDispatch, useAppSelector } from '../../store/hook';
import { selectIsAuthenticated, selectCurrentUser, selectIsBusiness } from '../../store/selectors/authSelectors';
import { login, logout, addAccount } from '../../store/slices/authSlice';
import { store } from '../../store/store';
import { syncUserFn } from '../../features/auth/api/auth.api';
import { onCrossTabLogout } from '../lib/crossTabLogout';

export const useSupabaseSync = (retryCount = 0) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);
  const isBusiness = useAppSelector(selectIsBusiness);

  // Keep refs so the onAuthStateChange closure always sees fresh values
  const isAuthenticatedRef = useRef(isAuthenticated);
  const needsResyncRef = useRef(false);
  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
    needsResyncRef.current = isAuthenticated && isBusiness && currentUser?.businessLogoUrl === undefined;
  });

  const syncing = useRef(false);
  const isRegionBlocked = useRef(false);
  const [syncError, setSyncError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    syncing.current = false;
    // Per-effect-run abort + cancelled flag (F14): if the effect re-runs (retry) or unmounts while
    // a /auth/sync is in flight, we abort that request and ignore its result, so a superseded
    // attempt can never run concurrently with - or apply its result after - the new one.
    let cancelled = false;
    const controller = new AbortController();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsLoaded(true);
      setIsSignedIn(!!session);

      if (!session) {
        // DECOUPLED (F1): a Supabase SIGNED_OUT must NEVER log the user out of the app.
        // Supabase is only the login provider; the app runs on the independent internal JWT
        // + 30-day refresh token. Supabase auto-refreshes its OWN token hourly, and that can
        // fail involuntarily (two contexts racing its single-use token, suspend/resume),
        // firing SIGNED_OUT — obeying it was the "kicked out after ~2 hours" bug. Real logout
        // is explicit (useLogout / account removal, propagated to other tabs by
        // broadcastLogout) and token revocation is enforced server-side (/auth/logout,
        // password reset). Here we only clear the transient registration flags.
        if (event === 'SIGNED_OUT') {
          // Clear only transient REGISTRATION flags. install_prompt_dismissed is a user
          // preference and real logout (useLogout/useAccountSwitcher) already clears it -
          // wiping it here would reset the preference on an involuntary Supabase signout.
          localStorage.removeItem('pendingRole');
          localStorage.removeItem('pendingInviteToken');
        }
        syncing.current = false;
        return;
      }

      // inviteToken and role still come from localStorage because they're set before the
      // Supabase OAuth flow redirect (when OAuth returns, the session fires before any page
      // code can run). For password sign-up the role is embedded in JWT user_metadata; for
      // OAuth it isn't, so we store pendingRole in localStorage in handleSocialSignUp and read it here.
      const pendingInviteToken = localStorage.getItem('pendingInviteToken');
      const pendingRole = localStorage.getItem('pendingRole');
      // Set by the "add account" flow (see LoginPage add mode) right before signing in the
      // SECOND account. When set, we append the new account instead of replacing the current
      // one, and we must NOT let the "already authenticated" guard below short-circuit.
      const isAddingAccount = localStorage.getItem('pendingAddAccount') === '1';
      // Referral code captured on the /join landing page (only rewards a fresh registration).
      const pendingReferralCode = localStorage.getItem('pendingReferralCode');
      // Acquisition channel (analytics §4), derived from how the user arrived. Priority:
      // referral link > promo code > location flyer > direct. Server sets it on fresh signup only.
      const pendingTicketCode = localStorage.getItem('pendingTicketCode');
      const pendingLocationId = localStorage.getItem('pendingLocationId');
      const acquisitionSource = pendingReferralCode
        ? 'referral'
        : (pendingTicketCode && pendingTicketCode.startsWith('PROMO'))
          ? 'promo_code'
          : (pendingLocationId || pendingTicketCode)
            ? 'location_flyer'
            : 'direct';

      // Navigate after an explicit login/signup action, not on silent session restore
      const isFreshLogin = event === 'SIGNED_IN' || event === 'USER_UPDATED';

      if (
        isRegionBlocked.current ||
        (isAuthenticatedRef.current && !needsResyncRef.current && !pendingInviteToken && !pendingRole && !isAddingAccount) ||
        syncing.current
      ) return;

      syncing.current = true;
      setSyncError(false);

      try {
        // Role is embedded in the Supabase JWT user_metadata for password sign-ups.
        // For OAuth sign-ups, user_metadata.role is absent so we pass pendingRole from
        // localStorage (set by handleSocialSignUp before the OAuth redirect).
        const data = await syncUserFn(session.access_token, {
          role: pendingRole,
          inviteToken: pendingInviteToken,
          referralCode: pendingReferralCode,
          acquisitionSource,
          // Which location's flyer (for location_flyer) and which promo code (for promo_code).
          acquiredViaLocationId: pendingLocationId ? Number(pendingLocationId) : null,
          promoCode: (pendingTicketCode && pendingTicketCode.startsWith('PROMO')) ? pendingTicketCode : null,
        }, controller.signal);

        // A retry/unmount superseded this run while the request was completing — don't apply it.
        if (cancelled) return;

        localStorage.removeItem('pendingInviteToken');
        localStorage.removeItem('pendingRole');
        localStorage.removeItem('pendingReferralCode');

        // Decide add-vs-replace by IDENTITY, not just the flag. The flag alone is fragile for the
        // add-REGISTER flow (the new account's session only arrives after an email round-trip, during
        // which the current account's own token refresh could fire). Comparing the just-synced user
        // to the active account is timing-independent:
        //  - no active account, or same user as active  -> normal login / token-refresh write-back
        //  - different user + intentional add            -> append the second account
        //  - different user + NOT an add (stale session) -> ignore, never clobber the active account
        const payload = { user: data.user, token: data.token, refreshToken: data.refreshToken ?? null };
        const authNow = store.getState().auth;
        const activeId = authNow.activeAccountId;
        const syncedId = data.user.id;

        if (activeId == null || syncedId === activeId) {
          // Same-account sync. Clear a lingering pendingAddAccount flag (F10) ONLY on an explicit
          // fresh sign-in: the user actively logged into the SAME account, so no add is pending
          // and the flag is stale (otherwise it makes every hourly resync bypass the early-return
          // guard). A background TOKEN_REFRESHED must NOT clear it - during an add-via-register
          // email round-trip the current account's hourly refresh lands here while the flag is
          // still legitimately waiting for the NEW account's session to arrive.
          if (isFreshLogin) localStorage.removeItem('pendingAddAccount');
          dispatch(login(payload));
        } else if (isAddingAccount) {
          localStorage.removeItem('pendingAddAccount');
          import('../../main').then(({ queryClient }) => queryClient.clear()).catch(() => {});
          dispatch(addAccount(payload));
        } else {
          // A Supabase session for a different user than the active account with no add intent
          // (e.g. a resync firing on reload while the active account differs). Leave the active
          // account untouched.
          return;
        }

        if (isFreshLogin) {
          const pendingLocationId = localStorage.getItem('pendingLocationId');
          localStorage.removeItem('pendingLocationId');
          if (localStorage.getItem('pendingTicketCode')) {
            navigate('/scan');
          } else if (data.user.role === 'Admin') {
            navigate('/admin');
          } else if (data.user.role === 'Business') {
            // Managers are role='Business' with a location_id; both owners and managers land on /campaign.
            navigate(data.user.requiresBusinessSetup ? '/partner/setup-business' : '/campaign');
          } else {
            navigate(pendingLocationId ? `/scan?l=${pendingLocationId}` : '/scan');
          }
        }
      } catch (err: unknown) {
        // Aborted by a retry/unmount (F14) — the superseding run owns the outcome; do nothing.
        if (cancelled) return;
        const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
        const status = axiosErr?.response?.status;
        const message = axiosErr?.response?.data?.message;
        // Only treat this as a failed ADD when there is actually a signed-in account to
        // protect. A stale flag on a logged-out fresh login must fall through to the normal
        // error handling below (region block, deleted account, etc.).
        if (isAddingAccount && isAuthenticatedRef.current) {
          // A second-account add failed at the sync step. Keep the CURRENT account fully
          // intact: never dispatch logout and never call supabase.signOut() here (signOut
          // would fire SIGNED_OUT and wipe the current account). The half-established
          // Supabase session is harmless (the app runs on internal JWTs and the reload
          // guard ignores it). Clear the flag and return to the current account's home.
          localStorage.removeItem('pendingAddAccount');
          navigate('/');
          return;
        }
        // These four branches are TERMINAL fresh-login failures (they log out and sign out of
        // Supabase). Reaching them means no add is salvageable, so also drop a stale
        // pendingAddAccount flag - leaving it would keep bypassing the early-return guard.
        if (message === 'REGION_RESTRICTED') {
          isRegionBlocked.current = true;
          dispatch(logout());
          localStorage.removeItem('pendingAddAccount');
          await supabase.auth.signOut();
          navigate('/region-blocked');
        } else if (status === 403 && message === 'ACCOUNT_DELETED') {
          dispatch(logout());
          localStorage.removeItem('pendingRole');
          localStorage.removeItem('pendingInviteToken');
          localStorage.removeItem('pendingAddAccount');
          await supabase.auth.signOut();
          navigate('/login?deleted=1');
        } else if (status === 401) {
          // Token is expired or invalid — sign out and redirect so user can log in again
          dispatch(logout());
          localStorage.removeItem('pendingRole');
          localStorage.removeItem('pendingInviteToken');
          localStorage.removeItem('pendingAddAccount');
          await supabase.auth.signOut();
          navigate('/');
        } else if (status === 400 && message) {
          // Invite token invalid/expired/already-used — sign out and send back to register
          dispatch(logout());
          localStorage.removeItem('pendingRole');
          localStorage.removeItem('pendingInviteToken');
          localStorage.removeItem('pendingAddAccount');
          await supabase.auth.signOut();
          navigate(`/register?syncError=${encodeURIComponent(message)}`);
        } else {
          setSyncError(true);
        }
      } finally {
        syncing.current = false;
        // NOTE: pendingAddAccount is intentionally NOT cleared here. For the add-REGISTER flow it
        // must survive until the new account's session arrives after the email round-trip. It is
        // cleared where it is actually consumed (the add branch) or where the add fails.
      }
    });

    return () => {
      cancelled = true;
      controller.abort();
      subscription.unsubscribe();
    };
  }, [retryCount]);

  // Cross-tab logout: when another tab performs a REAL logout it calls broadcastLogout();
  // mirror it here by clearing this tab's internal session. This replaces the cross-tab
  // propagation that the Supabase SIGNED_OUT handler used to provide before F1 decoupled it,
  // and (unlike the old path) never fires on an involuntary Supabase token-refresh failure.
  useEffect(() => {
    return onCrossTabLogout(() => {
      if (!isAuthenticatedRef.current) return;
      dispatch(logout());
      import('../../main').then(({ queryClient }) => queryClient.clear()).catch(() => {});
    });
  }, [dispatch]);

  return { syncError, isLoaded, isSignedIn };
};

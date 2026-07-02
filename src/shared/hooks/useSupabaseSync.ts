import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAppDispatch, useAppSelector } from '../../store/hook';
import { selectIsAuthenticated, selectCurrentUser, selectIsBusiness } from '../../store/selectors/authSelectors';
import { login, logout, addAccount } from '../../store/slices/authSlice';
import { store } from '../../store/store';
import { syncUserFn } from '../../features/auth/api/auth.api';

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsLoaded(true);
      setIsSignedIn(!!session);

      if (!session) {
        // Only clean up on explicit sign-out. Silent session drops (tab inactive,
        // Supabase token refresh failure) must NOT wipe pendingRole/pendingInviteToken
        // as a user may be mid-registration with an OAuth redirect pending.
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem('pendingRole');
          localStorage.removeItem('pendingInviteToken');
          localStorage.removeItem('pendingAddAccount');
          localStorage.removeItem('install_prompt_dismissed');
          if (isAuthenticatedRef.current) {
            dispatch(logout());
            localStorage.removeItem('wasLoggedIn');
            import('../../main').then(({ queryClient }) => queryClient.clear()).catch(() => {});
          }
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
        });

        localStorage.removeItem('pendingInviteToken');
        localStorage.removeItem('pendingRole');
        localStorage.removeItem('pendingReferralCode');
        localStorage.setItem('wasLoggedIn', '1');

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
            navigate(data.user.requiresBusinessSetup ? '/partner/setup-business' : '/activity');
          } else if (data.user.role === 'Manager' || data.user.location_id != null) {
            navigate('/activity');
          } else {
            navigate(pendingLocationId ? `/scan?l=${pendingLocationId}` : '/scan');
          }
        }
      } catch (err: unknown) {
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
        if (message === 'REGION_RESTRICTED') {
          isRegionBlocked.current = true;
          dispatch(logout());
          await supabase.auth.signOut();
          navigate('/region-blocked');
        } else if (status === 403 && message === 'ACCOUNT_DELETED') {
          dispatch(logout());
          localStorage.removeItem('wasLoggedIn');
          localStorage.removeItem('pendingRole');
          localStorage.removeItem('pendingInviteToken');
          await supabase.auth.signOut();
          navigate('/login?deleted=1');
        } else if (status === 401) {
          // Token is expired or invalid — sign out and redirect so user can log in again
          dispatch(logout());
          localStorage.removeItem('wasLoggedIn');
          localStorage.removeItem('pendingRole');
          localStorage.removeItem('pendingInviteToken');
          await supabase.auth.signOut();
          navigate('/');
        } else if (status === 400 && message) {
          // Invite token invalid/expired/already-used — sign out and send back to register
          dispatch(logout());
          localStorage.removeItem('wasLoggedIn');
          localStorage.removeItem('pendingRole');
          localStorage.removeItem('pendingInviteToken');
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

    return () => subscription.unsubscribe();
  }, [retryCount]);

  return { syncError, isLoaded, isSignedIn };
};

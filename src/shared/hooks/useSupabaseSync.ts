import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAppDispatch, useAppSelector } from '../../store/hook';
import { selectIsAuthenticated, selectCurrentUser, selectIsBusiness } from '../../store/selectors/authSelectors';
import { login, logout } from '../../store/slices/authSlice';
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

      // Navigate after an explicit login/signup action, not on silent session restore
      const isFreshLogin = event === 'SIGNED_IN' || event === 'USER_UPDATED';

      if (
        isRegionBlocked.current ||
        (isAuthenticatedRef.current && !needsResyncRef.current && !pendingInviteToken && !pendingRole) ||
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
        });

        localStorage.removeItem('pendingInviteToken');
        localStorage.removeItem('pendingRole');
        localStorage.setItem('wasLoggedIn', '1');
        dispatch(login({ user: data.user, token: data.token, refreshToken: data.refreshToken ?? null }));

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
      }
    });

    return () => subscription.unsubscribe();
  }, [retryCount]);

  return { syncError, isLoaded, isSignedIn };
};

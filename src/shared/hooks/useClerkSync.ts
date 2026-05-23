import { useEffect, useRef, useState } from 'react';
import { useAuth, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hook';
import { selectIsAuthenticated, selectCurrentUser, selectIsBusiness } from '../../store/selectors/authSelectors';
import { login, logout } from '../../store/slices/authSlice';
import { syncUserFn } from '../../features/auth/api/auth.api';

// Single source of truth for syncing a Clerk session into Redux.
// Runs whenever Clerk is signed in but Redux has no auth state.
export const useClerkSync = (retryCount = 0) => {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { signOut } = useClerk();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);
  const isBusiness = useAppSelector(selectIsBusiness);
  const needsResync = isAuthenticated && isBusiness && currentUser?.businessLogoUrl === undefined;
  const syncing = useRef(false);
  const isRegionBlocked = useRef(false);
  const [syncError, setSyncError] = useState(false);

  useEffect(() => {
    const pendingInviteToken = localStorage.getItem('pendingInviteToken');
    if (!isLoaded || !isSignedIn || isRegionBlocked.current || (isAuthenticated && !needsResync && !pendingInviteToken) || syncing.current) return;

    syncing.current = true;
    setSyncError(false);

    const pendingRole = localStorage.getItem('pendingRole');
    const isFreshLogin = !localStorage.getItem('wasLoggedIn');

    getToken()
      .then((token) => {
        if (!token) throw new Error('No token available');
        return syncUserFn(token, { role: pendingRole, inviteToken: pendingInviteToken });
      })
      .then((data) => {
        localStorage.removeItem('pendingRole');
        localStorage.removeItem('pendingInviteToken');
        localStorage.setItem('wasLoggedIn', '1');
        dispatch(login({ user: data.user, token: data.token }));
        // Only navigate on a fresh login — not on browser reopen re-sync
        if (isFreshLogin) {
          const pendingLocationId = localStorage.getItem('pendingLocationId');
          localStorage.removeItem('pendingLocationId');
          if (localStorage.getItem('pendingTicketCode')) {
            navigate('/scan');
          } else if (data.user.role === 'Business' || data.user.location_id != null) {
            navigate('/activity');
          } else if (data.user.role === 'User') {
            navigate(pendingLocationId ? `/scan?l=${pendingLocationId}` : '/scan');
          }
        }
      })
      .catch(async (err: any) => {
        const message = err?.response?.data?.message;
        if (message === 'REGION_RESTRICTED') {
          isRegionBlocked.current = true;
          dispatch(logout());
          await signOut();
          navigate('/region-blocked');
        } else {
          // All other errors (network, server, 401): do not sign out of Clerk.
          setSyncError(true);
        }
      })
      .finally(() => { syncing.current = false; });
  }, [isLoaded, isSignedIn, isAuthenticated, needsResync, retryCount]);

  return { syncError };
};

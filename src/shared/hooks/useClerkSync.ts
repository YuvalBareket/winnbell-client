import { useEffect, useRef } from 'react';
import { useAuth, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hook';
import { selectIsAuthenticated, selectCurrentUser, selectIsBusiness } from '../../store/selectors/authSelectors';
import { login, logout } from '../../store/slices/authSlice';
import { syncUserFn } from '../../features/auth/api/auth.api';

// Single source of truth for syncing a Clerk session into Redux.
// Runs whenever Clerk is signed in but Redux has no auth state.
export const useClerkSync = () => {
  const { isSignedIn, getToken } = useAuth();
  const { signOut } = useClerk();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);
  const isBusiness = useAppSelector(selectIsBusiness);
  const needsResync = isAuthenticated && isBusiness && currentUser?.businessLogoUrl === undefined;
  const syncing = useRef(false);

  useEffect(() => {
    const pendingInviteToken = sessionStorage.getItem('pendingInviteToken');
    const alreadySyncedThisSession = sessionStorage.getItem('synced');
    if (!isSignedIn || (isAuthenticated && !needsResync && !pendingInviteToken && alreadySyncedThisSession) || syncing.current) return;

    syncing.current = true;

    const pendingRole = sessionStorage.getItem('pendingRole');

    getToken()
      .then((token) => {
        if (!token) throw new Error('No token available');
        return syncUserFn(token, { role: pendingRole, inviteToken: pendingInviteToken });
      })
      .then((data) => {
        sessionStorage.removeItem('pendingRole');
        sessionStorage.removeItem('pendingInviteToken');
        sessionStorage.setItem('synced', '1');
        dispatch(login({ user: data.user, token: data.token }));
        const pendingLocationId = sessionStorage.getItem('pendingLocationId');
        sessionStorage.removeItem('pendingLocationId');
        if (localStorage.getItem('pendingTicketCode')) {
          navigate('/scan');
        } else if (data.user.role === 'Business' || data.user.location_id != null) {
          navigate('/activity');
        } else if (data.user.role === 'User') {
          navigate(pendingLocationId ? `/scan?l=${pendingLocationId}` : '/scan');
        }
      })
      .catch((err: any) => {
        dispatch(logout());
        signOut();
        if (err?.response?.data?.message === 'REGION_RESTRICTED') {
          navigate('/region-blocked');
        } else {
          navigate('/login?error=session');
        }
      })
      .finally(() => { syncing.current = false; });
  }, [isSignedIn, isAuthenticated, needsResync]);
};

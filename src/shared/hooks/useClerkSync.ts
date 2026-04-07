import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hook';
import { selectIsAuthenticated, selectCurrentUser, selectIsBusiness } from '../../store/selectors/authSelectors';
import { login } from '../../store/slices/authSlice';
import { syncUserFn } from '../../features/auth/api/auth.api';

// Single source of truth for syncing a Clerk session into Redux.
// Runs whenever Clerk is signed in but Redux has no auth state.
export const useClerkSync = () => {
  const { isSignedIn, getToken } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);
  const isBusiness = useAppSelector(selectIsBusiness);
  const needsResync = isAuthenticated && isBusiness && currentUser?.businessLogoUrl === undefined;
  const syncing = useRef(false);

  useEffect(() => {
    const pendingInviteToken = sessionStorage.getItem('pendingInviteToken');
    if (!isSignedIn || (isAuthenticated && !needsResync && !pendingInviteToken) || syncing.current) return;

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
        dispatch(login({ user: data.user, token: data.token }));
        if (localStorage.getItem('pendingTicketCode')) {
          navigate('/scan');
        }
      })
      .catch(console.error)
      .finally(() => { syncing.current = false; });
  }, [isSignedIn, isAuthenticated, needsResync]);
};

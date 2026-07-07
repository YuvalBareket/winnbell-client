import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hook';
import { logout, removeAccount } from '../../store/slices/authSlice';
import { selectAccounts, selectActiveAccountId } from '../../store/selectors/authSelectors';
import { supabase } from '../lib/supabase';
import { homePathForUser } from './useAccountSwitcher';
import { broadcastLogout } from '../lib/crossTabLogout';
import { logoutFn } from '../../features/auth/api/auth.api';

/**
 * "Log out" is per-account when more than one account is saved on this device:
 * it signs out only the ACTIVE account and drops into the remaining one (Instagram
 * style). When it is the last account, it performs a full logout: clears Redux +
 * localStorage + React Query and signs out of Supabase.
 */
export const useLogout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const accounts = useAppSelector(selectAccounts);
  const activeAccountId = useAppSelector(selectActiveAccountId);

  return async () => {
    const { queryClient } = await import('../../main');
    // Capture the active account's refresh token BEFORE we drop it, so we can revoke it
    // server-side (F6) — a logged-out token must not stay refreshable for 30 days.
    const activeRefresh = accounts.find((a) => a.user.id === activeAccountId)?.refreshToken ?? null;

    // More than one account saved: log out only the active one, stay signed into the other.
    if (accounts.length > 1 && activeAccountId != null) {
      const remaining = accounts.filter((a) => a.user.id !== activeAccountId);
      queryClient.clear();
      // flushSync so the remaining account's role is applied before we navigate (see switchTo).
      flushSync(() => { dispatch(removeAccount({ id: activeAccountId })); });
      navigate(homePathForUser(remaining[0]?.user), { replace: true });
      if (activeRefresh) logoutFn(activeRefresh); // revoke just this account's session
      // Note: no cross-tab broadcast and no Supabase signOut here — this is a per-account
      // logout; the remaining account keeps working on its internal JWT, and other tabs may
      // be on that remaining account.
      return;
    }

    // Last (or only) account: full logout.
    navigate('/');
    dispatch(logout());
    localStorage.removeItem('wasLoggedIn');
    localStorage.removeItem('install_prompt_dismissed');
    localStorage.removeItem('pendingAddAccount');
    queryClient.clear();
    broadcastLogout();                       // clear this session in every other tab
    if (activeRefresh) logoutFn(activeRefresh); // revoke the refresh token server-side
    try {
      await supabase.auth.signOut();
    } catch {
      // signOut failure doesn't affect local logout — Redux and localStorage are already cleared
    }
  };
};

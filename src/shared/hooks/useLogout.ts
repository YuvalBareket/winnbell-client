import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hook';
import { logout, removeAccount } from '../../store/slices/authSlice';
import { selectAccounts, selectActiveAccountId } from '../../store/selectors/authSelectors';
import { supabase } from '../lib/supabase';
import { homePathForUser } from './useAccountSwitcher';

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

    // More than one account saved: log out only the active one, stay signed into the other.
    if (accounts.length > 1 && activeAccountId != null) {
      const remaining = accounts.filter((a) => a.user.id !== activeAccountId);
      queryClient.clear();
      // flushSync so the remaining account's role is applied before we navigate (see switchTo).
      flushSync(() => { dispatch(removeAccount({ id: activeAccountId })); });
      navigate(homePathForUser(remaining[0]?.user), { replace: true });
      // Note: we intentionally do NOT sign out of Supabase here — the remaining account
      // keeps working on its internal JWT, and the Supabase session belongs to whichever
      // account last authenticated through it.
      return;
    }

    // Last (or only) account: full logout.
    navigate('/');
    dispatch(logout());
    localStorage.removeItem('wasLoggedIn');
    localStorage.removeItem('install_prompt_dismissed');
    localStorage.removeItem('pendingAddAccount');
    queryClient.clear();
    try {
      await supabase.auth.signOut();
    } catch {
      // signOut failure doesn't affect local logout — Redux and localStorage are already cleared
    }
  };
};

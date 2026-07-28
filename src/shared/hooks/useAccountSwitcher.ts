import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hook';
import { switchAccount, removeAccount } from '../../store/slices/authSlice';
import { selectAccounts, selectActiveAccountId } from '../../store/selectors/authSelectors';
import { supabase } from '../lib/supabase';
import { broadcastLogout } from '../lib/crossTabLogout';
import { logoutFn } from '../../features/auth/api/auth.api';
import { clearOtpSession } from '../../features/tickets/lib/phoneOtpSession';
import { api } from '../api/client';
import type { User } from '../../features/auth/types/auth.types';

// Role-aware home for an account (mirrors the redirect logic in AppRoutes/useSupabaseSync).
export const homePathForUser = (user: User | null | undefined): string => {
  if (!user) return '/';
  if (user.role === 'Admin') return '/admin';
  if (user.role === 'Business') {
    if (user.requiresBusinessSetup) return '/partner/setup-business';
    return '/campaign'; // owners and managers (location_id set) both live on the campaign dashboard
  }
  return '/scan'; // regular user
};

// After an identity change, re-bind THIS device's existing push subscription to the now-active
// account so the previous account stops receiving this device's pushes and the new account starts
// (P2-13: without this the endpoint stayed mapped to whoever first subscribed, so a switched-to
// account got no pushes and the switched-away account's pushes landed on a device now used by
// someone else). Best-effort and fire-and-forget: it must never block or fail the switch. The
// server upserts endpoint -> user_id and the axios interceptor carries the newly-active account's
// token, so this rebinds to the account we just switched to. Does nothing (no prompt, no new
// subscription) when the device has no existing subscription.
const rebindPushSubscription = async () => {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) await api.post('/notifications/subscribe', sub.toJSON());
  } catch { /* non-critical - a failed rebind just leaves the endpoint on the previous account */ }
};

// Clear all cached React Query data so one account never sees another's data.
const clearQueryCache = async () => {
  try {
    const { queryClient } = await import('../../main');
    queryClient.clear();
  } catch {
    // main not ready — cache will be empty anyway
  }
};

/**
 * Account switching operations. Switching is instant (no network): the target account
 * runs on its stored internal JWT, refreshed on demand by the axios interceptor.
 */
export const useAccountSwitcher = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const accounts = useAppSelector(selectAccounts);
  const activeAccountId = useAppSelector(selectActiveAccountId);

  const switchTo = async (id: number) => {
    if (id === activeAccountId) return;
    const target = accounts.find((a) => a.user.id === id);
    if (!target) return;
    // The in-flight phone-OTP session is tab-scoped: switching identity must drop it so the
    // next account never resumes the previous account's verification.
    clearOtpSession();
    await clearQueryCache();
    // Apply the role change synchronously (flushSync) BEFORE navigating: otherwise the
    // current role-gated page (e.g. /campaign) re-renders with the new role and its own
    // redirect guard fires AFTER our navigate, winning the race and landing on the wrong
    // page. Flushing first lets our navigate be the final, deterministic destination.
    flushSync(() => { dispatch(switchAccount({ id })); });
    navigate(homePathForUser(target.user), { replace: true });
    void rebindPushSubscription(); // re-bind this device's push endpoint to the now-active account
  };

  // Remove a saved account. If it is the active one, fall back to the remaining account
  // (switching to its home). Removing the LAST account is a full logout and must run the
  // same housekeeping as useLogout — critically the Supabase signOut: without it,
  // ProtectedRoute sees a live Supabase session with no authenticated user and shows the
  // loading screen forever.
  const remove = async (id: number): Promise<{ loggedOut: boolean }> => {
    const remaining = accounts.filter((a) => a.user.id !== id);
    // Capture the removed account's refresh token before dropping it, to revoke it
    // server-side (F6) so a removed device's token cannot be refreshed for 30 days.
    const removedRefresh = accounts.find((a) => a.user.id === id)?.refreshToken ?? null;
    clearOtpSession(); // identity change - see switchTo
    await clearQueryCache();

    if (id === activeAccountId && remaining.length === 0) {
      navigate('/');
      flushSync(() => { dispatch(removeAccount({ id })); });
      localStorage.removeItem('install_prompt_dismissed');
      localStorage.removeItem('pendingAddAccount');
      broadcastLogout();                          // last account gone — clear other tabs
      if (removedRefresh) logoutFn(removedRefresh); // revoke server-side
      try {
        await supabase.auth.signOut();
      } catch {
        // local state is already cleared; a failed remote signOut is non-fatal
      }
      return { loggedOut: true };
    }

    flushSync(() => { dispatch(removeAccount({ id })); });
    if (removedRefresh) logoutFn(removedRefresh); // revoke the removed account's session
    if (id === activeAccountId) {
      navigate(homePathForUser(remaining[0].user), { replace: true });
      void rebindPushSubscription(); // active account removed -> rebind this device to the remaining one
    }
    return { loggedOut: false };
  };

  return { accounts, activeAccountId, switchTo, remove };
};

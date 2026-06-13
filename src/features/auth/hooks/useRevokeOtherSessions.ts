import { useCallback } from 'react';
import { supabase } from '../../../shared/lib/supabase';
import { revokeAllSessionsFn } from '../api/auth.api';

/**
 * Logs the current user out of every OTHER session after a sensitive action such as
 * a password reset. Revokes the internal app sessions (refresh tokens) via the API,
 * then revokes all other Supabase sessions.
 *
 * Best-effort by design: the triggering action (e.g. the password change) has already
 * succeeded, so any failure here is logged and swallowed rather than thrown, and never
 * blocks the user's flow.
 */
export const useRevokeOtherSessions = () => {
  return useCallback(async (): Promise<void> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (accessToken) {
        await revokeAllSessionsFn(accessToken);
      }
      // Keep the current session so the surrounding flow can finish; revoke the rest.
      await supabase.auth.signOut({ scope: 'others' });
    } catch (err) {
      console.error('Failed to revoke other sessions:', err);
    }
  }, []);
};

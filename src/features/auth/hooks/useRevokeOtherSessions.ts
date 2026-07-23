import { useCallback } from 'react';
import { supabase } from '../../../shared/lib/supabase';
import { revokeAllSessionsFn } from '../api/auth.api';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Logs the current user out of every OTHER session after a sensitive action such as
 * a password reset. Two halves, BOTH security-critical (audit P2-8):
 *  - internal revoke (epoch bump + refresh-token wipe) kills every other device's app
 *    session on its next request;
 *  - Supabase signOut(others) kills the other devices' Supabase sessions so they can't
 *    simply re-sync and mint fresh internal tokens.
 *
 * The user is here because they suspect someone else has their account, so a silent
 * failure defeats the whole reset. Each half is retried (3 attempts, short backoff) and
 * the result is RETURNED so the caller can warn the user instead of swallowing it.
 * Never throws - the password change itself already succeeded and must not be blocked.
 */
export const useRevokeOtherSessions = () => {
  return useCallback(async (): Promise<boolean> => {
    let internalOk = false;
    let supabaseOk = false;

    for (let attempt = 0; attempt < 3 && !(internalOk && supabaseOk); attempt++) {
      if (attempt > 0) await wait(attempt * 2000);

      if (!internalOk) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const accessToken = session?.access_token;
          if (accessToken) {
            await revokeAllSessionsFn(accessToken);
            internalOk = true;
          }
        } catch (err) {
          console.error('Failed to revoke internal sessions (attempt ' + (attempt + 1) + '):', err);
        }
      }

      if (!supabaseOk) {
        try {
          // Keep the current session so the surrounding flow can finish; revoke the rest.
          const { error } = await supabase.auth.signOut({ scope: 'others' });
          if (!error) supabaseOk = true;
        } catch (err) {
          console.error('Failed to revoke other Supabase sessions (attempt ' + (attempt + 1) + '):', err);
        }
      }
    }

    return internalOk && supabaseOk;
  }, []);
};

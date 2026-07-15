import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../shared/lib/supabase';
import LoadingScreen from '../../../shared/components/LoadingScreen';

// Supabase processes the OAuth callback automatically when the page loads
// (reads the access_token fragment from the URL). useSupabaseSync in AppRoutes
// will detect the new session via onAuthStateChange and sync into Redux.
//
// We return to the page that STARTED the OAuth flow (login/register saved ssoReturnPath
// right before redirecting to Google) instead of dumping the user on the landing page:
// that page shows its Google button in the pending state until the sync finishes, and
// its already-authenticated redirect then moves them into the app.
const SSOCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Saved by the login/register Google handlers right before the OAuth redirect; consumed
    // here (the only reader). The "came back from SSO" signal itself travels as router state,
    // which needs no cleanup. Accept only in-app paths (single leading slash): "//" would be
    // protocol-relative and anything else is not ours - defense-in-depth, we only ever write
    // our own pathname.
    const raw = sessionStorage.getItem('ssoReturnPath');
    sessionStorage.removeItem('ssoReturnPath');
    const returnPath = raw && /^\/(?!\/)/.test(raw) ? raw : null;

    // Cancelled/denied at the Google screen: the provider sends error params back instead of
    // a code. No session will ever materialise, so return to the origin page immediately
    // instead of sitting on the loader until the 10s backstop.
    if (/[?#&]error=/.test(window.location.hash + window.location.search)) {
      navigate(returnPath || '/login', { replace: true });
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate(returnPath || '/', { replace: true, state: { ssoReturn: true } });
      }
    });

    // If no session materialises within 10s, redirect to login
    const timeout = setTimeout(() => {
      supabase.auth.getSession().then(({ data }) => {
        if (!data.session) {
          navigate('/login?error=session', { replace: true });
        }
      });
    }, 10000);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return <LoadingScreen />;
};

export default SSOCallbackPage;

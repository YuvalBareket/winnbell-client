import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../shared/lib/supabase';
import LoadingScreen from '../../../shared/components/LoadingScreen';

// Supabase processes the OAuth callback automatically when the page loads
// (reads the access_token fragment from the URL). useSupabaseSync in AppRoutes
// will detect the new session via onAuthStateChange and sync into Redux.
const SSOCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate('/', { replace: true });
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

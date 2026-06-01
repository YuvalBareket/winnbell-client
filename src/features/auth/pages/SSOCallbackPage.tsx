import { useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../shared/lib/supabase';

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

  return (
    <Box sx={{ display: 'flex', height: '100dvh', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  );
};

export default SSOCallbackPage;

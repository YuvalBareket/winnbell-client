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
    // Give Supabase a moment to process the hash params, then redirect home.
    // If the session is already set, useSupabaseSync will handle navigation.
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        // Hash not yet processed — Supabase client handles it automatically;
        // just wait for the onAuthStateChange event to fire in useSupabaseSync.
      } else {
        navigate('/', { replace: true });
      }
    });
  }, []);

  return (
    <Box sx={{ display: 'flex', height: '100dvh', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  );
};

export default SSOCallbackPage;

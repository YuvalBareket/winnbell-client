import { Navigate, Outlet } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { useAppSelector } from '../store/hook';
import { selectIsAuthenticated } from '../store/selectors/authSelectors';
import { useSyncStatus } from '../shared/context/SyncStatusContext';
import LoadingScreen from '../shared/components/LoadingScreen';

const ProtectedRoute = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { isLoaded, isSignedIn, syncError, retry } = useSyncStatus();

  // Already authenticated from the persisted session: render immediately. Waiting for
  // Supabase to re-initialize on every refresh is what made logged-in reloads feel slow.
  // The internal JWT authorizes API calls; if the session is actually stale, those calls
  // get a 401 and the sync flow signs the user out.
  if (isAuthenticated) {
    return <Outlet />;
  }

  // Supabase is still initializing
  if (!isLoaded) {
    return <LoadingScreen />;
  }

  // Session exists but useSupabaseSync hasn't finished yet - wait, don't redirect
  if (isSignedIn && !isAuthenticated) {
    if (syncError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100dvh',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
          }}
        >
          <Box
            component="img"
            src="/winnbell_logo.png"
            alt="Winnbell"
            sx={{ width: 80, height: 'auto', mb: 3 }}
          />
          <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', maxWidth: 320 }}>
            We're having trouble connecting. Please check your connection and try again.
          </Typography>
          <Button variant="contained" onClick={retry}>
            Retry
          </Button>
        </Box>
      );
    }
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    // QR scan link - save location ID and send to landing page so the user
    // sees the full app intro rather than a bare login form
    const params = new URLSearchParams(window.location.search);
    const lid = params.get('l');
    if (window.location.pathname === '/scan' && lid) {
      localStorage.setItem('pendingLocationId', lid);
      // High-intent flyer scanner: send them to the personalized conversion page,
      // not the generic landing.
      return <Navigate to={`/start?l=${lid}`} replace />;
    }
    return <Navigate to='/' replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

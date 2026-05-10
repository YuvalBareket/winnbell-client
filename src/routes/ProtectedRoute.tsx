import { Navigate, Outlet } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '@clerk/clerk-react';
import { useAppSelector } from '../store/hook';
import { selectIsAuthenticated } from '../store/selectors/authSelectors';

const ProtectedRoute = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { isSignedIn, isLoaded } = useAuth();

  // Clerk is still initializing
  if (!isLoaded) {
    return (
      <Box sx={{ display: 'flex', height: '100dvh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Clerk session exists but useClerkSync hasn't finished yet — wait, don't redirect
  if (isSignedIn && !isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', height: '100dvh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    // QR scan link — save business ID and send to landing page so the user
    // sees the full app intro rather than a bare login form
    const params = new URLSearchParams(window.location.search);
    const bid = params.get('b');
    if (window.location.pathname === '/scan' && bid) {
      sessionStorage.setItem('pendingBusinessScan', bid);
      return <Navigate to='/' replace />;
    }
    return <Navigate to='/login' replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

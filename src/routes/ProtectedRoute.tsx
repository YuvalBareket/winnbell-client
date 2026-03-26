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
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Clerk session exists but useClerkSync hasn't finished yet — wait, don't redirect
  if (isSignedIn && !isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

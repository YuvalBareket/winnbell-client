import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hook';
import { selectIsAuthenticated } from '../store/selectors/authSelectors';

const ProtectedRoute = () => {
  // Read directly from Redux Store
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

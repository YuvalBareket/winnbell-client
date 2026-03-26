import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hook';
import {
  selectIsRegularUser,
  selectIsBusiness,
  selectIsRequiresBusinessSetup,
  selectIsAuthenticated,
} from '../store/selectors/authSelectors';
import { useClerkSync } from '../shared/hooks/useClerkSync';

import MainLayout from '../shared/components/MainLayout';
import ProtectedRoute from './ProtectedRoute';

// Auth
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import VerifyEmailPage from '../features/auth/pages/VerifyEmailPage';
import SSOCallbackPage from '../features/auth/pages/SSOCallbackPage';

// Legal
import TermsOfServicePage from '../features/legal/pages/TermsOfServicePage';
import PrivacyPolicyPage from '../features/legal/pages/PrivacyPolicyPage';

// User Specific
import NearbyPage from '../features/nearBy/pages/NearbyPage';
import RedeemPage from '../features/tickets/pages/RedeemPage';
import MyTicketsPage from '../features/myTickets/pages/MyTicketsPage';
import FreeTicketPage from '../features/tickets/pages/FreeTicketPage';

// Business/Admin Specific
import BusinessDashboard from '../features/admin/pages/BusinessDashboard';
import BusinessProfilePage from '../features/partner/pages/BusinessProfilePage';
import BusinessHubPage from '../features/partner/pages/BusinessHubPage';

const AppRoutes = () => {
  const navigate = useNavigate();
  const isUser = useAppSelector(selectIsRegularUser);
  const isBusinessAdmin = useAppSelector(selectIsBusiness);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const requiresBusinessSetup = useAppSelector(selectIsRequiresBusinessSetup);

  // Syncs an active Clerk session into Redux (handles SSO callbacks)
  useClerkSync();

  // Redirect new business owners to setup after registration
  useEffect(() => {
    if (isAuthenticated && requiresBusinessSetup) {
      navigate('/partner/setup-business', { replace: true });
    }
  }, [isAuthenticated, requiresBusinessSetup]);

  return (
    <Routes>
      {/* --- Public Routes --- */}
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register/:role?' element={<RegisterPage />} />
      <Route path='/verify-email' element={<VerifyEmailPage />} />
      <Route path='/sso-callback' element={<SSOCallbackPage />} />
      <Route path='/terms' element={<TermsOfServicePage />} />
      <Route path='/privacy' element={<PrivacyPolicyPage />} />
      <Route path='/partner/setup-business' element={<BusinessProfilePage />} />

      {/* --- Protected Routes --- */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route
            path='/nearby'
            element={isBusinessAdmin ? <BusinessHubPage /> : <NearbyPage />}
          />
          <Route path='/' element={<RedeemPage />} />
          <Route path='/tickets' element={<MyTicketsPage />} />
        </Route>

        {isUser && <Route path='/freeTicket' element={<FreeTicketPage />} />}
      </Route>

      {/* Fallback */}
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
};

export default AppRoutes;

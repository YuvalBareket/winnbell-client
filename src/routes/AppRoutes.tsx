import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '@clerk/clerk-react';
import { useAppSelector } from '../store/hook';
import {
  selectIsRegularUser,
  selectIsBusiness,
  selectIsRequiresBusinessSetup,
  selectIsAuthenticated,
  selectIsAdmin,
  selectIsLocationManager,
} from '../store/selectors/authSelectors';
import { useClerkSync } from '../shared/hooks/useClerkSync';
import { SyncStatusContext } from '../shared/context/SyncStatusContext';

import MainLayout from '../shared/components/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import RegionGate from '../shared/components/RegionGate';
import LandingPage from '../features/landing/LandingPage';

// Auth
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import VerifyEmailPage from '../features/auth/pages/VerifyEmailPage';
import SSOCallbackPage from '../features/auth/pages/SSOCallbackPage';
import RegionBlockedPage from '../features/auth/pages/RegionBlockedPage';

// Tickets
import PublicActivatePage from '../features/tickets/pages/PublicActivatePage';

// Legal
import TermsOfServicePage from '../features/legal/pages/TermsOfServicePage';
import PrivacyPolicyPage from '../features/legal/pages/PrivacyPolicyPage';
import OfficialRulesPage from '../features/legal/pages/OfficialRulesPage';
import BusinessAgreementPage from '../features/legal/pages/BusinessAgreementPage';

// Subscription
import SubscribePage from '../features/subscription/pages/SubscribePage';
import SubscriptionSuccessPage from '../features/subscription/pages/SubscriptionSuccessPage';
import SubscriptionManagementPage from '../features/subscription/pages/SubscriptionManagementPage';

// User Specific
import NearbyPage from '../features/nearBy/pages/NearbyPage';
import RedeemPage from '../features/tickets/pages/RedeemPage';
import MyTicketsPage from '../features/myTickets/pages/MyTicketsPage';
import FreeTicketPage from '../features/tickets/pages/FreeTicketPage';

// Business/Admin Specific
import BusinessDashboard from '../features/admin/pages/BusinessDashboard';
import BusinessProfilePage from '../features/partner/pages/BusinessProfilePage';
import BusinessHubPage from '../features/partner/pages/BusinessHubPage';
import StatsPage from '../features/stats/pages/StatsPage';
import ActivityPage from '../features/activity/pages/ActivityPage';
import DrawHistoryPage from '../features/draw/pages/DrawHistoryPage';
import SettingsPage from '../features/settings/pages/SettingsPage';
import MarketingPage from '../features/marketing/pages/MarketingPage';

const AppRoutes = () => {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  const isUser = useAppSelector(selectIsRegularUser);
  const isBusinessAdmin = useAppSelector(selectIsBusiness);
  const isManager = useAppSelector(selectIsLocationManager);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);
  const requiresBusinessSetup = useAppSelector(selectIsRequiresBusinessSetup);

  // Syncs an active Clerk session into Redux (handles SSO callbacks)
  const [retryCount, setRetryCount] = useState(0);
  const { syncError } = useClerkSync(retryCount);
  const retry = () => setRetryCount(c => c + 1);

  // Redirect new business owners to setup after registration
  useEffect(() => {
    if (isAuthenticated && requiresBusinessSetup) {
      navigate('/partner/setup-business', { replace: true });
    }
  }, [isAuthenticated, requiresBusinessSetup]);


  return (
    <SyncStatusContext.Provider value={{ syncError, retry }}>
    <Routes>
      {/* --- Public Routes --- */}
      <Route path='/' element={
        (!isLoaded || (isSignedIn && !isAuthenticated))
          ? <Box sx={{ display: 'flex', height: '100dvh', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>
          : isAuthenticated
            ? <Navigate to={isAdmin ? '/admin' : (isBusinessAdmin || isManager) ? '/activity' : '/scan'} replace />
            : <LandingPage />
      } />
      <Route path='/region-blocked' element={<RegionBlockedPage />} />
      <Route path='/login' element={<RegionGate><LoginPage /></RegionGate>} />
      <Route path='/register/:role?' element={<RegionGate><RegisterPage /></RegionGate>} />
      <Route path='/verify-email' element={<VerifyEmailPage />} />
      <Route path='/sso-callback' element={<SSOCallbackPage />} />
      <Route path='/activate' element={<PublicActivatePage />} />
      <Route path='/partner/setup-business' element={<BusinessProfilePage />} />
      <Route path='/terms' element={<TermsOfServicePage />} />
      <Route path='/privacy' element={<PrivacyPolicyPage />} />
      <Route path='/rules' element={<OfficialRulesPage />} />
      <Route path='/business-agreement' element={<BusinessAgreementPage />} />

      {/* --- Protected Routes --- */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          {/* Admin-only routes */}
          {isAdmin && (
            <>
              <Route path='/admin' element={<BusinessDashboard />} />
              <Route path='/admin/campaigns' element={<BusinessDashboard />} />
              <Route path='/admin/users' element={<BusinessDashboard />} />
              <Route path='/admin/businesses' element={<BusinessDashboard />} />
              <Route path='/admin/analytics' element={<BusinessDashboard />} />
              <Route path='/admin/settings' element={<BusinessDashboard />} />
              <Route path='*' element={<Navigate to='/admin' replace />} />
            </>
          )}

          {/* Business/User routes - not accessible to admin */}
          {!isAdmin && (
            <>
              <Route path='/nearby' element={isBusinessAdmin ? <BusinessHubPage /> : <NearbyPage />} />
              <Route path='/scan' element={<RedeemPage />} />
              <Route path='/activity' element={isBusinessAdmin || isManager ? <ActivityPage /> : <Navigate to='/tickets' replace />} />
              <Route path='/tickets' element={<MyTicketsPage />} />
              <Route path='/draws/history' element={<DrawHistoryPage />} />
              <Route path='/stats' element={<StatsPage />} />
              <Route path='/subscribe' element={<SubscribePage />} />
              <Route path='/subscription/manage' element={<SubscriptionManagementPage />} />
              <Route path='/subscription/success' element={<SubscriptionSuccessPage />} />
              <Route path='/settings' element={<SettingsPage />} />
              <Route path='/marketing' element={<MarketingPage />} />
              {isUser && <Route path='/freeTicket' element={<FreeTicketPage />} />}
            </>
          )}
        </Route>
      </Route>

      {/* Fallback */}
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
    </SyncStatusContext.Provider>
  );
};

export default AppRoutes;

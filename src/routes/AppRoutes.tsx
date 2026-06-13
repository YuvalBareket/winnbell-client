import { useEffect, useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import ErrorBoundary from '../shared/components/ErrorBoundary';

import { useAppSelector } from '../store/hook';
import {
  selectIsRegularUser,
  selectIsBusiness,
  selectIsRequiresBusinessSetup,
  selectIsAuthenticated,
  selectIsAdmin,
  selectIsLocationManager,
} from '../store/selectors/authSelectors';
import { useSupabaseSync } from '../shared/hooks/useSupabaseSync';
import { SyncStatusContext } from '../shared/context/SyncStatusContext';
import { PageHeaderProvider } from '../shared/context/PageHeaderContext';

import MainLayout from '../shared/components/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import RegionGate from '../shared/components/RegionGate';
import LoadingScreen from '../shared/components/LoadingScreen';
import LandingPage from '../features/landing/LandingPage';
import BusinessLandingPage from '../features/landing/BusinessLandingPage';

const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage'));
const VerifyEmailPage = lazy(() => import('../features/auth/pages/VerifyEmailPage'));
const SSOCallbackPage = lazy(() => import('../features/auth/pages/SSOCallbackPage'));
const ResetPasswordPage = lazy(() => import('../features/auth/pages/ResetPasswordPage'));
const RegionBlockedPage = lazy(() => import('../features/auth/pages/RegionBlockedPage'));

const PublicActivatePage = lazy(() => import('../features/tickets/pages/PublicActivatePage'));
const RedeemPage = lazy(() => import('../features/tickets/pages/RedeemPage'));
const MyTicketsPage = lazy(() => import('../features/myTickets/pages/MyTicketsPage'));
const FreeTicketPage = lazy(() => import('../features/tickets/pages/FreeTicketPage'));

const TermsOfServicePage = lazy(() => import('../features/legal/pages/TermsOfServicePage'));
const PrivacyPolicyPage = lazy(() => import('../features/legal/pages/PrivacyPolicyPage'));
const OfficialRulesPage = lazy(() => import('../features/legal/pages/OfficialRulesPage'));
const BusinessAgreementPage = lazy(() => import('../features/legal/pages/BusinessAgreementPage'));

const SubscribePage = lazy(() => import('../features/subscription/pages/SubscribePage'));
const SubscriptionSuccessPage = lazy(() => import('../features/subscription/pages/SubscriptionSuccessPage'));
const SubscriptionManagementPage = lazy(() => import('../features/subscription/pages/SubscriptionManagementPage'));

const NearbyPage = lazy(() => import('../features/nearBy/pages/NearbyPage'));

const BusinessDashboard = lazy(() => import('../features/admin/pages/BusinessDashboard'));
const BusinessProfilePage = lazy(() => import('../features/partner/pages/BusinessProfilePage'));
const BusinessHubPage = lazy(() => import('../features/partner/pages/BusinessHubPage'));
const StatsPage = lazy(() => import('../features/stats/pages/StatsPage'));
const ActivityPage = lazy(() => import('../features/activity/pages/ActivityPage'));
const DrawHistoryPage = lazy(() => import('../features/draw/pages/DrawHistoryPage'));
const SettingsPage = lazy(() => import('../features/settings/pages/SettingsPage'));
const MarketingPage = lazy(() => import('../features/marketing/pages/MarketingPage'));

const AppRoutes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isUser = useAppSelector(selectIsRegularUser);
  const isBusinessAdmin = useAppSelector(selectIsBusiness);
  const isManager = useAppSelector(selectIsLocationManager);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);
  const requiresBusinessSetup = useAppSelector(selectIsRequiresBusinessSetup);

  // Syncs an active Supabase session into Redux (handles SSO callbacks)
  const [retryCount, setRetryCount] = useState(0);
  const { syncError, isLoaded, isSignedIn } = useSupabaseSync(retryCount);
  const retry = () => setRetryCount(c => c + 1);

  // Redirect new business owners to setup after registration
  useEffect(() => {
    if (isAuthenticated && requiresBusinessSetup) {
      navigate('/partner/setup-business', { replace: true });
    }
  }, [isAuthenticated, requiresBusinessSetup, navigate]);


  const routeFallback = (
    <Box sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>
        Something went wrong
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Try refreshing the page or go back.
      </Typography>
      <Button component="a" href="/" variant="contained" sx={{ mt: 2 }}>
        Go Home
      </Button>
    </Box>
  );

  return (
    <PageHeaderProvider>
    <SyncStatusContext.Provider value={{ syncError, retry, isLoaded, isSignedIn }}>
    <ErrorBoundary fallback={routeFallback} resetKeys={[location.pathname, isAuthenticated, isSignedIn]}>
    <Suspense fallback={<LoadingScreen />}>
    <Routes>
      {/* --- Public Routes --- */}
      <Route path='/' element={
        (!isLoaded || (isSignedIn && !isAuthenticated))
                  ? <LoadingScreen />
          : isAuthenticated
            ? <Navigate to={isAdmin ? '/admin' : (isBusinessAdmin || isManager) ? '/activity' : '/scan'} replace />
            : <LandingPage />
      } />
      <Route path='/for-business' element={<BusinessLandingPage />} />
      <Route path='/region-blocked' element={<RegionBlockedPage />} />
      <Route path='/login' element={<RegionGate><LoginPage /></RegionGate>} />
      <Route path='/register/:role?' element={<RegionGate><RegisterPage /></RegionGate>} />
      <Route path='/verify-email' element={<VerifyEmailPage />} />
      <Route path='/sso-callback' element={<SSOCallbackPage />} />
      <Route path='/reset-password' element={<ResetPasswordPage />} />
      <Route path='/activate' element={<PublicActivatePage />} />
      <Route path='/terms' element={<TermsOfServicePage />} />
      <Route path='/privacy' element={<PrivacyPolicyPage />} />
      <Route path='/rules' element={<OfficialRulesPage />} />
      <Route path='/rules/:drawId' element={<OfficialRulesPage />} />
      <Route path='/business-agreement' element={<BusinessAgreementPage />} />

      {/* --- Protected Routes --- */}
      <Route element={<ProtectedRoute />}>
        {/* Business setup - protected but no sidebar layout */}
        <Route path='/partner/setup-business' element={<BusinessProfilePage />} />
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
              <Route path='/admin/notifications' element={<BusinessDashboard />} />
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
    </Suspense>
    </ErrorBoundary>
    </SyncStatusContext.Provider>
    </PageHeaderProvider>
  );
};

export default AppRoutes;

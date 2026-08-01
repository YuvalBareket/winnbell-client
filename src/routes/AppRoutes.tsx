import { useState, useEffect, lazy, Suspense, type ReactNode } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import ErrorBoundary from '../shared/components/ErrorBoundary';

import { useAppSelector } from '../store/hook';
import {
  selectIsRegularUser,
  selectIsBusiness,
  selectIsRequiresBusinessSetup,
  selectRequiresProfileSetup,
  selectIsAuthenticated,
  selectIsAdmin,
  selectIsLocationManager,
} from '../store/selectors/authSelectors';
import { useSupabaseSync } from '../shared/hooks/useSupabaseSync';
import { SyncStatusContext } from '../shared/context/SyncStatusContext';

import MainLayout from '../shared/components/MainLayout';
import PageTitle from '../shared/components/PageTitle';
import ProtectedRoute from './ProtectedRoute';
import RegionGate from '../shared/components/RegionGate';
import LoadingScreen from '../shared/components/LoadingScreen';
import LandingPage from '../features/landing/LandingPage';
import BusinessLandingPage from '../features/landing/BusinessLandingPage';
import ScanWelcomePage from '../features/landing/ScanWelcomePage';
import JoinPage from '../features/referral/pages/JoinPage';

// Eager: login/register + the light everyday pages. Keeping them in the main bundle makes
// navigating to them instant (no chunk-load delay) — the only wait is then any page-level
// loading (e.g. RegionGate's region check on login/register).
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import VerifyEmailPage from '../features/auth/pages/VerifyEmailPage';
import SSOCallbackPage from '../features/auth/pages/SSOCallbackPage';
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage';
import RegionBlockedPage from '../features/auth/pages/RegionBlockedPage';
import PublicActivatePage from '../features/tickets/pages/PublicActivatePage';
import MyTicketsPage from '../features/myTickets/pages/MyTicketsPage';
import FreeTicketPage from '../features/tickets/pages/FreeTicketPage';
import SubscribePage from '../features/subscription/pages/SubscribePage';
import SubscriptionSuccessPage from '../features/subscription/pages/SubscriptionSuccessPage';
import SubscriptionManagementPage from '../features/subscription/pages/SubscriptionManagementPage';
import NearbyPage from '../features/nearBy/pages/NearbyPage';
import DrawHistoryPage from '../features/draw/pages/DrawHistoryPage';
import SettingsPage from '../features/settings/pages/SettingsPage';
import InviteFriendsPage from '../features/referral/pages/InviteFriendsPage';

// Kept lazy: these pull in heavy libraries that don't belong in the initial bundle —
// RedeemPage (QR scanner / html5-qrcode), legal pages (react-markdown), Stats & Admin
// dashboard (recharts), BusinessProfile (image crop), Marketing (PDF export).
const RedeemPage = lazy(() => import('../features/tickets/pages/RedeemPage'));
const TermsOfServicePage = lazy(() => import('../features/legal/pages/TermsOfServicePage'));
const PrivacyPolicyPage = lazy(() => import('../features/legal/pages/PrivacyPolicyPage'));
const OfficialRulesPage = lazy(() => import('../features/legal/pages/OfficialRulesPage'));
const BusinessAgreementPage = lazy(() => import('../features/legal/pages/BusinessAgreementPage'));
const BusinessGuidelinesPage = lazy(() => import('../features/legal/pages/BusinessGuidelinesPage'));
const FoundingPartnerTermsPage = lazy(() => import('../features/legal/pages/FoundingPartnerTermsPage'));
const CancellationRefundPage = lazy(() => import('../features/legal/pages/CancellationRefundPage'));
const AccessibilityStatementPage = lazy(() => import('../features/legal/pages/AccessibilityStatementPage'));
const ContactPage = lazy(() => import('../features/contact/pages/ContactPage'));
const BusinessDashboard = lazy(() => import('../features/admin/pages/BusinessDashboard'));
const AdminBusinessViewPage = lazy(() => import('../features/admin/pages/AdminBusinessViewPage'));
const BusinessProfilePage = lazy(() => import('../features/partner/pages/BusinessProfilePage'));
const BusinessHubPage = lazy(() => import('../features/partner/pages/BusinessHubPage'));
const BusinessAnalyticsPage = lazy(() => import('../features/partner/pages/BusinessAnalyticsPage'));
const MarketingPage = lazy(() => import('../features/marketing/pages/MarketingPage'));
const MarketingGuidePage = lazy(() => import('../features/marketing/pages/MarketingGuidePage'));
const CampaignDashboardPage = lazy(() => import('../features/campaign/pages/CampaignDashboardPage'));
// Lazy: pulls in @mui/x-date-pickers (DOB picker), which doesn't belong in the initial bundle.
const ProfileSetupPage = lazy(() => import('../features/auth/pages/ProfileSetupPage'));

// Light fallback for in-app route chunk loading — a gentle spinner, NOT the full-screen
// branded LoadingScreen (which is reserved for boot + auth/entry pages below).
const RouteFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
    <CircularProgress size={34} thickness={4} />
  </Box>
);

// Wrap auth/entry pages so their chunk load shows the full branded LoadingScreen.
const branded = (node: ReactNode) => (
  <Suspense fallback={<LoadingScreen />}>{node}</Suspense>
);

const AppRoutes = () => {
  const location = useLocation();
  const isUser = useAppSelector(selectIsRegularUser);
  const isBusinessAdmin = useAppSelector(selectIsBusiness);
  const isManager = useAppSelector(selectIsLocationManager);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);
  const requiresBusinessSetup = useAppSelector(selectIsRequiresBusinessSetup);
  const requiresProfileSetup = useAppSelector(selectRequiresProfileSetup);

  // Where to send a user who hits a route their role can't access (their own home).
  const homePath = isAdmin ? '/admin' : (isBusinessAdmin || isManager) ? '/campaign' : '/scan';

  // Syncs an active Supabase session into Redux (handles SSO callbacks)
  const [retryCount, setRetryCount] = useState(0);
  const { syncError, isLoaded, isSignedIn } = useSupabaseSync(retryCount);
  const retry = () => setRetryCount(c => c + 1);

  // One-shot redirect: when a signed-in user needs business or profile setup (flags just synced),
  // send them to the wizard. Deliberately an EFFECT keyed on the flags, not a render-time
  // route wall: after redirecting, the user may still open legal pages linked from the
  // wizard (/business-agreement etc.) without being bounced back in a loop.
  // Business setup takes precedence if both are set.
  const navigate = useNavigate();
  useEffect(() => {
    if (isAuthenticated && requiresBusinessSetup) {
      navigate('/partner/setup-business', { replace: true });
    } else if (isAuthenticated && requiresProfileSetup) {
      navigate('/profile-setup', { replace: true });
    }
  }, [isAuthenticated, requiresBusinessSetup, requiresProfileSetup, navigate]);

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
    <SyncStatusContext.Provider value={{ syncError, retry, isLoaded, isSignedIn }}>
    <ErrorBoundary fallback={routeFallback} resetKeys={[location.pathname, isAuthenticated, isSignedIn]}>
    <PageTitle />
    <Suspense fallback={<RouteFallback />}>
    <Routes>
      {/* --- Public Routes --- */}
      <Route path='/' element={
        isAuthenticated
          ? <Navigate to={isAdmin ? '/admin' : (isBusinessAdmin || isManager) ? '/campaign' : '/scan'} replace />
          : <LandingPage />
      } />
      <Route path='/for-business' element={<BusinessLandingPage />} />
      <Route path='/start' element={<ScanWelcomePage />} />
      <Route path='/join' element={<JoinPage />} />
      <Route path='/region-blocked' element={<RegionBlockedPage />} />
      {/* Login is NOT region-gated: existing users must be able to sign in while traveling.
          Region eligibility is enforced at signup (RegionGate below + server-side on new-account sync). */}
      <Route path='/login/:role?' element={<LoginPage />} />
      <Route path='/register/:role?' element={<RegionGate><RegisterPage /></RegionGate>} />
      <Route path='/verify-email' element={<VerifyEmailPage />} />
      <Route path='/sso-callback' element={branded(<SSOCallbackPage />)} />
      <Route path='/reset-password' element={branded(<ResetPasswordPage />)} />
      <Route path='/activate' element={<PublicActivatePage />} />
      <Route path='/terms' element={<TermsOfServicePage />} />
      <Route path='/privacy' element={<PrivacyPolicyPage />} />
      <Route path='/contact' element={<ContactPage />} />
      {/* Always the CURRENT campaign's rules. No per-draw route: past campaigns' rules
          are archived as PDFs at close and are deliberately not browsable by draw id. */}
      <Route path='/rules' element={<OfficialRulesPage />} />
      <Route path='/business-agreement' element={<BusinessAgreementPage />} />
      <Route path='/business-guidelines' element={<BusinessGuidelinesPage />} />
      <Route path='/founding-terms' element={<FoundingPartnerTermsPage />} />
      <Route path='/cancellation' element={<CancellationRefundPage />} />
      <Route path='/accessibility' element={<AccessibilityStatementPage />} />

      {/* --- Protected Routes --- */}
      <Route element={<ProtectedRoute />}>
        {/* Profile setup - protected but no sidebar layout */}
        <Route path='/profile-setup' element={branded(<ProfileSetupPage />)} />
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
              <Route path='/admin/businesses/:businessId/view' element={<AdminBusinessViewPage />} />
              <Route path='/admin/analytics' element={<BusinessDashboard />} />
              <Route path='/admin/settings' element={<BusinessDashboard />} />
              <Route path='/admin/notifications' element={<BusinessDashboard />} />
              <Route path='*' element={<Navigate to='/admin' replace />} />
            </>
          )}

          {/* Business/User routes - not accessible to admin */}
          {!isAdmin && (
            <>
              {/* Managers have no Business Hub - their nav points at /marketing; stale
                  /nearby links follow along instead of landing on the consumer map. */}
              <Route path='/nearby' element={isBusinessAdmin ? <BusinessHubPage /> : isManager ? <Navigate to='/marketing' replace /> : <NearbyPage />} />
              <Route path='/scan' element={isUser ? <RedeemPage /> : <Navigate to={homePath} replace />} />
              <Route path='/campaign' element={isBusinessAdmin || isManager ? <CampaignDashboardPage /> : <Navigate to='/tickets' replace />} />
              <Route path='/tickets' element={<MyTicketsPage />} />
              <Route path='/draws/history' element={<DrawHistoryPage />} />
              <Route path='/stats' element={isBusinessAdmin || isManager ? <BusinessAnalyticsPage /> : <Navigate to={homePath} replace />} />
              <Route path='/subscribe' element={isBusinessAdmin ? <SubscribePage /> : <Navigate to={homePath} replace />} />
              <Route path='/subscription/manage' element={isBusinessAdmin ? <SubscriptionManagementPage /> : <Navigate to={homePath} replace />} />
              <Route path='/subscription/success' element={<SubscriptionSuccessPage />} />
              <Route path='/settings' element={<SettingsPage />} />
              {isUser && <Route path='/invite' element={<InviteFriendsPage />} />}
              <Route path='/marketing' element={isBusinessAdmin || isManager ? <MarketingPage /> : <Navigate to={homePath} replace />} />
              <Route path='/marketing/guide' element={isBusinessAdmin || isManager ? <MarketingGuidePage /> : <Navigate to={homePath} replace />} />
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
  );
};

export default AppRoutes;

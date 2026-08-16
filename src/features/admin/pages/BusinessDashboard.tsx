import React, { useState } from 'react';
import {
  Box,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import AppPageHero from '../../../shared/components/AppPageHero';
import {
  useAllDraws,
  useAdminOverview,
} from '../hooks/useAdmin';
import CreateDrawModal from './components/CreateDrawModal';
import OverviewTab from './components/OverviewTab';
import UsersTab from './components/UsersTab';
import BusinessesTab from './components/BusinessesTab';
import DrawsTab from './components/DrawsTab';
import AnalyticsTab from './components/AnalyticsTab';
import FunnelTab from './components/FunnelTab';
import AdminMapTab from './components/AdminMapTab';
import SettingsTab from './components/SettingsTab';
import NotificationsTab from './components/NotificationsTab';

const BusinessDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const [isDrawModalOpen, setIsDrawModalOpen] = useState(false);
  const [snackError, setSnackError] = useState('');
  const [snackSuccess, setSnackSuccess] = useState('');

  const path = location.pathname;

  // This shell serves every /admin/* tab; only fetch what the ACTIVE tab consumes.
  // Overview (the default '/admin' branch) needs both; Campaigns needs the draws list.
  const isOverviewTab = !['/admin/campaigns', '/admin/users', '/admin/businesses', '/admin/map', '/admin/analytics', '/admin/funnel', '/admin/settings', '/admin/notifications'].includes(path);
  const { data: overview, isLoading: overviewLoading } = useAdminOverview(isOverviewTab);
  const { data: draws, isLoading: drawsLoading } = useAllDraws(isOverviewTab || path === '/admin/campaigns');

  const currentOpenDraw = draws?.find((d) => d.status?.toUpperCase() === 'OPEN');

  const renderContent = () => {
    if (path === '/admin/campaigns') {
      return (
        <DrawsTab
          draws={draws}
          drawsLoading={drawsLoading}
          isMobile={isMobile}
          onSnackError={setSnackError}
          onSnackSuccess={setSnackSuccess}
          onCreateDraw={() => setIsDrawModalOpen(true)}
        />
      );
    }
    if (path === '/admin/users') {
      return (
        <UsersTab
          isMobile={isMobile}
          onSnackError={setSnackError}
          onSnackSuccess={setSnackSuccess}
        />
      );
    }
    if (path === '/admin/businesses') {
      return <BusinessesTab isMobile={isMobile} />;
    }
    if (path === '/admin/map') {
      return <AdminMapTab />;
    }
    if (path === '/admin/analytics') {
      return <AnalyticsTab isMobile={isMobile} />;
    }
    if (path === '/admin/funnel') {
      return <FunnelTab />;
    }
    if (path === '/admin/settings') {
      return <SettingsTab />;
    }
    if (path === '/admin/notifications') {
      return <NotificationsTab />;
    }
    // Default: /admin → Overview
    return (
      <OverviewTab
        overview={overview}
        currentOpenDraw={currentOpenDraw}
        overviewLoading={overviewLoading}
        drawsLoading={drawsLoading}
      />
    );
  };

  const sectionTitle: Record<string, string> = {
    '/admin': 'Overview',
    '/admin/campaigns': 'Campaigns',
    '/admin/users': 'Users',
    '/admin/businesses': 'Businesses',
    '/admin/map': 'Map',
    '/admin/analytics': 'Analytics',
    '/admin/funnel': 'Funnel',
    '/admin/settings': 'Settings',
    '/admin/notifications': 'Notifications',
  };

  return (
    <Box sx={{ minHeight: { xs: 'calc(var(--dvh100, 100dvh) - 60px)', md: 'var(--dvh100, 100dvh)' } }}>
      <AppPageHero
        title={sectionTitle[path] ?? 'Admin'}
      />

      <Box p={3}>
        {renderContent()}

        <CreateDrawModal open={isDrawModalOpen} onClose={() => setIsDrawModalOpen(false)} />

        <Snackbar open={!!snackError} autoHideDuration={4000} onClose={() => setSnackError('')}>
          <Alert severity='error' onClose={() => setSnackError('')}>{snackError}</Alert>
        </Snackbar>
        <Snackbar open={!!snackSuccess} autoHideDuration={4000} onClose={() => setSnackSuccess('')}>
          <Alert severity='success' onClose={() => setSnackSuccess('')}>{snackSuccess}</Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default BusinessDashboard;

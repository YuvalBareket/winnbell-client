import React, { useState } from 'react';
import {
  Box,
  Typography,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import {
  useAllDraws,
  useAdminOverview,
} from '../hooks/useAdmin';
import CreateBusinessModal from './components/CreateBusinessModal';
import CreateDrawModal from './components/CreateDrawModal';
import OverviewTab from './components/OverviewTab';
import UsersTab from './components/UsersTab';
import BusinessesTab from './components/BusinessesTab';
import DrawsTab from './components/DrawsTab';
import AnalyticsTab from './components/AnalyticsTab';
import SettingsTab from './components/SettingsTab';

const BusinessDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const [isBizModalOpen, setIsBizModalOpen] = useState(false);
  const [isDrawModalOpen, setIsDrawModalOpen] = useState(false);
  const [snackError, setSnackError] = useState('');
  const [snackSuccess, setSnackSuccess] = useState('');

  const { data: overview } = useAdminOverview();
  const { data: draws } = useAllDraws();

  const currentOpenDraw = draws?.find((d) => d.status?.toUpperCase() === 'OPEN');

  const path = location.pathname;

  const renderContent = () => {
    if (path === '/admin/campaigns') {
      return (
        <DrawsTab
          draws={draws}
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
      return (
        <BusinessesTab
          isMobile={isMobile}
          onCreateBusiness={() => setIsBizModalOpen(true)}
        />
      );
    }
    if (path === '/admin/analytics') {
      return <AnalyticsTab isMobile={isMobile} />;
    }
    if (path === '/admin/settings') {
      return <SettingsTab />;
    }
    // Default: /admin → Overview
    return (
      <OverviewTab
        overview={overview}
        currentOpenDraw={currentOpenDraw}
      />
    );
  };

  const sectionTitle: Record<string, string> = {
    '/admin': 'Overview',
    '/admin/campaigns': 'Campaigns',
    '/admin/users': 'Users',
    '/admin/businesses': 'Businesses',
    '/admin/analytics': 'Analytics',
    '/admin/settings': 'Settings',
  };

  return (
    <Box p={3}>
      <Box sx={{ mb: 3 }}>
        <Typography variant='h5' fontWeight={800}>
          {sectionTitle[path] ?? 'Admin'}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Admin Dashboard
        </Typography>
      </Box>

      {renderContent()}

      <CreateBusinessModal open={isBizModalOpen} onClose={() => setIsBizModalOpen(false)} />
      <CreateDrawModal open={isDrawModalOpen} onClose={() => setIsDrawModalOpen(false)} />

      <Snackbar open={!!snackError} autoHideDuration={4000} onClose={() => setSnackError('')}>
        <Alert severity='error' onClose={() => setSnackError('')}>{snackError}</Alert>
      </Snackbar>
      <Snackbar open={!!snackSuccess} autoHideDuration={4000} onClose={() => setSnackSuccess('')}>
        <Alert severity='success' onClose={() => setSnackSuccess('')}>{snackSuccess}</Alert>
      </Snackbar>
    </Box>
  );
};

export default BusinessDashboard;

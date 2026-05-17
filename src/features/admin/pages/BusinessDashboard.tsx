import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Snackbar,
  Alert,
  Skeleton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  useAdminBusinesses,
  useAllDraws,
  useAdminOverview,
  useAdminUsers,
} from '../hooks/useAdmin';
import CreateBusinessModal from './components/CreateBusinessModal';
import CreateDrawModal from './components/CreateDrawModal';
import GenerateTicketsModal from './components/GenerateTicketsModal';
import OverviewTab from './components/OverviewTab';
import UsersTab from './components/UsersTab';
import BusinessesTab from './components/BusinessesTab';
import DrawsTab from './components/DrawsTab';
import RevenueTab from './components/RevenueTab';
import AnalyticsTab from './components/AnalyticsTab';
import {
  GRADIENT_HERO,
  BG_PAGE,
  ALPHA_WHITE_80,
} from '../../../shared/colors';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <Box
      role='tabpanel'
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </Box>
  );
}

const BusinessDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [tabValue, setTabValue] = useState(0);
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);
  const [isBizModalOpen, setIsBizModalOpen] = useState(false);
  const [isDrawModalOpen, setIsDrawModalOpen] = useState(false);

  const [snackError, setSnackError] = useState('');
  const [snackSuccess, setSnackSuccess] = useState('');

  // Queries
  const { data: overview, isLoading: loadingOverview } = useAdminOverview();
  const { data: businesses, isLoading: loadingBiz } = useAdminBusinesses();
  const { data: draws, isLoading: loadingDraws } = useAllDraws();
  const { data: users, isLoading: loadingUsers } = useAdminUsers();

  // Get current open draw
  const currentOpenDraw = draws?.find((d) => d.status?.toUpperCase() === 'OPEN');

  const isLoading = loadingOverview || loadingBiz || loadingDraws || loadingUsers;

  if (isLoading) {
    return (
      <Box sx={{ mt: 4 }}>
        <Skeleton variant='rectangular' height={200} sx={{ mb: 3, borderRadius: 2 }} />
        <Skeleton variant='rectangular' height={400} />
      </Box>
    );
  }

  return (
    <>
      {/* Hero Header */}
      <Box
        sx={{
          background: GRADIENT_HERO,
          color: 'white',
          py: isMobile ? 3 : 5,
          px: 2,
          textAlign: 'center',
        }}
      >
        <Container maxWidth='lg'>
          <Typography
            variant={isMobile ? 'h5' : 'h3'}
            fontWeight={800}
            sx={{ mb: 1 }}
          >
            Admin Dashboard
          </Typography>
          <Typography
            variant={isMobile ? 'body2' : 'body1'}
            sx={{ opacity: ALPHA_WHITE_80 }}
          >
            Manage businesses, campaigns, users, and subscriptions
          </Typography>
        </Container>
      </Box>

      {/* Content area */}
      <Container maxWidth='lg' sx={{ mt: -2, pb: 6, position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {/* Tab navigation */}
          <Box
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              backgroundColor: BG_PAGE,
              overflowX: 'auto',
              overflowY: 'hidden',
            }}
          >
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              variant={isMobile ? 'scrollable' : 'standard'}
              scrollButtons={isMobile ? 'auto' : false}
            >
              <Tab label='Overview' />
              <Tab label='Users' />
              <Tab label='Businesses' />
              <Tab label='Campaigns' />
              <Tab label='Revenue' />
              <Tab label='Analytics' />
            </Tabs>
          </Box>

          {/* Tab content */}
          <Box sx={{ p: isMobile ? 2 : 4 }}>
            <TabPanel value={tabValue} index={0}>
              <OverviewTab overview={overview} currentOpenDraw={currentOpenDraw} />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <UsersTab
                users={users}
                isMobile={isMobile}
                onSnackError={setSnackError}
                onSnackSuccess={setSnackSuccess}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <BusinessesTab
                businesses={businesses}
                isMobile={isMobile}
                onCreateBusiness={() => setIsBizModalOpen(true)}
                onGenerateEntries={(id) => setSelectedBusinessId(id)}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <DrawsTab
                draws={draws}
                isMobile={isMobile}
                onSnackError={setSnackError}
                onSnackSuccess={setSnackSuccess}
                onCreateDraw={() => setIsDrawModalOpen(true)}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={4}>
              <RevenueTab overview={overview} />
            </TabPanel>

            <TabPanel value={tabValue} index={5}>
              <AnalyticsTab businesses={businesses} isMobile={isMobile} />
            </TabPanel>
          </Box>
        </Paper>
      </Container>

      {/* Modals */}
      <CreateBusinessModal
        open={isBizModalOpen}
        onClose={() => setIsBizModalOpen(false)}
      />
      <CreateDrawModal
        open={isDrawModalOpen}
        onClose={() => setIsDrawModalOpen(false)}
      />
      <GenerateTicketsModal
        open={!!selectedBusinessId}
        onClose={() => setSelectedBusinessId(null)}
        businessId={selectedBusinessId}
      />

      {/* Snackbars */}
      <Snackbar
        open={!!snackError}
        autoHideDuration={4000}
        onClose={() => setSnackError('')}
      >
        <Alert severity='error' onClose={() => setSnackError('')}>
          {snackError}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!snackSuccess}
        autoHideDuration={4000}
        onClose={() => setSnackSuccess('')}
      >
        <Alert severity='success' onClose={() => setSnackSuccess('')}>
          {snackSuccess}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BusinessDashboard;

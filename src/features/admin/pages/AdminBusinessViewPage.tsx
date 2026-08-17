import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Typography,
  Skeleton,
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useBusinessDetail } from '../hooks/useAdmin';
import CampaignDashboardPage from '../../campaign/pages/CampaignDashboardPage';
import BusinessAnalyticsPage from '../../partner/pages/BusinessAnalyticsPage';
import MarketingPage from '../../marketing/pages/MarketingPage';
import { MOBILE_CONTENT_HEIGHT, TEXT_SECONDARY, PRIMARY_MAIN } from '../../../shared/colors';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ width: '100%' }}>
    {value === index && children}
  </Box>
);

const AdminBusinessViewPage: React.FC = () => {
  const { businessId: businessIdStr } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const parsed = businessIdStr ? parseInt(businessIdStr, 10) : NaN;
  const businessId = Number.isInteger(parsed) && parsed > 0 ? parsed : null;

  const [tabValue, setTabValue] = React.useState(0);

  const { data, isLoading } = useBusinessDetail(businessId);
  const business = data?.business;
  const businessName = business?.name ?? 'Business';

  // Animation for the banner
  const bannerVariants = {
    hidden: { opacity: 0, y: -12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  // Malformed /admin/businesses/<id>/view URL: without a valid id the child pages would fall
  // back to OWNER mode (admin has no business), so bail out to the list instead.
  if (businessId == null) return <Navigate to="/admin/businesses" replace />;

  return (
    <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: 'var(--dvh100, 100dvh)' }, pb: { xs: 12, md: 6 } }}>
      {/* Read-only mode banner */}
      <motion.div variants={bannerVariants} initial="hidden" animate="visible">
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            py: 1.75,
            px: { xs: 2, md: 3 },
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <IconButton
            size="small"
            onClick={() => navigate('/admin/businesses')}
            sx={{ color: TEXT_SECONDARY, '&:hover': { bgcolor: 'action.hover' } }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: TEXT_SECONDARY,
              flex: 1,
              fontSize: { xs: '12px', md: '13px' },
            }}
          >
            {isLoading ? <Skeleton width={280} /> : `Viewing ${businessName} in read-only mode`}
          </Typography>
        </Box>
      </motion.div>

      <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 2.5 } }}>
        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: { xs: '14px', md: '16px' },
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              px: { xs: 0.5, sm: 1 },
              mb: { xs: 2, md: 2.5 },
            }}
          >
            <Tabs
              value={tabValue}
              onChange={(_e, v) => setTabValue(v)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                minHeight: 48,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: { xs: '0.82rem', sm: '0.9rem' },
                  minHeight: 48,
                  color: TEXT_SECONDARY,
                  '&.Mui-selected': { color: PRIMARY_MAIN, fontWeight: 800 },
                },
                '& .MuiTabs-indicator': { height: 3, borderRadius: 3, backgroundColor: PRIMARY_MAIN },
              }}
            >
              <Tab label="Campaign" value={0} />
              <Tab label="Analytics" value={1} />
              <Tab label="Marketing" value={2} />
            </Tabs>
          </Paper>
        </motion.div>

        {/* Tab content */}
        <TabPanel value={tabValue} index={0}>
          <CampaignDashboardPage adminBusinessId={businessId ?? undefined} />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <BusinessAnalyticsPage adminBusinessId={businessId ?? undefined} />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <MarketingPage adminBusinessId={businessId ?? undefined} />
        </TabPanel>
      </Container>
    </Box>
  );
};

export default AdminBusinessViewPage;

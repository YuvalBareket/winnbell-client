import { useState } from 'react';
import AppPageHero from '../../../shared/components/AppPageHero';
import {
  Box, Container, Paper, Tabs, Tab,
  useMediaQuery, useTheme, Snackbar, Alert,
  Autocomplete, TextField,
  Dialog, DialogTitle, List, ListItemButton, ListItemIcon, ListItemText, Typography,
} from '@mui/material';
import { LocationOnOutlined } from '@mui/icons-material';
import { useAppSelector } from '../../../store/hook';
import { selectIsBusiness, selectIsLocationManager, selectCurrentUser } from '../../../store/selectors/authSelectors';
import { useBusinessData } from '../../partner/hooks/useBusinessData';
import {
   PRIMARY_MAIN, MOBILE_CONTENT_HEIGHT,
} from '../../../shared/colors';
import { useGetDraws } from '../../draw/hooks/useGetDraws';
import { formatCurrency } from '../../../shared/utils/date';
import OverviewTab from '../components/OverviewTab';
import SocialPostsTab from '../components/SocialPostsTab';
import PostersTab from '../components/PostersTab';
import ScriptsTab from '../components/ScriptsTab';

// ── Page ──────────────────────────────────────────────────────────────────────
const MarketingPage = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isBusiness = useAppSelector(selectIsBusiness);
  const isManager = useAppSelector(selectIsLocationManager);
  const currentUser = useAppSelector(selectCurrentUser);
  const { data: businessData } = useBusinessData(isBusiness);
  // Live draw prize for the "Prize post" share card (card hidden when no open draw).
  const { data: activeDraws } = useGetDraws();
  const openDraw = activeDraws?.find((d) => d.status?.toLowerCase() === 'open') ?? activeDraws?.[0];
  const prizeLabel = openDraw?.prize_amount != null ? formatCurrency(openDraw.prize_amount) : null;

  // State
  const [snackbar, setSnackbar] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState<number | ''>('');
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);
  // "Choose a location" buttons open this picker directly (no scroll-to-top hunting).
  const [locPickerOpen, setLocPickerOpen] = useState(false);

  const businessName = businessData?.name ?? 'Your Business';
  const locations = (isBusiness ? businessData?.locations?.filter((l) => l.is_active) : []) ?? [];

  const effectiveLocationId = isManager
    ? currentUser?.location_id ?? null
    : (selectedLocationId || (locations.length === 1 ? locations[0].id : null));

  const scanUrl = effectiveLocationId
    ? `${window.location.origin}/scan?l=${effectiveLocationId}`
    : window.location.origin;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleCopyScanUrl = () => {
    navigator.clipboard.writeText(scanUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const showLocationSelector = isBusiness && locations.length > 1 && !isManager;
  // Desktop: a compact location dropdown in the header card
  const headerLocationControl = showLocationSelector ? (
    <Autocomplete
      size='small'
      options={locations}
      getOptionLabel={(opt) => opt.name}
      value={locations.find(l => l.id === selectedLocationId) ?? null}
      onChange={(_, val) => setSelectedLocationId(val?.id ?? '')}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      renderInput={(params) => <TextField {...params} label='Location' placeholder='Pick a location' />}
      sx={{ minWidth: 220 }}
    />
  ) : null;

  // Helper to switch to a tab by name
  const handleTabSwitch = (tabName: 'Social Posts' | 'Posters' | 'Scripts') => {
    const tabMap: Record<string, number> = {
      'Overview': 0,
      'Social Posts': 1,
      'Posters': 2,
      'Scripts': 3,
    };
    setActiveTab(tabMap[tabName] ?? 0);
  };

  return (
    <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: '100dvh' }, pb: 8 }}>
      <AppPageHero
        title='Marketing Materials'
        subtitle='Leverage Winnbell with ready-made marketing materials, and check out our growth playbook to bring in more customers.'
        actions={isDesktop ? headerLocationControl : undefined}
      />

      <Container maxWidth='lg' sx={{ mt: { xs: 2, md: 1 }, position: 'relative', zIndex: 1 }}>
        {/* Tabs bar */}
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant='scrollable'
            scrollButtons='auto'
            sx={{
              px: { xs: 1.5, md: 2 },
              '& .MuiTabs-indicator': {
                height: 3,
                backgroundColor: PRIMARY_MAIN,
              },
            }}
          >
            <Tab label='Overview' sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.9rem' }} />
            <Tab label='Social Posts' sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.9rem' }} />
            <Tab label='Posters' sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.9rem' }} />
            <Tab label='Scripts' sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.9rem' }} />
          </Tabs>
        </Paper>

        {/* Tab content */}
        {activeTab === 0 && (
          <OverviewTab
            effectiveLocationId={effectiveLocationId}
            scanUrl={scanUrl}
            onToast={setSnackbar}
            onRequireLocation={() => setLocPickerOpen(true)}
            onTabSwitch={handleTabSwitch}
          />
        )}

        {activeTab === 1 && (
          <SocialPostsTab
            businessName={businessName}
            locationLabel={locations.find(l => l.id === effectiveLocationId)?.name ?? ''}
            scanUrl={scanUrl}
            prizeLabel={prizeLabel}
            canDownload={!!effectiveLocationId}
            onRequireLocation={() => setLocPickerOpen(true)}
            onToast={setSnackbar}
          />
        )}

        {activeTab === 2 && (
          <PostersTab
            businessName={businessName}
            scanUrl={scanUrl}
            effectiveLocationId={effectiveLocationId}
            onToast={setSnackbar}
            onRequireLocation={() => setLocPickerOpen(true)}
            copied={copied}
            onCopy={handleCopyScanUrl}
          />
        )}

        {activeTab === 3 && (
          <ScriptsTab
            scanUrl={scanUrl}
            effectiveLocationId={effectiveLocationId}
            onToast={setSnackbar}
            onRequireLocation={() => setLocPickerOpen(true)}
          />
        )}
      </Container>

      {/* Location picker - opened by every "Choose a location" button so the pick
          happens right where you clicked, no scrolling back to the top. */}
      <Dialog open={locPickerOpen} onClose={() => setLocPickerOpen(false)} maxWidth='xs' fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Choose a location</DialogTitle>
        <Typography variant='body2' color='text.secondary' sx={{ px: 3, pb: 1 }}>
          Your QR codes and materials are unique to each location.
        </Typography>
        <List sx={{ pb: 2, px: 1.5 }}>
          {locations.map((loc) => (
            <ListItemButton
              key={loc.id}
              onClick={() => { setSelectedLocationId(loc.id); setLocPickerOpen(false); }}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 38 }}>
                <LocationOnOutlined sx={{ color: PRIMARY_MAIN }} />
              </ListItemIcon>
              <ListItemText
                primary={loc.name}
                secondary={loc.address}
                primaryTypographyProps={{ fontWeight: 700 }}
                secondaryTypographyProps={{ noWrap: true }}
              />
            </ListItemButton>
          ))}
        </List>
      </Dialog>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={3500}
        onClose={() => setSnackbar('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.includes('failed') ? 'error' : 'success'}
          variant='filled'
          sx={{ width: '100%' }}
        >
          {snackbar}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MarketingPage;

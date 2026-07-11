import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AppPageHero from '../../../shared/components/AppPageHero';
import {
  Box, Container, Paper, Tabs, Tab, Stack,
  Snackbar, Alert,
  Dialog, DialogTitle, List, ListItemButton, ListItemIcon, ListItemText, Typography,
} from '@mui/material';
import { LocationOnOutlined, MenuBookRounded, FactCheckRounded, ArrowForwardRounded } from '@mui/icons-material';
import { useAppSelector } from '../../../store/hook';
import { selectIsBusiness, selectIsLocationManager, selectCurrentUser } from '../../../store/selectors/authSelectors';
import { useBusinessData } from '../../partner/hooks/useBusinessData';
import {
   PRIMARY_MAIN, MOBILE_CONTENT_HEIGHT,
   ACCENT_GOLD_DARK, ACCENT_GOLD_LIGHT,
} from '../../../shared/colors';
import { formatCurrency } from '../../../shared/utils/date';
import SocialPostsTab from '../components/SocialPostsTab';
import PostersTab from '../components/PostersTab';
import ScriptsTab from '../components/ScriptsTab';
import BrandKitTab from '../components/BrandKitTab';
import {
  staggerContainer,
  riseIn,
} from '../../../shared/motion';

// ── Page ──────────────────────────────────────────────────────────────────────
const MarketingPage = () => {
  const navigate = useNavigate();
  const isBusiness = useAppSelector(selectIsBusiness);
  const isManager = useAppSelector(selectIsLocationManager);
  const currentUser = useAppSelector(selectCurrentUser);
  const { data: businessData } = useBusinessData(isBusiness);

  // State
  const [snackbar, setSnackbar] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState<number | ''>('');
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);
  // "Choose a location" buttons open this picker directly (no scroll-to-top hunting).
  const [locPickerOpen, setLocPickerOpen] = useState(false);

  // Center the selected tab in the scrollable tab bar (mobile) - MUI only scrolls it
  // into view at the edge, which hides what comes next.
  const tabsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = tabsRef.current;
    if (!root) return;
    const scroller = root.querySelector<HTMLElement>('.MuiTabs-scroller');
    const selected = root.querySelectorAll<HTMLElement>('.MuiTab-root')[activeTab];
    if (!scroller || !selected) return;
    scroller.scrollTo({
      left: selected.offsetLeft - (scroller.clientWidth - selected.clientWidth) / 2,
      behavior: 'smooth',
    });
  }, [activeTab]);

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

  return (
    <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: 'var(--dvh100, 100dvh)' }, pb: 8 }}>

      {/* Hero entrance - riseIn (full-width, no scale to avoid mobile viewport flash) */}
      <motion.div
        variants={riseIn}
        initial='hidden'
        animate='visible'
      >
        <AppPageHero
          title='Marketing Materials'
          subtitle='Ready-made materials to promote your campaign and drive customer entries.'
        />
      </motion.div>

      <Container maxWidth='lg' sx={{ mt: { xs: 2, md: 1 }, position: 'relative', zIndex: 1 }}>

        {/* Tabs bar entrance */}
        <motion.div
          variants={staggerContainer}
          initial='hidden'
          animate='visible'
        >
          {/* Resource documents - the guide and the participation guidelines, above the tabs */}
          <motion.div variants={riseIn}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 1.5,
                mb: 1.5,
              }}
            >
              {[
                {
                  icon: MenuBookRounded,
                  iconColor: ACCENT_GOLD_DARK,
                  iconBg: ACCENT_GOLD_LIGHT,
                  title: 'Get the most out of Winnbell',
                  desc: 'Simple, proven ways to bring in more customers.',
                  onClick: () => navigate('/marketing/guide'),
                  mobileHidden: false,
                },
                {
                  icon: FactCheckRounded,
                  iconColor: PRIMARY_MAIN,
                  iconBg: `${PRIMARY_MAIN}12`,
                  title: 'Business Participation Guidelines',
                  desc: 'What to say and show so your campaign stays within the rules.',
                  onClick: () => navigate('/business-guidelines'),
                  // Mobile shows only the guide card; the guidelines stay reachable from
                  // the menu (Business Agreement) and the register flow.
                  mobileHidden: true,
                },
              ].map((r) => (
                <Paper
                  key={r.title}
                  elevation={0}
                  onClick={r.onClick}
                  sx={{
                    // minWidth 0: grid items default to min-width auto, which stops them
                    // shrinking below their text width and overflows narrow screens.
                    minWidth: 0,
                    display: r.mobileHidden ? { xs: 'none', sm: 'flex' } : 'flex',
                    alignItems: 'center', gap: 1.75,
                    px: 2, py: 1.5, borderRadius: 2.5,
                    border: '1px solid', borderColor: 'divider',
                    cursor: 'pointer', transition: 'all 0.18s ease',
                    '&:hover': {
                      borderColor: r.iconColor,
                      boxShadow: `0 6px 18px -8px ${r.iconColor}55`,
                      transform: 'translateY(-1px)',
                      '& .doc-arrow': { transform: 'translateX(3px)', color: r.iconColor },
                    },
                    '&:active': { transform: 'scale(0.99)' },
                  }}
                >
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: r.iconBg, color: r.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <r.icon sx={{ fontSize: 20 }} />
                  </Box>
                  <Stack sx={{ minWidth: 0, flex: 1 }}>
                    <Typography noWrap sx={{ fontSize: '0.875rem', fontWeight: 800 }}>{r.title}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1.4 }}>{r.desc}</Typography>
                  </Stack>
                  <ArrowForwardRounded className='doc-arrow' sx={{ fontSize: 18, color: 'text.disabled', flexShrink: 0, transition: 'all 0.18s ease' }} />
                </Paper>
              ))}
            </Box>
          </motion.div>

          <motion.div variants={riseIn}>
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 3 }}>
              <Tabs
                ref={tabsRef}
                value={activeTab}
                onChange={(_, val) => setActiveTab(val)}
                variant='scrollable'
                scrollButtons='auto'
                sx={{
                  px: { xs: 1.5, md: 2 },
                  '& .MuiTabs-indicator': {
                    height: 3,
                    backgroundColor: PRIMARY_MAIN,
                    // Spring-feel cubic-bezier for a snappy left/width slide between tabs.
                    // MUI sets these properties via direct style mutation so CSS transition
                    // is the correct mechanism here (Framer layoutId cannot track it).
                    transition: 'left 0.25s cubic-bezier(0.34,1.56,0.64,1), width 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                  },
                }}
              >
                <Tab label='QR Posters' sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.9rem' }} />
                <Tab label='Social Assets' sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.9rem' }} />
                <Tab label='Staff Scripts' sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.9rem' }} />
                <Tab label='Create Your Own' sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.9rem' }} />
              </Tabs>
            </Paper>
          </motion.div>
        </motion.div>

        {/* Tab content */}
        {activeTab === 0 && (
          <PostersTab
            businessName={businessName}
            scanUrl={scanUrl}
            effectiveLocationId={effectiveLocationId}
            onToast={setSnackbar}
            onRequireLocation={() => setLocPickerOpen(true)}
            copied={copied}
            onCopy={handleCopyScanUrl}
            minAmountLabel={businessData?.min_transaction_amount ? `${formatCurrency(Number(businessData.min_transaction_amount))}` : null}
          />
        )}

        {activeTab === 1 && (
          <SocialPostsTab
            businessName={businessName}
            scanUrl={scanUrl}
            canDownload={!!effectiveLocationId}
            onRequireLocation={() => setLocPickerOpen(true)}
            onToast={setSnackbar}
          />
        )}

        {activeTab === 2 && (
          <ScriptsTab onToast={setSnackbar} />
        )}

        {activeTab === 3 && (
          <BrandKitTab
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
          severity={snackbar.includes('failed') ? 'error' : snackbar.includes('coming soon') ? 'info' : 'success'}
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

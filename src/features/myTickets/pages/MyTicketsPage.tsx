import { Box, Container, Paper, Typography, useMediaQuery, useTheme, Autocomplete, TextField, CircularProgress, Button } from '@mui/material';
import { AddRounded } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AppPageHero from '../../../shared/components/AppPageHero';
import { ActiveTicketsList } from '../components/ActiveTicketsList';
import { DrawSwiper } from '../../draw/components/DrawSwiper';
import { useState } from 'react';
import { useAppSelector } from '../../../store/hook';
import { selectIsBusiness, selectIsLocationManager } from '../../../store/selectors/authSelectors';
import { useSubscription } from '../../subscription/hooks/useSubscription';
import { useBusinessData } from '../../partner/hooks/useBusinessData';
import DrawPreparationView from '../../tickets/components/DrawPreparationView';
import { MOBILE_CONTENT_HEIGHT } from '../../../shared/colors';
import { riseIn, staggerContainer, pressable } from '../../../shared/motion';

const MyTicketsPage = () => {
  const navigate = useNavigate();
  const [activeDrawId, setActiveDrawId] = useState<number | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | undefined>(undefined);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isBusiness = useAppSelector(selectIsBusiness);
  const isManager = useAppSelector(selectIsLocationManager);
  const isBusinessUser = isBusiness || isManager;

  const { data: subscription, isLoading: subLoading } = useSubscription(isBusinessUser);
  const { data: businessData } = useBusinessData(isBusinessUser);

  // The real "Distributed Entries" page is only meaningful while the business is
  // actually in an OPEN campaign. Otherwise (no subscription yet, subscribed but
  // the campaign hasn't opened, or cancelled and out of the draw) show the
  // preparation/steps view. `subscription` is null when the business has never
  // subscribed (the details query inner-joins the subscription row).
  const isSubscribed = !!subscription && ['Active', 'Trialing', 'Past_Due'].includes(subscription.status);
  const inOpenCampaign = subscription?.draw_status === 'Open' && !!subscription?.draw_id;
  const showPreparation = isBusinessUser && !inOpenCampaign;

  const hasDescription = !!(businessData?.description?.trim());
  const hasLocations = (businessData?.locations?.length ?? 0) > 0;
  const locations = businessData?.locations ?? [];

  // Wait for the subscription status before deciding which view to show, so we
  // never flash the real entries page before falling back to preparation.
  if (isBusinessUser && subLoading) {
    return (
      <Box sx={{ minHeight: '60dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  if (showPreparation) {
    return (
      <Box>
        <DrawPreparationView
          subscription={subscription ?? undefined}
          hasDescription={hasDescription}
          hasLocations={hasLocations}
          hasReceiptExample={!!businessData?.receipt_example_image_url}
          minSpend={businessData?.min_transaction_amount ?? null}
          isDesktop={isDesktop}
          isManager={isManager}
          isSubscribed={isSubscribed}
        />
      </Box>
    );
  }

  if (isDesktop) {
    return (
      <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: 'var(--dvh100, 100dvh)' }, pb: 6 }}>
        <AppPageHero
          title={isBusinessUser ? 'Distributed Entries' : 'My Entries'}
          subtitle={isBusinessUser ? 'Track your distributed entries' : 'Your entries for this campaign'}
          actions={!isBusinessUser ? (
            <Box component={motion.div} {...pressable} sx={{ display: 'inline-block' }}>
              <Button
                variant='contained'
                startIcon={<AddRounded />}
                onClick={() => navigate('/scan')}
                sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', boxShadow: 'none' }}
              >
                Add entry
              </Button>
            </Box>
          ) : undefined}
        />

        <Container maxWidth='lg' sx={{ mt: 1 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 3, alignItems: 'flex-start' }}>
            {/* Active campaigns column - borderless; each card carries its own surface. */}
            <Box sx={{ position: 'sticky', top: 24 }}>
              <Typography variant='caption' fontWeight={800} sx={{ display: 'block', px: 0.5, mb: 1.5, textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary' }}>
                Active Campaigns
              </Typography>
              {isBusiness && !isManager && locations.length > 1 && (
                <Box sx={{ mb: 1.5 }}>
                  <Autocomplete
                    size='small'
                    fullWidth
                    options={locations}
                    getOptionLabel={(opt) => opt.name}
                    value={locations.find(l => l.id === selectedLocationId) ?? null}
                    onChange={(_, val) => setSelectedLocationId(val?.id ?? undefined)}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    renderInput={(params) => <TextField {...params} label='All locations' sx={{}} />}
                  />
                </Box>
              )}
              <DrawSwiper
                draw_id={activeDrawId}
                onDrawChange={(id) => setActiveDrawId(id)}
                compact
              />
            </Box>

            {/* Ticket list */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                minHeight: 320,
              }}
            >
              <ActiveTicketsList draw_id={activeDrawId} locationId={selectedLocationId} desktop />
            </Paper>
          </Box>
        </Container>
      </Box>
    );
  }

  // Mobile
  return (
    // overflowX clip: entrance translations must never widen the document, or the mobile
    // browser rescales the page (zoom flash). clip, not hidden, so no scroll container.
    <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: 'var(--dvh100, 100dvh)' }, overflowX: 'clip' }}>
      {/* Hero renders full-size, OUTSIDE the zoom box below. */}
      <AppPageHero
        title={isBusinessUser ? 'Distributed Entries' : 'My Entries'}
        subtitle={isBusinessUser ? 'Track your distributed entries' : 'All your entries in one place'}
      />

      <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
        <Box sx={{ zoom: { xs: 0.9, md: 1 } }}>
          {/* Draw deck - rises in */}
          <motion.div variants={riseIn}>
            <Box sx={{ pt: 4 }}>
              <DrawSwiper
                draw_id={activeDrawId}
                onDrawChange={(id) => setActiveDrawId(id)}
              />
            </Box>
          </motion.div>

          {/* Location selector - pops in */}
          {isBusiness && !isManager && locations.length > 1 && (
            <motion.div variants={riseIn}>
              <Box sx={{ px: 2, pt: 1.5, position: 'relative', pr: 2.5 }}>
                <Autocomplete
                  size='small'
                  fullWidth
                  disablePortal
                  options={locations}
                  getOptionLabel={(opt) => opt.name}
                  value={locations.find(l => l.id === selectedLocationId) ?? null}
                  onChange={(_, val) => setSelectedLocationId(val?.id ?? undefined)}
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  renderInput={(params) => <TextField {...params} label='All locations' sx={{}} />}
                />
              </Box>
            </motion.div>
          )}

          {/* Ticket list - pops in with stagger */}
          <motion.div variants={riseIn}>
            <ActiveTicketsList draw_id={activeDrawId} locationId={selectedLocationId} />
          </motion.div>
        </Box>
      </motion.div>
    </Box>
  );
};

export default MyTicketsPage;

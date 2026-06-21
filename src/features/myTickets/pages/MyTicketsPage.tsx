import { Box, Container, Paper, Stack, Typography, useMediaQuery, useTheme, Autocomplete, TextField, CircularProgress } from '@mui/material';
import { ConfirmationNumber } from '@mui/icons-material';
import { ActiveTicketsList } from '../components/ActiveTicketsList';
import { DrawSwiper } from '../../draw/components/DrawSwiper';
import { useState } from 'react';
import { useAppSelector } from '../../../store/hook';
import { selectIsBusiness, selectIsLocationManager } from '../../../store/selectors/authSelectors';
import { useSubscription } from '../../subscription/hooks/useSubscription';
import { useBusinessData } from '../../partner/hooks/useBusinessData';
import DrawPreparationView from '../../tickets/components/DrawPreparationView';
import {
  GRADIENT_HERO,
  ALPHA_WHITE_15,
  ALPHA_WHITE_30,
  MOBILE_CONTENT_HEIGHT,
} from '../../../shared/colors';

const MyTicketsPage = () => {
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
          isDesktop={isDesktop}
          isManager={isManager}
          isSubscribed={isSubscribed}
        />
      </Box>
    );
  }

  if (isDesktop) {
    return (
      <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: '100dvh' }, pb: 6 }}>
        {/* Hero */}
        <Box sx={{ background: GRADIENT_HERO, pt: 3, pb: 9, px: 3, color: 'white', borderRadius: '0 0 32px 32px' }}>
          <Container maxWidth='lg'>
            <Stack direction='row' alignItems='center' spacing={2}>
              <Box sx={{
                width: 52, height: 52, borderRadius: 2,
                bgcolor: ALPHA_WHITE_15, border: `1px solid ${ALPHA_WHITE_30}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ConfirmationNumber sx={{ color: 'white', fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant='h5' fontWeight={800}>
                  {isBusinessUser ? 'Distributed Entries' : 'My Entries'}
                </Typography>
                <Typography variant='body2' sx={{ opacity: 0.75 }}>
                  {isBusinessUser ? 'Track all distributed entries by campaign' : 'Your entries for all active campaigns'}
                </Typography>
              </Box>
            </Stack>
          </Container>
        </Box>

        <Container maxWidth='lg' sx={{ mt: -5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 3, alignItems: 'flex-start' }}>
            {/* Draw selector */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                position: 'sticky',
                top: 24,
              }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant='caption' fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary' }}>
                  Active Campaigns
                </Typography>
              </Box>
              {isBusiness && !isManager && locations.length > 1 && (
                <Box sx={{ px: 2, pt: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
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
            </Paper>

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
              <ActiveTicketsList draw_id={activeDrawId} locationId={selectedLocationId} />
            </Paper>
          </Box>
        </Container>
      </Box>
    );
  }

  // Mobile
  return (
    <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: '100dvh' }, zoom: { xs: 0.9, md: 1 } }}>
      {/* Hero */}

      <Box sx={{ pt:2}}>
        <DrawSwiper
          draw_id={activeDrawId}
          onDrawChange={(id) => setActiveDrawId(id)}
        />
      </Box>

      {isBusiness && !isManager && locations.length > 1 && (
        <Box sx={{ px: 2, pt: 1.5, position: 'relative',pr:2.5 }}>
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
      )}

      <ActiveTicketsList draw_id={activeDrawId} locationId={selectedLocationId} />
    </Box>
  );
};

export default MyTicketsPage;

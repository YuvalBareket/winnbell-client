import { Box, Container, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ConfirmationNumberOutlined } from '@mui/icons-material';
import { ActiveTicketsList } from '../components/ActiveTicketsList';
import { DrawSwiper } from '../../draw/components/DrawSwiper';
import { useState } from 'react';
import { useAppSelector } from '../../../store/hook';
import { selectIsBusiness, selectIsLocationManager } from '../../../store/selectors/authSelectors';
import { useSubscription } from '../../subscription/hooks/useSubscription';
import { useBusinessData } from '../../partner/hooks/useBusinessData';
import DrawPreparationView from '../../tickets/components/DrawPreparationView';
import {
  BG_PAGE,
  GRADIENT_HERO,
  ALPHA_WHITE_15,
  ALPHA_WHITE_30,
} from '../../../shared/colors';

const MyTicketsPage = () => {
  const [activeDrawId, setActiveDrawId] = useState<number | null>(null);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isBusiness = useAppSelector(selectIsBusiness);
  const isManager = useAppSelector(selectIsLocationManager);
  const isBusinessUser = isBusiness || isManager;

  const { data: subscription } = useSubscription(isBusiness);
  const { data: businessData } = useBusinessData(isBusiness);
  const drawIsUpcoming = isBusiness && subscription?.draw_status === 'Upcoming';
  const hasNoActiveDraw = isBusiness && !!subscription && !subscription.draw_id;
  const showPreparation = isBusiness && (drawIsUpcoming || hasNoActiveDraw);

  const hasDescription = !!(businessData?.description?.trim());
  const hasLocations = (businessData?.locations?.length ?? 0) > 0;

  if (showPreparation) {
    return (
      <DrawPreparationView
        subscription={subscription}
        hasDescription={hasDescription}
        hasLocations={hasLocations}
        isDesktop={isDesktop}
      />
    );
  }

  if (isDesktop) {
    return (
      <Box sx={{ bgcolor: BG_PAGE, minHeight: '100vh', pb: 6 }}>
        {/* Hero */}
        <Box
          sx={{
            background: GRADIENT_HERO,
            pt: 3,
            pb: 9,
            px: 3,
            color: 'white',
            borderRadius: '0 0 32px 32px',
          }}
        >
          <Container maxWidth='lg'>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 2,
                  bgcolor: ALPHA_WHITE_15,
                  border: `1px solid ${ALPHA_WHITE_30}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ConfirmationNumberOutlined sx={{ color: 'white', fontSize: 26 }} />
              </Box>
              <Box>
                <Typography variant='h5' fontWeight={800}>
                  {isBusinessUser ? 'Distributed Tickets' : 'My Tickets'}
                </Typography>
                <Typography variant='body2' sx={{ opacity: 0.75, mt: 0.25 }}>
                  {isBusinessUser
                    ? 'Track all distributed tickets by draw'
                    : 'Your entries for all active draws'}
                </Typography>
              </Box>
            </Box>
          </Container>
        </Box>

        <Container maxWidth='lg' sx={{ mt: -5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '264px 1fr', gap: 3, alignItems: 'flex-start' }}>
            {/* Left: Draw selector panel */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                position: 'sticky',
                top: 24,
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.default',
                }}
              >
                <Typography
                  variant='caption'
                  fontWeight={700}
                  color='text.disabled'
                  sx={{ textTransform: 'uppercase', letterSpacing: 1 }}
                >
                  Active Draws
                </Typography>
              </Box>
              <DrawSwiper
                draw_id={activeDrawId}
                onDrawChange={(id) => setActiveDrawId(id)}
                compact
              />
            </Paper>

            {/* Right: Ticket list panel */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                minHeight: 320,
              }}
            >
              <ActiveTicketsList draw_id={activeDrawId} />
            </Paper>
          </Box>
        </Container>
      </Box>
    );
  }

  // Mobile: original swiper + list flow
  return (
    <Box>
      <DrawSwiper
        draw_id={activeDrawId}
        onDrawChange={(id) => setActiveDrawId(id)}
      />
      <ActiveTicketsList draw_id={activeDrawId} />
    </Box>
  );
};

export default MyTicketsPage;

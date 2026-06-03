import { useState } from 'react';
import {
  Box, Container, Typography, Paper, Stack, Skeleton,
} from '@mui/material';
import AppHeader from '../../../shared/components/AppHeader';
import AppMenuDrawer from '../../../shared/components/AppMenuDrawer';
import { EmojiEvents, EmojiEventsOutlined } from '@mui/icons-material';
import EmptyState from '../../../shared/components/EmptyState';
import { useGetDrawHistory } from '../hooks/useGetDraws';
import {
  GRADIENT_HERO, ALPHA_WHITE_15, ALPHA_WHITE_30, TEXT_HEADING,
  TEXT_SECONDARY, BORDER_LIGHT, MOBILE_CONTENT_HEIGHT,
} from '../../../shared/colors';
import DrawHistoryCard from '../components/DrawHistoryCard';

const DrawHistoryPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: history, isLoading, isError } = useGetDrawHistory();

  // Separate active and closed campaigns
  const activeCampaigns = history?.filter(d => d.status?.toLowerCase() === 'open') ?? [];
  const closedCampaigns = history?.filter(d => d.status?.toLowerCase() === 'closed') ?? [];

  return (
    <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: '100dvh' }, pb: { xs: 12, md: 6 }, zoom: { xs: 0.9, md: 1 } }}>
      <AppMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Hero Header */}
      <Box sx={{ background: GRADIENT_HERO, pt: { xs: 0, md: 3 }, pb: 6, color: 'white' }}>
        <AppHeader onMenuOpen={() => setMenuOpen(true)} onGradient />
        <Container maxWidth='lg' sx={{ pt: { xs: 1, md: 0 }, px: 3 }}>
          <Stack direction='row' alignItems='center' spacing={2}>
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
              <EmojiEvents sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant='h5' fontWeight={800}>
                Campaigns Hub
              </Typography>
              <Typography variant='body2' sx={{ opacity: 0.75 }}>
                Track active campaigns and winner history
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth='lg' sx={{ mt: 4 }}>
        {/* Error state */}
        {isError && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'error.light',
              bgcolor: 'error.50',
              mb: 3,
            }}
          >
            <Typography color='error'>
              Failed to load campaign history. Please try again.
            </Typography>
          </Paper>
        )}

        {/* Loading state */}
        {isLoading && (
          <Stack spacing={3}>
            <Box>
              <Skeleton
                variant='rounded'
                height={280}
                sx={{ borderRadius: 2, mb: 3 }}
              />
            </Box>
            <Box>
              <Skeleton variant='text' width='200px' height={32} sx={{ mb: 2 }} />
              {[1, 2].map(i => (
                <Skeleton
                  key={i}
                  variant='rounded'
                  height={200}
                  sx={{ borderRadius: 2, mb: 2.5 }}
                />
              ))}
            </Box>
          </Stack>
        )}

        {/* Empty state */}
        {!isLoading && !isError && (!history || history.length === 0) && (
          <Paper
            elevation={0}
            sx={{
              p: 0,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <EmptyState
              icon={<EmojiEventsOutlined />}
              title='No campaigns yet'
              description='Campaigns appear here once they have closed and a winner has been selected'
            />
          </Paper>
        )}

        {/* Active campaign section */}
        {!isLoading && history && history.length > 0 && activeCampaigns.length > 0 && (
          <Box sx={{ mb: 5 }}>
            <Typography
              variant='subtitle1'
              fontWeight={800}
              color={TEXT_HEADING}
              sx={{
                mb: 2.5,
                fontSize: '0.95rem',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                color: TEXT_SECONDARY,
              }}
            >
              Current Campaign
            </Typography>
            <Stack spacing={2.5}>
              {activeCampaigns.map(draw => (
                <DrawHistoryCard key={draw.id} draw={draw} />
              ))}
            </Stack>
          </Box>
        )}

        {/* Past campaigns section */}
        {!isLoading && history && closedCampaigns.length > 0 && (
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 2.5,
                pb: 2.5,
                borderBottom: `1px solid ${BORDER_LIGHT}`,
              }}
            >
              <Typography
                variant='subtitle1'
                fontWeight={800}
                color={TEXT_HEADING}
                sx={{
                  fontSize: '0.95rem',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  color: TEXT_SECONDARY,
                }}
              >
                Past Campaigns
              </Typography>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: 'rgba(0,0,0,0.04)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: TEXT_SECONDARY,
                }}
              >
                {closedCampaigns.length}
              </Box>
            </Box>
            <Stack spacing={2.5}>
              {closedCampaigns.map(draw => (
                <DrawHistoryCard key={draw.id} draw={draw} />
              ))}
            </Stack>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default DrawHistoryPage;

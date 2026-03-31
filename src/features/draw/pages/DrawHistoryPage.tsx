import {
  Box, Container, Typography, Paper, Stack, Chip, Skeleton,
} from '@mui/material';
import { EmojiEvents, CalendarToday, EmojiEventsOutlined, StorefrontOutlined, CardGiftcard } from '@mui/icons-material';
import { useGetDrawHistory } from '../hooks/useGetDraws';
import { formatCurrency } from '../../../shared/utils/date';
import {
  BG_PAGE, GRADIENT_HERO, ALPHA_WHITE_15, ALPHA_WHITE_30,
  PRIMARY_MAIN, GOLD_TROPHY,
} from '../../../shared/colors';
import type { IDrawResult } from '../types';

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' });

const DrawHistoryCard = ({ draw }: { draw: IDrawResult }) => {
  const hasWinner = !!draw.winner_name;
  const isBusinessWinner = hasWinner && !!draw.winner_business_name;
  const isFreeTicketWinner = hasWinner && !draw.winner_business_name;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2.5, pb: 2 }}>
        <Stack direction='row' justifyContent='space-between' alignItems='flex-start'>
          <Box flex={1} minWidth={0} pr={1}>
            <Typography variant='body2' fontWeight={700} color='text.secondary' noWrap sx={{ mb: 0.25 }}>
              {draw.name}
            </Typography>
            <Typography variant='h5' fontWeight={900} color='text.primary' lineHeight={1.1}>
              {formatCurrency(draw.prize_amount)}
            </Typography>
          </Box>
          <Chip
            label='Closed'
            size='small'
            sx={{ fontWeight: 700, fontSize: '0.65rem', bgcolor: 'action.hover', color: 'text.secondary' }}
          />
        </Stack>

        <Stack direction='row' alignItems='center' spacing={0.5} mt={1.5}>
          <CalendarToday sx={{ fontSize: 13, color: 'text.disabled' }} />
          <Typography variant='caption' color='text.secondary' fontWeight={600}>
            {formatDate(draw.draw_date)}
          </Typography>
        </Stack>
      </Box>

      {/* Winner Story Block */}
      <Box sx={{ px: 2.5, pb: 2.5 }}>
        {hasWinner ? (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderLeft: '4px solid',
              borderLeftColor: isBusinessWinner ? PRIMARY_MAIN : '#10b981',
            }}
          >
            {isBusinessWinner ? (
              <Stack spacing={0.75}>
                <Stack direction='row' alignItems='flex-start' spacing={1}>
                  <StorefrontOutlined
                    sx={{
                      fontSize: 24,
                      color: PRIMARY_MAIN,
                      flexShrink: 0,
                      mt: 0.25,
                    }}
                  />
                  <Box flex={1} minWidth={0}>
                    <Typography
                      variant='h6'
                      fontWeight={900}
                      color='text.primary'
                      sx={{ lineHeight: 1.2 }}
                    >
                      {draw.winner_business_name}
                    </Typography>
                    {draw.winner_location_name && (
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        fontWeight={600}
                        sx={{ mt: 0.25 }}
                      >
                        {draw.winner_location_name}
                      </Typography>
                    )}
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      fontStyle='italic'
                      sx={{ mt: 0.75 }}
                    >
                      A regular purchase turned into a big win
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            ) : (
              <Stack spacing={0.75}>
                <Stack direction='row' alignItems='flex-start' spacing={1}>
                  <CardGiftcard
                    sx={{
                      fontSize: 24,
                      color: '#10b981',
                      flexShrink: 0,
                      mt: 0.25,
                    }}
                  />
                  <Box flex={1} minWidth={0}>
                    <Typography
                      variant='h6'
                      fontWeight={900}
                      color='text.primary'
                      sx={{ lineHeight: 1.2 }}
                    >
                      Won with a free weekly ticket!
                    </Typography>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      fontStyle='italic'
                      sx={{ mt: 0.75 }}
                    >
                      No purchase needed — anyone can win
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <EmojiEventsOutlined sx={{ fontSize: 20, color: 'text.disabled', flexShrink: 0 }} />
            <Typography variant='body2' color='text.disabled' fontWeight={600}>
              No winner recorded
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

const DrawHistoryPage = () => {
  const { data: history, isLoading, isError } = useGetDrawHistory();

  return (
    <Box sx={{ bgcolor: BG_PAGE, minHeight: '100vh', pb: { xs: 12, md: 6 } }}>
      {/* Hero */}
      <Box sx={{ background: GRADIENT_HERO, pt: 3, pb: 9, px: 3, color: 'white', borderRadius: '0 0 32px 32px' }}>
        <Container maxWidth='lg'>
          <Stack direction='row' alignItems='center' spacing={2}>
            <Box sx={{
              width: 52, height: 52, borderRadius: 2,
              bgcolor: ALPHA_WHITE_15, border: `1px solid ${ALPHA_WHITE_30}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <EmojiEvents sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant='h5' fontWeight={800}>Draw History</Typography>
              <Typography variant='body2' sx={{ opacity: 0.75 }}>Past draws and their winners</Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth='lg' sx={{ mt: -5 }}>
        {isError && (
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'error.light', bgcolor: 'error.50', mb: 3 }}>
            <Typography color='error'>Failed to load draw history. Please try again.</Typography>
          </Paper>
        )}

        {isLoading && (
          <Stack spacing={2}>
            {[1, 2, 3].map(i => (
              <Skeleton key={i} variant='rounded' height={160} sx={{ borderRadius: 3 }} />
            ))}
          </Stack>
        )}

        {!isLoading && !isError && (!history || history.length === 0) && (
          <Paper elevation={0} sx={{ p: 6, borderRadius: 3, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
            <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: `${PRIMARY_MAIN}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
              <EmojiEventsOutlined sx={{ fontSize: 36, color: PRIMARY_MAIN }} />
            </Box>
            <Typography variant='h6' fontWeight={700} color='text.primary' mb={0.75}>No past draws yet</Typography>
            <Typography variant='body2' color='text.secondary'>
              Completed draws and their winners will appear here.
            </Typography>
          </Paper>
        )}

        {!isLoading && history && history.length > 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
            {history.map(draw => (
              <DrawHistoryCard key={draw.id} draw={draw} />
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default DrawHistoryPage;

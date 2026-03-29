import {
  Box, Container, Typography, Paper, Stack, Chip, Skeleton, Avatar,
} from '@mui/material';
import { EmojiEvents, CalendarToday, ConfirmationNumberOutlined, EmojiEventsOutlined, StorefrontOutlined } from '@mui/icons-material';
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
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: hasWinner ? `${GOLD_TROPHY}44` : 'divider',
        overflow: 'hidden',
        bgcolor: hasWinner ? `${GOLD_TROPHY}08` : 'background.paper',
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

      {/* Winner section */}
      <Box sx={{ px: 2.5, pb: 2.5 }}>
        <Box sx={{
          p: 2,
          borderRadius: 2.5,
          bgcolor: hasWinner ? `${GOLD_TROPHY}14` : 'action.hover',
          border: '1px solid',
          borderColor: hasWinner ? `${GOLD_TROPHY}33` : 'divider',
        }}>
          {hasWinner ? (
            <Stack direction='row' spacing={1.5} alignItems='center'>
              <Avatar sx={{ width: 40, height: 40, bgcolor: GOLD_TROPHY, color: 'white', fontWeight: 800, fontSize: 18 }}>
                <EmojiEvents sx={{ fontSize: 22 }} />
              </Avatar>
              <Box flex={1} minWidth={0}>
                <Typography variant='caption' fontWeight={700} color='text.disabled' sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Winner
                </Typography>
                <Typography variant='body2' fontWeight={800} color='text.primary' noWrap>
                  {draw.winner_name}
                </Typography>
                {draw.winning_ticket_code && (
                  <Stack direction='row' alignItems='center' spacing={0.5} mt={0.25}>
                    <ConfirmationNumberOutlined sx={{ fontSize: 12, color: 'text.disabled' }} />
                    <Typography variant='caption' color='text.disabled' fontWeight={600} sx={{ fontFamily: 'monospace', letterSpacing: 0.5 }}>
                      {draw.winning_ticket_code}
                    </Typography>
                  </Stack>
                )}
                {draw.winner_business_name && (
                  <Stack direction='row' alignItems='center' spacing={0.5} mt={0.25}>
                    <StorefrontOutlined sx={{ fontSize: 12, color: 'text.disabled' }} />
                    <Typography variant='caption' color='text.disabled' fontWeight={600} noWrap>
                      {draw.winner_business_name}
                      {draw.winner_location_name ? ` · ${draw.winner_location_name}` : ''}
                    </Typography>
                  </Stack>
                )}
              </Box>
            </Stack>
          ) : (
            <Stack direction='row' spacing={1.5} alignItems='center'>
              <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <EmojiEventsOutlined sx={{ fontSize: 20, color: 'text.disabled' }} />
              </Box>
              <Typography variant='body2' color='text.disabled' fontWeight={600}>
                No winner recorded
              </Typography>
            </Stack>
          )}
        </Box>
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

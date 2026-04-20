import {
  Box, Container, Typography, Paper, Stack, Skeleton,
} from '@mui/material';
import { EmojiEvents, EmojiEventsOutlined } from '@mui/icons-material';
import EmptyState from '../../../shared/components/EmptyState';
import { useGetDrawHistory } from '../hooks/useGetDraws';
import {
  BG_PAGE, GRADIENT_HERO, ALPHA_WHITE_15, ALPHA_WHITE_30,
} from '../../../shared/colors';
import DrawHistoryCard from '../components/DrawHistoryCard';

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
          <Paper elevation={0} sx={{ p: 0, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <EmptyState
              icon={<EmojiEventsOutlined />}
              title='No draws yet'
              description='Draws appear here once they&#39;ve closed and a winner has been selected'
            />
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

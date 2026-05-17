import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  LinearProgress,
  Alert,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

interface Props {
  overview: any;
  currentOpenDraw: any;
}

const OverviewTab: React.FC<Props> = ({ overview, currentOpenDraw }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Stack spacing={3}>
      {/* KPI Cards */}
      <Grid container spacing={isMobile ? 1.5 : 2}>
        {/* Total Users */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Stack spacing={1} alignItems='flex-start'>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                  }}
                >
                  <PeopleIcon />
                </Box>
                <Typography variant='body2' color='text.secondary'>
                  Total Users
                </Typography>
                <Typography variant='h6' fontWeight={700}>
                  {overview?.users?.total_users ?? 0}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {overview?.users?.business_users ?? 0} businesses,{' '}
                  {overview?.users?.regular_users ?? 0} regular
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Businesses */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Stack spacing={1} alignItems='flex-start'>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    backgroundColor: '#e8f5e9',
                    color: '#2e7d32',
                  }}
                >
                  <StorefrontIcon />
                </Box>
                <Typography variant='body2' color='text.secondary'>
                  Active Businesses
                </Typography>
                <Typography variant='h6' fontWeight={700}>
                  {overview?.businesses?.active ?? 0}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  of {overview?.businesses?.total ?? 0} total
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Subscriptions */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Stack spacing={1} alignItems='flex-start'>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    backgroundColor: '#f3e5f5',
                    color: '#7b1fa2',
                  }}
                >
                  <CreditCardIcon />
                </Box>
                <Typography variant='body2' color='text.secondary'>
                  Active Subscriptions
                </Typography>
                <Typography variant='h6' fontWeight={700}>
                  {overview?.subscriptions?.active_subs ?? 0}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  ${Number(overview?.subscriptions?.total_fees ?? 0).toLocaleString()} monthly
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Current Draw Prize Pool */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Stack spacing={1} alignItems='flex-start'>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    backgroundColor: '#fff3e0',
                    color: '#f57c00',
                  }}
                >
                  <EmojiEventsIcon />
                </Box>
                <Typography variant='body2' color='text.secondary'>
                  Current Campaign Prize
                </Typography>
                <Typography variant='h6' fontWeight={700}>
                  ${Number(overview?.currentDraw?.prize_pool ?? 0).toLocaleString()}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {overview?.currentDraw?.name ?? 'No active campaign'}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Current Draw Card */}
      {currentOpenDraw ? (
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Stack spacing={2}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant='h6' fontWeight={700}>
                    {currentOpenDraw.name}
                  </Typography>
                  <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                    Prize Pool: ${Number(currentOpenDraw.prize_amount ?? 0).toLocaleString()}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Draw Date: {new Date(currentOpenDraw.draw_date).toLocaleDateString()}
                  </Typography>
                </Box>
                <Chip label='Open' color='primary' />
              </Box>

              {/* Ticket activation progress */}
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Typography variant='body2' fontWeight={500}>
                    Entry Activation
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {overview?.currentDrawTickets?.activated ?? 0} /{' '}
                    {overview?.currentDrawTickets?.total_tickets ?? 0}
                  </Typography>
                </Box>
                <LinearProgress
                  variant='determinate'
                  value={
                    overview?.currentDrawTickets?.total_tickets
                      ? (overview.currentDrawTickets.activated /
                        overview.currentDrawTickets.total_tickets) *
                      100
                      : 0
                  }
                  sx={{ height: 8, borderRadius: 1 }}
                />
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ display: 'block', mt: 1 }}
                >
                  {overview?.currentDrawTickets?.total_tickets
                    ? Math.round(
                      (overview.currentDrawTickets.activated /
                        overview.currentDrawTickets.total_tickets) *
                      100
                    )
                    : 0}
                  % activated
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Alert severity='info'>
          No active campaign. Create and open a campaign in the <strong>Campaigns</strong> tab to start a raffle.
        </Alert>
      )}
    </Stack>
  );
};

export default OverviewTab;

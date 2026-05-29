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
  Button,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PeopleIcon from '@mui/icons-material/People';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface Props {
  overview: any;
  currentOpenDraw: any;
}

const OverviewTab: React.FC<Props> = ({ overview, currentOpenDraw }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const flaggedUsers = overview?.attention?.flagged_users ?? 0;
  const hasAttention = flaggedUsers > 0;

  const daysUntilDraw = currentOpenDraw?.draw_date
    ? Math.max(0, Math.ceil((new Date(currentOpenDraw.draw_date).getTime() - Date.now()) / 86_400_000))
    : null;

  return (
    <Stack spacing={3}>
      {/* Attention Required */}
      {hasAttention && (
        <Alert
          severity='warning'
          icon={<WarningAmberIcon />}
          action={
            <Button color='inherit' size='small' href='/admin/users' sx={{ fontWeight: 700 }}>
              Review
            </Button>
          }
        >
          <strong>{flaggedUsers} high-risk user{flaggedUsers !== 1 ? 's' : ''}</strong> with risk score ≥ 20 need review.
        </Alert>
      )}

      {/* KPI Cards */}
      <Grid container spacing={isMobile ? 1.5 : 2}>
        {/* Total Users */}
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
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
                    bgcolor: theme => alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
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
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
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
                    bgcolor: theme => alpha(theme.palette.success.main, 0.1),
                    color: 'success.main',
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
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
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
                    bgcolor: theme => alpha(theme.palette.secondary.main, 0.1),
                    color: 'secondary.main',
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
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
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
                    bgcolor: theme => alpha(theme.palette.warning.main, 0.1),
                    color: 'warning.main',
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
                <Stack direction='row' spacing={1} alignItems='center'>
                  {daysUntilDraw !== null && (
                    <Chip
                      label={daysUntilDraw === 0 ? 'Draw today!' : `${daysUntilDraw}d left`}
                      color={daysUntilDraw <= 3 ? 'warning' : 'default'}
                      size='small'
                    />
                  )}
                  <Chip label='Open' color='primary' size='small' />
                </Stack>
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

      {/* Revenue Model */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant='subtitle2' fontWeight={700} mb={0.5}>Revenue Model</Typography>
          <Typography variant='body2' color='text.secondary'>
            Businesses pay a monthly subscription fee to participate in campaigns. Currently{' '}
            <strong>{overview?.subscriptions?.active_subs ?? 0} active subscriptions</strong> generating{' '}
            <strong>${Number(overview?.subscriptions?.total_fees ?? 0).toLocaleString()}/mo</strong>.
          </Typography>
        </CardContent>
      </Card>

    </Stack>
  );
};

export default OverviewTab;

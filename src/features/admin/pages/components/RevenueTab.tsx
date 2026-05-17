import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

interface Props {
  overview: any;
}

const RevenueTab: React.FC<Props> = ({ overview }) => {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Stack spacing={1}>
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
              <Typography variant='h5' fontWeight={700}>
                {overview?.subscriptions?.active_subs ?? 0}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Stack spacing={1}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  backgroundColor: '#c8e6c9',
                  color: '#2e7d32',
                }}
              >
                <TrendingUpIcon />
              </Box>
              <Typography variant='body2' color='text.secondary'>
                Monthly Revenue
              </Typography>
              <Typography variant='h5' fontWeight={700}>
                ${Number(
                  overview?.subscriptions?.total_fees ?? 0
                ).toLocaleString()}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Stack spacing={1}>
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
                Prize Pool
              </Typography>
              <Typography variant='h5' fontWeight={700}>
                ${Number(
                  overview?.currentDraw?.prize_pool ?? 0
                ).toLocaleString()}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant='h6' fontWeight={700}>
                Revenue Model
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Winnbell operates on a subscription model where each business pays a monthly
                subscription fee. The prize amount for each campaign is set directly by admin
                when creating the campaign, independent of subscription revenue.
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
                <strong>Current Status:</strong> {overview?.subscriptions?.active_subs ?? 0} active
                business subscriptions generating ${Number(overview?.subscriptions?.total_fees ?? 0).toLocaleString()} per month in subscription revenue.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default RevenueTab;

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography, Button, Paper, Stack, CircularProgress, Chip } from '@mui/material';
import { CheckCircle, Storefront, ErrorOutline, WorkspacePremium } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useAppDispatch } from '../../../store/hook';
import { setBusinessActive } from '../../../store/slices/authSlice';
import { api } from '../../../shared/api/client';
import { queryKeys } from '../../../shared/constants/queryKeys';
import { MOBILE_CONTENT_HEIGHT } from '../../../shared/colors';
import { fetchSubscription } from '../api/subscription.api';

const SubscriptionSuccessPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  // 'upm' = returning from an update-payment-method setup session (existing subscriber
  // fixing a card), not a new subscription purchase.
  const isPaymentUpdate = searchParams.get('purpose') === 'upm';

  const { isPending: verifying, isSuccess, isError, error: verifyError } = useQuery({
    queryKey: [...queryKeys.subscription.all, 'verify-session', sessionId],
    queryFn: () => api.post('/business/subscription/verify-session', { sessionId }).then(r => r.data),
    enabled: !!sessionId,
    retry: false,
    staleTime: Infinity,
  });
  // Sold-out founding purchase: the payment was already refunded in full server-side.
  const soldOutRefunded = isAxiosError(verifyError)
    && (verifyError.response?.data as { code?: string } | undefined)?.code === 'FOUNDING_SOLD_OUT_REFUNDED';

  // Fetch subscription details after verification to get founding member info
  const { data: sub } = useQuery({
    queryKey: [...queryKeys.subscription.all, 'details-post-success'],
    queryFn: fetchSubscription,
    enabled: isSuccess,
    staleTime: Infinity,
    retry: false,
  });

  useEffect(() => {
    if (isSuccess) dispatch(setBusinessActive());
  }, [isSuccess, dispatch]);

  if (!sessionId) {
    return (
      <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: '100dvh' }, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 3 }}>
        <Paper elevation={0} sx={{ p: 5, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center', maxWidth: 420, width: '100%' }}>
          <Stack spacing={3} alignItems='center'>
            <ErrorOutline sx={{ fontSize: 72, color: 'warning.main' }} />
            <Typography variant='h5' fontWeight={900}>Invalid session</Typography>
            <Typography variant='body1' color='text.secondary'>No payment session found. Please try subscribing again.</Typography>
            <Button variant='contained' onClick={() => navigate('/partner/subscription')} sx={{ textTransform: 'none', fontWeight: 700 }}>
              Go to Subscription
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  if (verifying) {
    return (
      <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: '100dvh' }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack alignItems='center' spacing={2}>
          <CircularProgress />
          <Typography color='text.secondary' fontWeight={600}>
            {isPaymentUpdate ? 'Updating your payment method...' : 'Activating your business...'}
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (isPaymentUpdate && isSuccess) {
    return (
      <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: '100dvh' }, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Paper elevation={0} sx={{ p: 5, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center', maxWidth: 440, width: '100%' }}>
          <Stack spacing={3} alignItems='center'>
            <CheckCircle sx={{ fontSize: 72, color: 'success.main' }} />
            <Box>
              <Typography variant='h4' fontWeight={900} mb={1}>Payment method updated</Typography>
              <Typography variant='body1' color='text.secondary' lineHeight={1.7}>
                Your new card is saved and will be used for all future charges.
                If you had an outstanding balance, we retried it with the new card right away.
              </Typography>
            </Box>
            <Button
              variant='contained' size='large'
              onClick={() => navigate('/subscription/manage')}
              sx={{ py: 1.75, px: 4, fontWeight: 800 }}
            >
              Back to Campaign Management
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: '100dvh' }, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 3 }}>
        <Paper elevation={0} sx={{ p: 5, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center', maxWidth: 420, width: '100%' }}>
          <Stack spacing={3} alignItems='center'>
            <ErrorOutline sx={{ fontSize: 72, color: 'warning.main' }} />
            {soldOutRefunded ? (
              <Box>
                <Typography variant='h5' fontWeight={900} mb={1}>Founding spots sold out</Typography>
                <Typography variant='body1' color='text.secondary' lineHeight={1.7}>
                  The last founding partner spots were claimed while your payment was processing.
                  Your payment has been <strong>refunded in full</strong> - there is nothing you need to do.
                  You can still start a regular plan any time.
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography variant='h5' fontWeight={900} mb={1}>Payment received</Typography>
                <Typography variant='body1' color='text.secondary' lineHeight={1.7}>
                  Your payment was processed but we could not confirm your campaign enrollment automatically.
                  Please contact support and we will activate your account manually.
                </Typography>
              </Box>
            )}
            <Button
              variant='outlined' size='large'
              onClick={() => navigate(soldOutRefunded ? '/subscribe' : '/nearby')}
              sx={{ py: 1.75, px: 4, fontWeight: 800 }}
            >
              {soldOutRefunded ? 'See regular plans' : 'Go to Dashboard'}
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  const isFoundingMember = sub?.is_founding ?? false;

  return (
    <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: '100dvh' }, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <Paper elevation={0} sx={{ p: 5, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center', maxWidth: 440, width: '100%' }}>
        <Stack spacing={3} alignItems='center'>
          <CheckCircle sx={{ fontSize: 72, color: 'success.main' }} />

          <AnimatePresence mode='wait'>
            {isFoundingMember ? (
              <motion.div
                key='founding'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.32, ease: 'easeOut' }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
              >
                <Chip
                  icon={<WorkspacePremium sx={{ fontSize: '16px !important', color: '#f59e0b !important' }} />}
                  label="Founding Partner"
                  sx={{ fontWeight: 800, bgcolor: 'rgba(245,158,11,0.12)', color: '#b45309', border: '1px solid rgba(245,158,11,0.3)' }}
                />
                <Box>
                  <Typography variant='h4' fontWeight={900} mb={1}>Welcome, Founding Partner!</Typography>
                  <Typography variant='body1' color='text.secondary' lineHeight={1.7}>
                    You're a Founding Partner for the full year. Your business joins each monthly campaign and appears on the Winnbell map as soon as the next campaign opens.
                  </Typography>
                </Box>
              </motion.div>
            ) : (
              <motion.div
                key='regular'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.32, ease: 'easeOut' }}
              >
                <Box>
                  <Typography variant='h4' fontWeight={900} mb={1}>You're all set!</Typography>
                  <Typography variant='body1' color='text.secondary' lineHeight={1.7}>
                    Your subscription is active. Your business joins the next campaign and appears on the Winnbell map as soon as it opens.
                  </Typography>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            variant='contained' size='large'
            startIcon={<Storefront />}
            onClick={() => navigate('/nearby')}
            sx={{ py: 1.75, px: 4, fontWeight: 800 }}
          >
            Go to Dashboard
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default SubscriptionSuccessPage;

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography, Button, Paper, Stack, CircularProgress, Chip } from '@mui/material';
import { CheckCircle, Storefront, ErrorOutline, WorkspacePremium, ReceiptLongOutlined, LocalAtmOutlined, CreditCardOutlined } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useAppDispatch } from '../../../store/hook';
import { setBusinessActive } from '../../../store/slices/authSlice';
import { api } from '../../../shared/api/client';
import { queryKeys } from '../../../shared/constants/queryKeys';
import { MOBILE_CONTENT_HEIGHT } from '../../../shared/colors';
import { isStripeCheckoutUrl } from '../../../shared/utils/url';
import { fetchSubscription, updatePaymentMethodApi } from '../api/subscription.api';

const SubscriptionSuccessPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  // 'upm' = returning from an update-payment-method setup session (existing subscriber
  // fixing a card), not a new subscription purchase.
  const isPaymentUpdate = searchParams.get('purpose') === 'upm';

  // Verify-session is a side-effecting POST (not a GET), so useMutation is the correct primitive.
  // The ref guard prevents double-fire across re-renders of ONE component instance.
  // StrictMode remounts reset refs, so dev fires twice - fine: verify-session is idempotent server-side.
  const verifyFiredRef = useRef(false);
  const {
    mutate: runVerify,
    isPending: verifying,
    isSuccess,
    isError,
    error: verifyError,
    data: verifyData,
  } = useMutation({
    mutationFn: () =>
      api.post('/business/subscription/verify-session', { sessionId })
        .then(r => r.data as { activated: boolean; subscriptionStatus: 'Active' | 'Incomplete' | null }),
    // 'Incomplete' = the in-window signup charge was declined: the subscription exists but
    // the business is NOT enrolled until the card is fixed, so do not flag it active.
    onSuccess: (data) => {
      if (data?.subscriptionStatus !== 'Incomplete') dispatch(setBusinessActive());
    },
  });
  const paymentDeclined = isSuccess && verifyData?.subscriptionStatus === 'Incomplete';

  // Card fix for the declined-signup state: same setup-session flow the manage page uses.
  // The URL guard lives in mutationFn so a bad value rejects the mutation (surfaced below)
  // instead of throwing inside onSuccess.
  const { mutate: goUpdateCard, isPending: updatingCard, isError: updateCardFailed } = useMutation({
    mutationFn: async () => {
      const { url } = await updatePaymentMethodApi();
      if (!isStripeCheckoutUrl(url)) throw new Error('Invalid checkout URL');
      return url;
    },
    onSuccess: (url) => { window.location.href = url; },
  });

  useEffect(() => {
    if (!sessionId || verifyFiredRef.current) return;
    verifyFiredRef.current = true;
    runVerify();
  // runVerify is stable (useMutation guarantees this); sessionId is constant per page load
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  if (!sessionId) {
    return (
      <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: 'var(--dvh100, 100dvh)' }, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 3 }}>
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

  // Spinner until the verify call SETTLES - not just while it is in flight. On the first
  // render the mutation has not fired yet (the effect runs after paint), so gating only on
  // isPending lets the celebration below flash for a frame before verification even starts.
  if (verifying || (!isSuccess && !isError)) {
    return (
      <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: 'var(--dvh100, 100dvh)' }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
      <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: 'var(--dvh100, 100dvh)' }, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
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
      <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: 'var(--dvh100, 100dvh)' }, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 3 }}>
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

  // In-window signup charge declined: subscription stored Incomplete, business NOT enrolled
  // at open. Tell the truth instead of celebrating; the payment-failed email says the same.
  if (paymentDeclined) {
    return (
      <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: 'var(--dvh100, 100dvh)' }, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 3 }}>
        <Paper elevation={0} sx={{ p: 5, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center', maxWidth: 440, width: '100%' }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
          >
            <Stack spacing={3} alignItems='center'>
              <ErrorOutline sx={{ fontSize: 72, color: 'warning.main' }} />
              <Box>
                <Typography variant='h4' fontWeight={900} mb={1}>Your card was declined</Typography>
                <Typography variant='body1' color='text.secondary' lineHeight={1.7}>
                  Your subscription was created, but the payment for the upcoming campaign did not go through.
                  Update your payment method to join the next campaign. Your spot is saved and activates the moment the payment succeeds.
                </Typography>
              </Box>
              <Button
                variant='contained' size='large'
                startIcon={<CreditCardOutlined />}
                disabled={updatingCard}
                onClick={() => goUpdateCard()}
                sx={{ py: 1.75, px: 4, fontWeight: 800 }}
              >
                {updatingCard ? 'Opening secure checkout...' : 'Update payment method'}
              </Button>
              {updateCardFailed && (
                <Typography variant='body2' color='error.main' fontWeight={600}>
                  Could not open the payment page. Please try again.
                </Typography>
              )}
              <Button
                variant='text'
                onClick={() => navigate('/subscription/manage')}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Go to Campaign Management
              </Button>
            </Stack>
          </motion.div>
        </Paper>
      </Box>
    );
  }

  const isFoundingMember = sub?.is_founding ?? false;

  return (
    <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: 'var(--dvh100, 100dvh)' }, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
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

          {/* Post-payment setup: the subscribe flow no longer collects these up front.
              Both live in the Business Hub and stay editable at any time. */}
          <Box sx={{ width: '100%', textAlign: 'left', bgcolor: 'action.hover', borderRadius: 2, p: 2 }}>
            <Typography variant='caption' fontWeight={800} color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', mb: 1.25 }}>
              Finish your campaign setup
            </Typography>
            <Stack spacing={1.25}>
              <Stack direction='row' spacing={1.25} alignItems='flex-start'>
                <LocalAtmOutlined sx={{ fontSize: 20, color: 'primary.main', mt: '1px', flexShrink: 0 }} />
                <Typography variant='body2' color='text.secondary' lineHeight={1.5}>
                  <strong>Set your minimum spend per receipt.</strong> It starts at $20 - adjust it to fit your store.
                </Typography>
              </Stack>
              <Stack direction='row' spacing={1.25} alignItems='flex-start'>
                <ReceiptLongOutlined sx={{ fontSize: 20, color: 'primary.main', mt: '1px', flexShrink: 0 }} />
                <Typography variant='body2' color='text.secondary' lineHeight={1.5}>
                  <strong>Add a receipt example.</strong> Show customers where to find the receipt number.
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <Button
            variant='contained' size='large'
            startIcon={<Storefront />}
            onClick={() => navigate('/nearby')}
            sx={{ py: 1.75, px: 4, fontWeight: 800 }}
          >
            Finish setup in Business Hub
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default SubscriptionSuccessPage;

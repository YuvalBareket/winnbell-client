import { useState } from 'react';
import {
  Box, Typography, Paper, Stack, Chip, Button, Divider, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Alert,
  IconButton, Container,
} from '@mui/material';
import {
  ReceiptLong, CheckCircle, Cancel, EmojiEvents, ArrowBackIosNew,
  Lock, LockOpen,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PRIMARY_MAIN, BG_PAGE, GRADIENT_HERO, ALPHA_WHITE_15 } from '../../../shared/colors';
import { useSubscription } from '../hooks/useSubscription';
import { useCancelSubscription } from '../hooks/useCancelSubscription';
import { useResumeSubscription } from '../hooks/useResumeSubscription';

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  Active:    { bg: 'rgba(46,125,50,0.1)',   color: '#2e7d32' },
  Trialing:  { bg: 'rgba(25,118,210,0.1)',  color: '#1976d2' },
  Past_Due:  { bg: 'rgba(237,108,2,0.1)',   color: '#ed6c02' },
  Cancelled: { bg: 'rgba(211,47,47,0.1)',   color: '#d32f2f' },
};

export default function SubscriptionManagementPage() {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [cancelResult, setCancelResult] = useState<{ removedFromDraw: boolean; refundType: 'full' | 'partial_40' | 'none'; refundAmount: number } | null>(null);

  const { data: sub, isLoading, isError } = useSubscription();

  const { mutate: doCancel, isPending: cancelling } = useCancelSubscription({
    onSuccess: (data) => {
      setCancelResult(data);
      setConfirmOpen(false);
    },
    onError: (err) => {
      setCancelError(err.response?.data?.error ?? 'Cancellation failed. Please try again.');
      setConfirmOpen(false);
    },
  });

  const { mutate: doResume, isPending: resuming } = useResumeSubscription({
    onSuccess: () => {
      setCancelResult(null);
    },
    onError: (err) => {
      setCancelError(err.response?.data?.error ?? 'Could not resume subscription. Please try again.');
    },
  });

  const isDrawLocked = (() => {
    if (!sub?.draw_date) return false;
    const drawDate = new Date(sub.draw_date);
    const cutoffDate = new Date(drawDate);
    cutoffDate.setDate(cutoffDate.getDate() - 7);
    return new Date() >= cutoffDate || sub.draw_status !== 'Upcoming';
  })();

  const periodEndLabel = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const drawDateLabel = sub?.draw_date
    ? new Date(sub.draw_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const cancelDeadline = (() => {
    if (!sub?.draw_date) return null;
    const drawDate = new Date(sub.draw_date);
    const cutoffDate = new Date(drawDate);
    cutoffDate.setDate(cutoffDate.getDate() - 7);
    return cutoffDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  })();

  const cancellationRefundPreview = (() => {
    if (!sub?.draw_date || sub.draw_status !== 'Upcoming') return 'none';
    const drawDate = new Date(sub.draw_date);
    const cutoffDate = new Date(drawDate);
    cutoffDate.setDate(cutoffDate.getDate() - 7);
    const now = new Date();
    if (now < cutoffDate) return 'full';
    if (now < drawDate) return 'partial_40';
    return 'none';
  })();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !sub) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', pt: 10 }}>
        <Typography color='error' fontWeight={700}>No subscription found.</Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/subscribe')}>Subscribe Now</Button>
      </Box>
    );
  }

  const statusColors = STATUS_COLOR[sub.status] ?? { bg: 'action.hover', color: 'text.secondary' };
  const canCancel = sub.status !== 'Cancelled' && !sub.cancel_at_period_end;

  return (
    <Box sx={{ bgcolor: BG_PAGE, minHeight: '100vh', pb: { xs: 10, md: 6 } }}>
      {/* Hero Header */}
      <Box
        sx={{
          background: GRADIENT_HERO,
          pt: 3,
          pb: 6,
          px: 3,
          color: 'white',
          borderRadius: '0 0 32px 32px',
        }}
      >
        <Container maxWidth='lg'>
          <Stack direction='row' alignItems='center' spacing={2}>
            <IconButton
              onClick={() => navigate(-1)}
              size='small'
              sx={{ color: 'white', '&:hover': { bgcolor: ALPHA_WHITE_15 }, borderRadius: 2, width: 44, height: 44 }}
            >
              <ArrowBackIosNew fontSize='small' />
            </IconButton>
            <Box>
              <Typography variant='caption' fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.9 }}>
                Manage Account
              </Typography>
              <Typography variant='h5' fontWeight={800}>Your Subscription</Typography>
            </Box>
          </Stack>
        </Container>
        
      </Box>

      <Container maxWidth='lg' sx={{ mt: -3 }}>
        {/* Alerts */}

        {cancelResult && (
          <Alert
            severity={cancelResult.refundType === 'full' ? 'success' : cancelResult.refundType === 'partial_40' ? 'warning' : 'info'}
            icon={<Cancel />}
            sx={{ mb: 3, borderRadius: 3 }}
            onClose={() => setCancelResult(null)}
          >
            {cancelResult.refundType === 'full' && (
              <>Subscription cancelled. You've been removed from the draw and a <strong>full refund of ${cancelResult.refundAmount.toFixed(2)}</strong> has been issued.</>
            )}
            {cancelResult.refundType === 'partial_40' && (
              <>Subscription cancelled. You've been removed from the draw and a <strong>40% refund of ${cancelResult.refundAmount.toFixed(2)}</strong> has been issued.</>
            )}
            {cancelResult.refundType === 'none' && (
              <>Subscription cancelled. The draw has already commenced — your entry remains and no refund applies.</>
            )}
          </Alert>
        )}

        {cancelError && (
          <Alert severity='error' sx={{ mb: 3, borderRadius: 3 }} onClose={() => setCancelError('')}>
            {cancelError}
          </Alert>
        )}

        {/* Two-column grid on desktop, single column on mobile */}
        <Stack spacing={3}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 3,
              alignItems: 'start',
            }}
          >
            {/* ── Left column: Plan + Actions ── */}
            <Stack spacing={3}>
              {/* Plan card */}
              <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                {/* Card header band */}
                <Box
                  sx={{
                    px: 3, py: 3,
                    background: 'linear-gradient(135deg, rgba(25,93,230,0.08) 0%, rgba(127,166,255,0.1) 100%)',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Stack direction='row' alignItems='center' spacing={2} mb={2}>
                    <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ReceiptLong sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Box flex={1}>
                      <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Current Plan
                      </Typography>
                      <Typography variant='h6' fontWeight={800} lineHeight={1.2}>Partner Monthly Plan</Typography>
                    </Box>
                  </Stack>
                  <Chip
                    label={sub.cancel_at_period_end ? 'Cancels Soon' : sub.status}
                    size='small'
                    sx={{
                      fontWeight: 700,
                      bgcolor: sub.cancel_at_period_end ? 'rgba(237,108,2,0.1)' : statusColors.bg,
                      color: sub.cancel_at_period_end ? '#ed6c02' : statusColors.color,
                    }}
                  />
                </Box>

                {/* Plan details */}
                <Box sx={{ px: 3, py: 3 }}>
                  <Stack spacing={2}>
                    {periodEndLabel && (
                      <Box>
                        <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.5 }}>
                          {sub.cancel_at_period_end ? 'Cancels on' : 'Renews on'}
                        </Typography>
                        <Typography variant='h6' fontWeight={800} color='text.primary'>{periodEndLabel}</Typography>
                        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.5 }}>
                          {sub.cancel_at_period_end ? 'Your access continues until this date — no further charges' : 'Your next payment will be charged on this date'}
                        </Typography>
                      </Box>
                    )}
                  </Stack>

                  {sub.cancel_at_period_end && (
                    <Alert severity='warning' sx={{ mt: 2.5, borderRadius: 2 }}>
                      Your plan is still fully active and will continue until <strong>{periodEndLabel}</strong>. It just will not renew after that.
                    </Alert>
                  )}
                </Box>
              </Paper>

              {/* Action buttons */}
              <Stack spacing={2}>
                {canCancel && (
                  <Button
                    fullWidth
                    variant='outlined'
                    color='error'
                    size='large'
                    startIcon={<Cancel />}
                    onClick={() => setConfirmOpen(true)}
                    sx={{ borderRadius: 3, fontWeight: 700, py: 1.75 }}
                  >
                    Cancel my subscription
                  </Button>
                )}

                {sub.cancel_at_period_end && sub.status !== 'Cancelled' && (
                  <Button
                    fullWidth
                    variant='contained'
                    color='primary'
                    size='large'
                    startIcon={resuming ? undefined : <CheckCircle />}
                    onClick={() => doResume()}
                    disabled={resuming}
                    sx={{ borderRadius: 3, fontWeight: 700, py: 1.75 }}
                  >
                    {resuming ? <CircularProgress size={22} color='inherit' /> : 'Resume Subscription'}
                  </Button>
                )}
              </Stack>
            </Stack>

            {/* ── Right column: Draw entry ── */}
            {sub.draw_id ? (
              <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                {/* Card header band */}
                <Box
                  sx={{
                    px: 3, py: 3,
                    background: `linear-gradient(135deg, ${PRIMARY_MAIN}08 0%, ${PRIMARY_MAIN}12 100%)`,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Stack direction='row' alignItems='center' spacing={2} mb={2}>
                    <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: `${PRIMARY_MAIN}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <EmojiEvents sx={{ color: PRIMARY_MAIN, fontSize: 24 }} />
                    </Box>
                    <Box flex={1}>
                      <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Next Draw
                      </Typography>
                      <Typography variant='h6' fontWeight={800} lineHeight={1.2}>{sub.draw_name}</Typography>
                    </Box>
                  </Stack>
                  <Chip
                    icon={isDrawLocked ? <Lock sx={{ fontSize: '14px !important' }} /> : <LockOpen sx={{ fontSize: '14px !important' }} />}
                    label={isDrawLocked ? 'Your spot is locked in' : 'Can still cancel entry'}
                    size='small'
                    sx={{
                      fontWeight: 700,
                      bgcolor: 'rgba(46,125,50,0.08)',
                      color: 'success.main',
                    }}
                  />
                </Box>

                {/* Draw details */}
                <Box sx={{ px: 3, py: 3 }}>
                  <Stack spacing={2} mb={2.5}>
                    <Box>
                      <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.5 }}>
                        Draw date
                      </Typography>
                      <Typography variant='body2' fontWeight={700}>{drawDateLabel}</Typography>
                    </Box>
                    <Divider sx={{ my: 0 }} />
                    <Box>
                      <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.75 }}>
                        Current prize pool
                      </Typography>
                      <Typography variant='h5' fontWeight={900} color='primary.main' sx={{ fontSize: { xs: '1.75rem', md: '2rem' } }}>
                        ${Number(sub?.prize_amount ?? 0).toFixed(2)}
                      </Typography>
                    </Box>
                  </Stack>

                  {isDrawLocked && (
                    <Alert severity='success' icon={<Lock />} sx={{ borderRadius: 2 }}>
                      Your entry is confirmed. You are in this draw.
                    </Alert>
                  )}
                </Box>
              </Paper>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 4, borderRadius: 3, border: '1px dashed', borderColor: 'divider',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  minHeight: 280, textAlign: 'center',
                }}
              >
                <EmojiEvents sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography variant='body1' fontWeight={700} color='text.secondary'>No upcoming draw</Typography>
                <Typography variant='body2' color='text.disabled' sx={{ mt: 1 }}>
                  You are not enrolled in any upcoming draw yet.
                </Typography>
              </Paper>
            )}
          </Box>
        </Stack>
      </Container>

      {/* Confirm dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Are you sure you want to cancel?</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5}>
            {cancellationRefundPreview === 'full' && (
              <>
                <DialogContentText>
                  You'll be removed from the upcoming draw and your full payment will be refunded. Your subscription ends immediately.
                </DialogContentText>
                <Alert severity='info' icon={<LockOpen />} sx={{ borderRadius: 2, mt: 1.5 }}>
                  You can cancel and get a full refund until <strong>{cancelDeadline}</strong>. After that, only a 40% refund applies.
                </Alert>
              </>
            )}
            {cancellationRefundPreview === 'partial_40' && (
              <DialogContentText>
                The free cancellation window has passed. You'll be removed from the draw, but only 40% of your payment will be refunded. 60% stays in the prize pool.
              </DialogContentText>
            )}
            {cancellationRefundPreview === 'none' && (
              <>
                <DialogContentText>
                  The draw has already started — your entry is locked in and no refund is available. Cancelling now only stops future monthly charges. Your plan stays active until <strong>{periodEndLabel}</strong>.
                </DialogContentText>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} variant='outlined' sx={{ borderRadius: 2, fontWeight: 700 }}>
            Keep Subscription
          </Button>
          <Button
            onClick={() => doCancel()}
            color='error'
            variant='contained'
            disabled={cancelling}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            {cancelling ? <CircularProgress size={20} color='inherit' /> : 'Yes, Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

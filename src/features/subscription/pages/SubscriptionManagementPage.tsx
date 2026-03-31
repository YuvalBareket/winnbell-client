import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { api } from '../../../shared/api/client';
import { PRIMARY_MAIN, BG_PAGE, GRADIENT_HERO, ALPHA_WHITE_15 } from '../../../shared/colors';

interface SubscriptionDetails {
  id: number;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_subscription_id: string;
  draw_id: number | null;
  draw_name: string | null;
  draw_date: string | null;
  draw_status: string | null;
  prize_amount: number | null;
}

const fetchSubscription = async (): Promise<SubscriptionDetails> => {
  const { data } = await api.get('/business/subscription');
  return data;
};

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  Active:    { bg: 'rgba(46,125,50,0.1)',   color: '#2e7d32' },
  Trialing:  { bg: 'rgba(25,118,210,0.1)',  color: '#1976d2' },
  Past_Due:  { bg: 'rgba(237,108,2,0.1)',   color: '#ed6c02' },
  Cancelled: { bg: 'rgba(211,47,47,0.1)',   color: '#d32f2f' },
};

export default function SubscriptionManagementPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [cancelResult, setCancelResult] = useState<{ removedFromDraw: boolean } | null>(null);

  const { data: sub, isLoading, isError } = useQuery({
    queryKey: ['subscription'],
    queryFn: fetchSubscription,
  });

  const { mutate: doCancel, isPending: cancelling } = useMutation({
    mutationFn: () => api.post('/business/subscription/cancel').then(r => r.data),
    onSuccess: (data) => {
      setCancelResult(data);
      setConfirmOpen(false);
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['myBusiness'] });
    },
    onError: (err: any) => {
      setCancelError(err.response?.data?.error ?? 'Cancellation failed. Please try again.');
      setConfirmOpen(false);
    },
  });

  const { mutate: doResume, isPending: resuming } = useMutation({
    mutationFn: () => api.post('/business/subscription/resume').then(r => r.data),
    onSuccess: () => {
      setCancelResult(null);
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['myBusiness'] });
    },
    onError: (err: any) => {
      setCancelError(err.response?.data?.error ?? 'Could not resume subscription. Please try again.');
    },
  });

  const isDrawLocked = (() => {
    if (!sub?.draw_date) return false;
    const drawDate = new Date(sub.draw_date);
    const lockDate = new Date(drawDate.getFullYear(), drawDate.getMonth(), 1);
    return new Date() >= lockDate || sub.draw_status !== 'Upcoming';
  })();

  const periodEndLabel = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const drawDateLabel = sub?.draw_date
    ? new Date(sub.draw_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const cancelDeadline = (() => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return lastDay.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
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
            severity='info'
            icon={<Cancel />}
            sx={{ mb: 3, borderRadius: 3 }}
            onClose={() => setCancelResult(null)}
          >
            {cancelResult.removedFromDraw
              ? 'Done! Your subscription has been cancelled. Your entry fee has been returned to the prize pool and you have been removed from the upcoming draw.'
              : "Done! Your subscription has been cancelled. Your spot in this month's draw is still secured and your plan stays active until the end of the current period."}
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
                      </Box>
                    )}
                    <Box>
                      <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.5 }}>
                        Cancel deadline
                      </Typography>
                      <Typography variant='body2' fontWeight={700}>{cancelDeadline}</Typography>
                    </Box>
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
                    Cancel Subscription
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
                    label={isDrawLocked ? 'Spot secured' : 'Flexible'}
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
                        ${sub.prize_amount?.toFixed(2)}
                      </Typography>
                    </Box>
                  </Stack>

                  {isDrawLocked ? (
                    <Alert severity='success' icon={<Lock />} sx={{ borderRadius: 2 }}>
                      Your entry is confirmed. You are in this draw.
                    </Alert>
                  ) : (
                    <Alert severity='info' icon={<LockOpen />} sx={{ borderRadius: 2 }}>
                      Entries are open until <strong>{cancelDeadline}</strong>.
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
            {isDrawLocked ? (
              <>
                <DialogContentText>
                  Your plan will stay active until <strong>{periodEndLabel}</strong> and then end. You will not be charged again.
                </DialogContentText>
                <DialogContentText>
                  You are already entered in this month's draw and that will not change. After your plan ends you will not be added to future draws.
                </DialogContentText>
              </>
            ) : (
              <>
                <DialogContentText>
                  Your plan will stay active until <strong>{periodEndLabel}</strong> and then end. You will not be charged again.
                </DialogContentText>
                <DialogContentText>
                  Since the draw has not started yet, your entry will also be removed and your fee will be returned to the prize pool.
                </DialogContentText>
                {sub.draw_id && (
                  <Alert severity='warning' sx={{ borderRadius: 2 }}>
                    The draw closes on <strong>{cancelDeadline}</strong>. After that date your entry is confirmed and cannot be removed.
                  </Alert>
                )}
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

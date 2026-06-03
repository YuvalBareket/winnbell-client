import { useState } from 'react';
import {
  Box, Typography, Paper, Stack, Chip, Button, Divider, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Alert,
  IconButton, Container, Skeleton,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import AppHeader from '../../../shared/components/AppHeader';
import AppMenuDrawer from '../../../shared/components/AppMenuDrawer';
import {
  ReceiptLong, CheckCircle, Cancel, EmojiEvents, ArrowBackIosNew,
  Lock, LockOpen, WorkspacePremium, Edit, Add as AddIcon, Remove as RemoveIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PRIMARY_MAIN, GRADIENT_HERO, ALPHA_WHITE_15, MOBILE_CONTENT_HEIGHT } from '../../../shared/colors';
import { useSubscription, useUpdateSubscriptionPlan, useSubscriptionInvoices } from '../hooks/useSubscription';
import { useCancelSubscription } from '../hooks/useCancelSubscription';
import { useResumeSubscription } from '../hooks/useResumeSubscription';
import { TIER_KEYS } from './components/subscribeTiers';

const TIER_PRICE_MAP_CLIENT: Record<number, { monthly: { pricePerLocation: number }; yearly: { pricePerLocation: number } }> = {
  250:  { monthly: { pricePerLocation: 250   }, yearly: { pricePerLocation: 3000  } },
  500:  { monthly: { pricePerLocation: 490   }, yearly: { pricePerLocation: 5880  } },
  750:  { monthly: { pricePerLocation: 720   }, yearly: { pricePerLocation: 8640  } },
  1000: { monthly: { pricePerLocation: 940   }, yearly: { pricePerLocation: 11280 } },
  1250: { monthly: { pricePerLocation: 1150  }, yearly: { pricePerLocation: 13800 } },
  1500: { monthly: { pricePerLocation: 1350  }, yearly: { pricePerLocation: 16200 } },
  1750: { monthly: { pricePerLocation: 1540  }, yearly: { pricePerLocation: 18480 } },
  2000: { monthly: { pricePerLocation: 1720  }, yearly: { pricePerLocation: 20640 } },
  2250: { monthly: { pricePerLocation: 1890  }, yearly: { pricePerLocation: 22680 } },
  2500: { monthly: { pricePerLocation: 2000  }, yearly: { pricePerLocation: 24000 } },
};

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  Active:    { bg: 'rgba(46,125,50,0.1)',   color: '#2e7d32' },
  Trialing:  { bg: 'rgba(25,118,210,0.1)',  color: '#1976d2' },
  Past_Due:  { bg: 'rgba(237,108,2,0.1)',   color: '#ed6c02' },
  Cancelled: { bg: 'rgba(211,47,47,0.1)',   color: '#d32f2f' },
};

export default function SubscriptionManagementPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [cancelResult, setCancelResult] = useState<{ removedFromDraw: boolean; refundType: 'full' | 'prorated' | 'none'; refundAmount: number } | null>(null);
  const [editPlanOpen, setEditPlanOpen] = useState(false);
  const [newTier, setNewTier] = useState<number>(0);
  const [updateError, setUpdateError] = useState('');

  const { data: sub, isLoading, isError } = useSubscription();
  const { data: invoices, isLoading: invoicesLoading } = useSubscriptionInvoices();

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

  const { mutate: doUpdatePlan, isPending: updatingPlan } = useUpdateSubscriptionPlan();

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

  // Founding: 50% of remaining time; regular: no refund
  const foundingRefundEstimate = (() => {
    if (!sub?.is_founding || !sub.current_period_end) return 0;
    const now = new Date();
    const periodEnd = new Date(sub.current_period_end);
    const createdAt = new Date(sub.current_period_end);
    createdAt.setFullYear(createdAt.getFullYear() - 1);
    const totalMs = periodEnd.getTime() - createdAt.getTime();
    const remainingMs = Math.max(0, periodEnd.getTime() - now.getTime());
    const fraction = totalMs > 0 ? remainingMs / totalMs : 0;
    return Math.round(1200 * fraction * 0.5 * 100) / 100;
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
        <Typography color='error' fontWeight={700}>No active campaign found.</Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/subscribe')}>Start a Campaign</Button>
      </Box>
    );
  }

  const statusColors = STATUS_COLOR[sub.status] ?? { bg: 'action.hover', color: 'text.secondary' };
  const canCancel = sub.status !== 'Cancelled' && !sub.cancel_at_period_end;

  return (
    <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: '100dvh' }, pb: { xs: 10, md: 6 } }}>
      <AppMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Hero Header */}
      <Box
        sx={{
          background: GRADIENT_HERO,
          pt: { xs: 0, md: 3 },
          pb: 6,
          px: 3,
          color: 'white',
          borderRadius: '0 0 32px 32px',
        }}
      >
        <AppHeader onMenuOpen={() => setMenuOpen(true)} onGradient />
        <Container maxWidth='lg' sx={{ pt: { xs: 1, md: 0 } }}>
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
              <Typography variant='h5' fontWeight={800}>Campaign Management</Typography>
            </Box>
          </Stack>
        </Container>
        
      </Box>

      <Container maxWidth='lg' sx={{ mt: -3 }}>
        {/* Alerts */}

        {cancelResult && (
          <Alert
            severity={cancelResult.refundType === 'none' ? 'info' : 'success'}
            icon={<Cancel />}
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setCancelResult(null)}
          >
            {cancelResult.refundType !== 'none' ? (
              <>Founding membership cancelled. You have been removed from upcoming campaigns and a <strong>refund of ${cancelResult.refundAmount.toFixed(2)}</strong> has been issued.</>
            ) : (
              <>Subscription cancelled. You have been removed from the next campaign. Your plan stays active until the end of the current period.</>
            )}
          </Alert>
        )}

        {cancelError && (
          <Alert severity='error' sx={{ mb: 3, borderRadius: 2 }} onClose={() => setCancelError('')}>
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
              <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
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
                    <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: sub.is_founding ? 'rgba(245,158,11,0.15)' : 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {sub.is_founding
                        ? <WorkspacePremium sx={{ color: '#f59e0b', fontSize: 24 }} />
                        : <ReceiptLong sx={{ color: 'white', fontSize: 24 }} />}
                    </Box>
                    <Box flex={1}>
                      <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {sub.is_founding ? 'Founding Partner' : 'Current Plan'}
                      </Typography>
                      <Typography variant='h6' fontWeight={800} lineHeight={1.2}>
                        {sub.is_founding
                          ? 'Founding Partner'
                          : `Partner ${sub.billing_interval === 'yearly' ? 'Yearly' : 'Monthly'} Plan`}
                      </Typography>
                      {sub.fee_at_entry != null && (
                        <Typography variant='body2' fontWeight={700} sx={{ color: PRIMARY_MAIN, mt: 0.5 }}>
                          {sub.is_founding
                            ? `$${Number(sub.fee_at_entry * 12).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} / year`
                            : sub.billing_interval === 'yearly'
                              ? `$${Number(sub.fee_at_entry).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} / month · billed yearly`
                              : `$${Number(sub.fee_at_entry).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} / month`}
                        </Typography>
                      )}
                      {(sub.active_location_count != null || sub.entries_per_location != null) && (
                        <Typography variant='caption' color='text.secondary' sx={{ mt: 0.25 }}>
                          {[
                            sub.active_location_count != null && `${sub.active_location_count} location${sub.active_location_count !== 1 ? 's' : ''}`,
                            sub.entries_per_location != null && `${sub.entries_per_location} entries per location`,
                          ].filter(Boolean).join(' · ')}
                        </Typography>
                      )}
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
                          {sub.is_founding ? 'Membership expires' : sub.cancel_at_period_end ? 'Cancels on' : 'Renews on'}
                        </Typography>
                        <Typography variant='h6' fontWeight={800} color='text.primary'>{periodEndLabel}</Typography>
                        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.5 }}>
                          {sub.is_founding
                            ? 'One-time payment. All 12 monthly campaigns included, no renewal.'
                            : sub.cancel_at_period_end
                              ? 'Your access continues until this date - no further charges'
                              : 'Your next payment will be charged on this date'}
                        </Typography>
                      </Box>
                    )}
                  </Stack>

                  {sub.cancel_at_period_end && (
                    <Alert severity='warning' sx={{ mt: 2.5, borderRadius: 2 }}>
                      Your plan is still fully active and will continue until <strong>{periodEndLabel}</strong>. It just will not renew after that.
                    </Alert>
                  )}
                  <Box>
                    <Button
                      size='small'
                      variant='outlined'
                      startIcon={<Edit />}
                      onClick={() => { setNewTier(sub.entries_per_location ?? 750); setEditPlanOpen(true); setUpdateError(''); }}
                      disabled={sub.is_founding || sub.status === 'Cancelled'}
                      sx={{ fontWeight: 700, textTransform: 'none' }}
                    >
                      Edit Plan
                    </Button>
                  </Box>
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
                    sx={{ borderRadius: 2, fontWeight: 700, py: 1.75 }}
                  >
                    Cancel my subscription
                  </Button>
                )}

                {sub.cancel_at_period_end && sub.status !== 'Cancelled' && !sub.is_founding && (
                  <Button
                    fullWidth
                    variant='contained'
                    color='primary'
                    size='large'
                    startIcon={resuming ? undefined : <CheckCircle />}
                    onClick={() => doResume()}
                    disabled={resuming}
                    sx={{ borderRadius: 2, fontWeight: 700, py: 1.75 }}
                  >
                    {resuming ? <CircularProgress size={22} color='inherit' /> : 'Resume Campaign'}
                  </Button>
                )}

                {sub.status === 'Cancelled' && (
                  <Button
                    fullWidth
                    variant='contained'
                    color='primary'
                    size='large'
                    onClick={() => navigate('/subscribe')}
                    sx={{ borderRadius: 2, fontWeight: 700, py: 1.75 }}
                  >
                    Start a New Plan
                  </Button>
                )}
              </Stack>
            </Stack>

            {/* ── Right column: Draw entry ── */}
            {sub.draw_id ? (
              <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
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
                        Next Campaign
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
                        Campaign date
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
                      Your entry is confirmed. You are in this campaign.
                    </Alert>
                  )}
                </Box>
              </Paper>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 4, borderRadius: 2, border: '1px dashed', borderColor: 'divider',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  minHeight: 280, textAlign: 'center',
                }}
              >
                <EmojiEvents sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography variant='body1' fontWeight={700} color='text.secondary'>No upcoming campaign</Typography>
                <Typography variant='body2' color='text.disabled' sx={{ mt: 1 }}>
                  You are not enrolled in any upcoming campaign yet.
                </Typography>
              </Paper>
            )}
          </Box>

          {/* ── Payment History ── */}
          <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box
              sx={{
                px: 3, py: 3,
                background: 'linear-gradient(135deg, rgba(25,93,230,0.08) 0%, rgba(127,166,255,0.1) 100%)',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack direction='row' alignItems='center' spacing={1.5}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ReceiptLong sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Typography variant='h6' fontWeight={800}>Payment History</Typography>
              </Stack>
            </Box>

            <Box sx={{ px: 3, py: 2 }}>
              {invoicesLoading ? (
                <Stack spacing={2} py={1}>
                  {[0, 1, 2].map(i => (
                    <Skeleton key={i} variant='rounded' height={64} sx={{ borderRadius: 2 }} />
                  ))}
                </Stack>
              ) : (
                <AnimatePresence>
                  {!invoices || invoices.length === 0 ? (
                    <motion.div
                      key='empty'
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Box sx={{ py: 4, textAlign: 'center' }}>
                        <Typography variant='body2' color='text.disabled'>No payments yet</Typography>
                      </Box>
                    </motion.div>
                  ) : (
                    invoices.map((invoice, index) => {
                      const isPaid = invoice.status === 'paid';
                      const dateLabel = new Date(invoice.date * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                      const amount = isPaid ? invoice.amount_paid : invoice.amount_due;

                      return (
                        <motion.div
                          key={invoice.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.04 }}
                        >
                          {index > 0 && <Divider sx={{ my: 0 }} />}
                          <Box sx={{ py: 2 }}>
                            <Stack direction='row' alignItems='flex-start' justifyContent='space-between' spacing={2}>
                              <Box flex={1} minWidth={0}>
                                <Stack direction='row' alignItems='center' spacing={1.5} mb={0.75}>
                                  <Typography variant='body2' color='text.secondary' fontWeight={600} sx={{ minWidth: 72 }}>
                                    {dateLabel}
                                  </Typography>
                                  <Typography variant='body2' fontWeight={800}>
                                    ${amount.toFixed(2)}
                                  </Typography>
                                  <Chip
                                    label={isPaid ? 'Paid' : invoice.status === 'open' ? 'Open' : invoice.status === 'void' ? 'Void' : 'Failed'}
                                    size='small'
                                    sx={{
                                      fontWeight: 700,
                                      fontSize: '0.7rem',
                                      height: 20,
                                      bgcolor: isPaid ? 'rgba(46,125,50,0.1)' : 'rgba(211,47,47,0.1)',
                                      color: isPaid ? 'success.dark' : 'error.main',
                                    }}
                                  />
                                </Stack>
                                {invoice.description.length > 0 && (() => {
                                  const isProration = invoice.description.every(l =>
                                    (l.description ?? '').toLowerCase().includes('unused time') ||
                                    (l.description ?? '').toLowerCase().includes('remaining time')
                                  );
                                  if (isProration) {
                                    return (
                                      <Typography variant='caption' color='text.secondary' sx={{ display: 'block', lineHeight: 1.5 }}>
                                        Mid-cycle plan change — difference charged for the rest of the billing period
                                      </Typography>
                                    );
                                  }
                                  return (
                                    <Stack spacing={0.25} pl={0.25}>
                                      {invoice.description.map((line, li) => {
                                        const qty = line.quantity ?? 1;
                                        const label = qty > 1
                                          ? `${qty} location${qty > 1 ? 's' : ''} × $${(line.amount / qty).toFixed(2)}/location`
                                          : (line.description ?? '');
                                        return (
                                          <Typography key={li} variant='caption' color='text.secondary' sx={{ display: 'block', lineHeight: 1.5 }}>
                                            {label}{line.amount !== 0 && <> — <strong>${Math.abs(line.amount).toFixed(2)}</strong></>}
                                          </Typography>
                                        );
                                      })}
                                    </Stack>
                                  );
                                })()}
                              </Box>

                            </Stack>
                          </Box>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              )}
            </Box>
          </Paper>

        </Stack>


      </Container>

      {/* Edit Plan dialog */}
      <Dialog open={editPlanOpen} onClose={() => setEditPlanOpen(false)} fullWidth maxWidth='xs' PaperProps={{ sx: { borderRadius: 2, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Change Plan</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            {/* Tier stepper */}
            <Box>
              <Typography variant='body2' color='text.secondary' mb={2}>
                Entries per location per month
              </Typography>
              <Stack direction='row' alignItems='center' justifyContent='center' spacing={2}>
                <IconButton
                  size='small'
                  disabled={TIER_KEYS.indexOf(newTier) === 0}
                  onClick={() => setNewTier(TIER_KEYS[TIER_KEYS.indexOf(newTier) - 1])}
                  sx={{ width: 44, height: 44, border: '1.5px solid', borderColor: 'divider', borderRadius: 2 }}
                >
                  <RemoveIcon />
                </IconButton>
                <Box sx={{ textAlign: 'center', minWidth: 140 }}>
                  <Typography variant='h5' fontWeight={900}>{newTier.toLocaleString()}</Typography>
                  <Typography variant='caption' color='text.secondary'>entries</Typography>
                </Box>
                <IconButton
                  size='small'
                  disabled={TIER_KEYS.indexOf(newTier) === TIER_KEYS.length - 1}
                  onClick={() => setNewTier(TIER_KEYS[TIER_KEYS.indexOf(newTier) + 1])}
                  sx={{ width: 44, height: 44, border: '1.5px solid', borderColor: 'divider', borderRadius: 2 }}
                >
                  <AddIcon />
                </IconButton>
              </Stack>
            </Box>

            {/* Price breakdown */}
            <Box sx={{ bgcolor: 'rgba(2,146,183,0.05)', borderRadius: 2.5, p: 2.5, border: '1px solid rgba(2,146,183,0.15)' }}>
              <Stack spacing={1.5}>
                <Stack direction='row' justifyContent='space-between'>
                  <Typography variant='body2' color='text.secondary'>Locations</Typography>
                  <Typography variant='body2' fontWeight={700}>{sub.active_location_count ?? 1}</Typography>
                </Stack>
                <Stack direction='row' justifyContent='space-between'>
                  <Typography variant='body2' color='text.secondary'>Price per location</Typography>
                  <Typography variant='body2' fontWeight={700}>
                    ${(TIER_PRICE_MAP_CLIENT[newTier]?.[(sub.billing_interval ?? 'monthly') as 'monthly' | 'yearly']?.pricePerLocation ?? 0).toLocaleString()}
                  </Typography>
                </Stack>
                <Divider />
                <Stack direction='row' justifyContent='space-between' alignItems='center'>
                  <Typography variant='body2' fontWeight={700}>New {(sub.billing_interval ?? 'monthly') === 'yearly' ? 'yearly' : 'monthly'} total</Typography>
                  <Typography variant='h6' fontWeight={900} color='primary.main'>
                    ${((TIER_PRICE_MAP_CLIENT[newTier]?.[(sub.billing_interval ?? 'monthly') as 'monthly' | 'yearly']?.pricePerLocation ?? 0) * (sub.active_location_count ?? 1)).toLocaleString()}
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            {updateError && <Alert severity='error' sx={{ borderRadius: 2 }}>{updateError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditPlanOpen(false)} variant='outlined' sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setUpdateError('');
              doUpdatePlan(newTier, {
                onSuccess: () => setEditPlanOpen(false),
                onError: (err: any) => setUpdateError(err.response?.data?.error ?? 'Failed to update plan'),
              });
            }}
            variant='contained'
            disabled={updatingPlan || newTier === (sub.entries_per_location ?? 0)}
            sx={{ fontWeight: 700 }}
          >
            {updatingPlan ? <CircularProgress size={20} color='inherit' /> : 'Confirm Change'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} PaperProps={{ sx: { borderRadius: 2, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Are you sure you want to cancel?</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5}>
            {sub.is_founding ? (
              <>
                <DialogContentText>
                  Your founding partner membership will be cancelled immediately. You'll be removed from all upcoming campaigns and receive a refund of 50% of your remaining membership time.
                </DialogContentText>
                {foundingRefundEstimate > 0 && (
                  <Alert severity='info' icon={<LockOpen />} sx={{ borderRadius: 2, mt: 1.5 }}>
                    Estimated refund: <strong>${foundingRefundEstimate.toFixed(2)}</strong> (50% of remaining time)
                  </Alert>
                )}
              </>
            ) : (
              <DialogContentText>
                You'll be removed from the next upcoming campaign. No refund is issued - your subscription stays active until <strong>{periodEndLabel}</strong> and will not renew after that.
              </DialogContentText>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} variant='outlined' sx={{ fontWeight: 700 }}>
            Keep {sub.is_founding ? 'Membership' : 'Subscription'}
          </Button>
          <Button
            onClick={() => doCancel()}
            color='error'
            variant='contained'
            disabled={cancelling}
            sx={{ fontWeight: 700 }}
          >
            {cancelling ? <CircularProgress size={20} color='inherit' /> : 'Yes, Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

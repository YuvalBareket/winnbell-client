import { useState } from 'react';
import {
  Box, Typography, Paper, Stack, Chip, Button, Divider, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Alert,
  IconButton, Container, Skeleton,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import AppPageHero from '../../../shared/components/AppPageHero';
import {
  ReceiptLong, CheckCircle, Cancel, EmojiEvents,
  Lock, LockOpen, WorkspacePremium, Edit, Add as AddIcon, Remove as RemoveIcon, SwapHoriz,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PRIMARY_MAIN, MOBILE_CONTENT_HEIGHT } from '../../../shared/colors';
import { useSubscription, useUpdateSubscriptionPlan, useSubscriptionInvoices } from '../hooks/useSubscription';
import { useCancelSubscription } from '../hooks/useCancelSubscription';
import { useResumeSubscription } from '../hooks/useResumeSubscription';
import { TIER_KEYS, TIER_MAP } from './components/subscribeTiers';

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
      <AppPageHero
        title='Campaign Management'
        subtitle='Manage your subscription and campaigns'
        icon={<ReceiptLong sx={{ fontSize: 28 }} />}
      />

      <Container maxWidth='lg' sx={{ mt: { xs: 2, md: 1 } }}>
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
              <>Subscription cancelled. Your plan stays active until {periodEndLabel} and you keep your current campaign. It will not renew after that.</>
            )}
          </Alert>
        )}

        {cancelError && (
          <Alert severity='error' sx={{ mb: 3, borderRadius: 2 }} onClose={() => setCancelError('')}>
            {cancelError}
          </Alert>
        )}

        {/* Expired founding member prompt */}
        <AnimatePresence>
          {sub?.is_founding && sub?.current_period_end && new Date(sub.current_period_end) < new Date() && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              <Paper elevation={0} sx={{ mb: 3, p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'rgba(245,158,11,0.04)' }}>
                <Stack direction='row' alignItems='center' spacing={2} mb={2}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <WorkspacePremium sx={{ color: '#f59e0b', fontSize: 24 }} />
                  </Box>
                  <Box flex={1}>
                    <Typography variant='h6' fontWeight={800}>Your founding year has ended</Typography>
                    <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>Your founding partner year is complete. Start a plan to keep running campaigns.</Typography>
                  </Box>
                </Stack>
                <Box>
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={() => navigate('/subscribe')}
                    sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
                  >
                    Start a new plan
                  </Button>
                </Box>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>

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
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
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
                            {sub.is_founding ? 'Membership expires' : sub.cancel_at_period_end ? 'Cancels on' : 'Next charge on'}
                          </Typography>
                          <Typography variant='h6' fontWeight={800} color='text.primary'>{periodEndLabel}</Typography>
                          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.5 }}>
                            {sub.is_founding
                              ? 'One-time payment. All 12 monthly campaigns included, no renewal.'
                              : sub.cancel_at_period_end
                                ? 'Your access continues until this date - no further charges'
                                : 'Your plan is billed on the last day of each month, so this is your next billing date.'}
                          </Typography>
                        </Box>
                      )}
                    </Stack>

                    {sub.cancel_at_period_end && (
                      <Alert severity='warning' sx={{ mt: 2.5, borderRadius: 2 }}>
                        Your plan is still fully active and will continue until <strong>{periodEndLabel}</strong>. It just will not renew after that.
                      </Alert>
                    )}
                    <Box pt={2}>
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
              </motion.div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
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
              </motion.div>
            </Stack>

            {/* ── Right column: Draw entry ── */}
            {sub.draw_id ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
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
                            {sub.draw_status === 'Open' ? 'Current Campaign' : 'Next Campaign'}
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
              </motion.div>
            ) : sub.status === 'Active' && sub.next_campaign_id ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
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
                          Your Next Campaign
                        </Typography>
                        <Typography variant='h6' fontWeight={800} lineHeight={1.2}>{sub.next_campaign_name}</Typography>
                      </Box>
                    </Stack>
                  </Box>

                  {/* Campaign details */}
                  <Box sx={{ px: 3, py: 3 }}>
                    <Stack spacing={2} mb={2.5}>
                      <Box>
                        <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.5 }}>
                          Campaign date
                        </Typography>
                        <Typography variant='body2' fontWeight={700}>
                          {sub.next_campaign_date
                            ? new Date(sub.next_campaign_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                            : 'TBD'}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 0 }} />
                      <Box>
                        <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.75 }}>
                          Prize pool
                        </Typography>
                        <Typography variant='h5' fontWeight={900} color='primary.main' sx={{ fontSize: { xs: '1.75rem', md: '2rem' } }}>
                          ${Number(sub.next_campaign_prize ?? 0).toFixed(2)}
                        </Typography>
                      </Box>
                    </Stack>

                    <Alert severity='info' icon={<EmojiEvents />} sx={{ borderRadius: 2 }}>
                      When this campaign opens, your business goes live on the Winnbell map and customers can start earning entries from you.
                    </Alert>
                  </Box>
                </Paper>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 4, borderRadius: 2, border: '1px dashed', borderColor: 'divider',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    minHeight: 280, textAlign: 'center',
                  }}
                >
                <EmojiEvents sx={{ fontSize: 48, color: sub.status === 'Active' ? PRIMARY_MAIN : 'text.disabled', mb: 2 }} />
                {sub.status === 'Active' ? (
                  <>
                    <Typography variant='body1' fontWeight={700} color='text.primary'>You are in for the next campaign</Typography>
                    <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                      You are all set. When the next monthly campaign opens, your business goes live on the Winnbell map and customers can start earning entries from you.
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant='body1' fontWeight={700} color='text.secondary'>No upcoming campaign</Typography>
                    <Typography variant='body2' color='text.disabled' sx={{ mt: 1 }}>
                      You are not enrolled in any upcoming campaign yet.
                    </Typography>
                  </>
                )}
                </Paper>
              </motion.div>
            )}
          </Box>

          {/* ── Payment History ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
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
                      const isFounding = invoice.kind === 'founding';
                      const isRefunded = invoice.status === 'void';
                      const dateLabel = new Date(invoice.date * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                      const amount = isPaid ? invoice.amount_paid : invoice.amount_due;

                      const isProrationLine = (l: { description: string | null }) => {
                        const d = (l.description ?? '').toLowerCase();
                        return d.includes('unused time') || d.includes('remaining time');
                      };
                      const subLines = invoice.description.filter(l => !isProrationLine(l));
                      const isChangeEntry = !!invoice.invoice_description || (invoice.description.length > 0 && subLines.length === 0);

                      const changeReason = invoice.invoice_description
                        ?? (isChangeEntry ? 'Plan or location updated' : null);

                      return (
                        <motion.div
                          key={invoice.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.04 }}
                        >
                          {index > 0 && <Divider sx={{ my: 0 }} />}

                          {isChangeEntry ? (
                            /* ── Change log entry ── */
                            <Stack direction='row' alignItems='center' spacing={1.5} sx={{ py: 1.5, pl: 0.5 }}>
                              <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: 'rgba(25,118,210,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <SwapHoriz sx={{ fontSize: 16, color: 'primary.main' }} />
                              </Box>
                              <Box flex={1} minWidth={0}>
                                <Typography variant='caption' fontWeight={700} color='text.primary' sx={{ display: 'block' }}>
                                  {changeReason}
                                </Typography>
                                <Typography variant='caption' color='text.secondary'>
                                  {dateLabel}
                                </Typography>
                              </Box>
                            </Stack>
                          ) : (
                            /* ── Regular monthly payment ── */
                            <Box sx={{ py: 2 }}>
                              <Stack direction='row' alignItems='center' spacing={1.5} mb={0.75}>
                                <Typography variant='body2' color='text.secondary' fontWeight={600}>
                                  {dateLabel}
                                </Typography>
                                <Typography variant='body2' fontWeight={800}>
                                  ${amount.toFixed(2)}
                                </Typography>
                                <Chip
                                  label={isRefunded ? 'Refunded' : isPaid ? 'Paid' : invoice.status === 'open' ? 'Open' : invoice.status === 'void' ? 'Void' : 'Failed'}
                                  size='small'
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: '0.7rem',
                                    height: 20,
                                    bgcolor: isRefunded ? 'rgba(120,120,120,0.12)' : isPaid ? 'rgba(46,125,50,0.1)' : 'rgba(211,47,47,0.1)',
                                    color: isRefunded ? 'text.secondary' : isPaid ? 'success.dark' : 'error.main',
                                  }}
                                />
                              </Stack>
                              {subLines.length > 0 && (
                                <Stack spacing={0.25} pl={0.25}>
                                  {subLines.map((line, li) => {
                                    // Founding payments are one-time annual charges — show the
                                    // server's description verbatim (it carries any refund note)
                                    // instead of synthesizing a per-location monthly breakdown.
                                    if (isFounding) {
                                      return (
                                        <Typography key={li} variant='caption' color='text.secondary' sx={{ display: 'block', lineHeight: 1.5 }}>
                                          {line.description ?? 'Founding Partner'}
                                        </Typography>
                                      );
                                    }
                                    const qty = line.quantity ?? 1;
                                    const pricePerLoc = qty > 0 ? Math.abs(line.amount) / qty : Math.abs(line.amount);
                                    const label = qty > 1
                                      ? `${qty} locations × $${pricePerLoc.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}/location`
                                      : `1 location — $${Math.abs(line.amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}/month`;
                                    return (
                                      <Typography key={li} variant='caption' color='text.secondary' sx={{ display: 'block', lineHeight: 1.5 }}>
                                        {label}
                                      </Typography>
                                    );
                                  })}
                                </Stack>
                              )}
                            </Box>
                          )}
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              )}
            </Box>
            </Paper>
          </motion.div>

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
                    ${(TIER_MAP[newTier] ?? 0).toLocaleString()}
                  </Typography>
                </Stack>
                <Divider />
                <Stack direction='row' justifyContent='space-between' alignItems='center'>
                  <Typography variant='body2' fontWeight={700}>New monthly total</Typography>
                  <Typography variant='h6' fontWeight={900} color='primary.main'>
                    ${((TIER_MAP[newTier] ?? 0) * (sub.active_location_count ?? 1)).toLocaleString()}
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
            ) : sub.draw_id ? (
              <DialogContentText>
                Your plan stays active until <strong>{periodEndLabel}</strong>. You keep your spot in your current campaign, but your plan will not renew and you will not be entered into campaigns after that. No refund is issued.
              </DialogContentText>
            ) : (
              <DialogContentText>
                Cancelling will stop your subscription. You are not in a campaign yet, so you will not be entered into the next campaign and your plan will not renew.
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

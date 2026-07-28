import { useState, useRef } from 'react';
import {
  Box, Typography, Paper, Stack, Chip, Button, Divider, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Alert,
  Container, Skeleton, alpha, RadioGroup, FormControlLabel, Radio,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import AppPageHero from '../../../shared/components/AppPageHero';
import {
  ReceiptLong, CheckCircle, Cancel, EmojiEvents,
  Lock, LockOpen, WorkspacePremium, Edit, SwapHoriz, CreditCard, OpenInNew,
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import {
  PRIMARY_MAIN, MOBILE_CONTENT_HEIGHT,
  AMBER_HOURGLASS, GOLD_TROPHY, ACCENT_GOLD_DARK, GRADIENT_GOLD_VIVID, GOLD_INK,
} from '../../../shared/colors';
import { apiErrorMessage } from '../../../shared/utils/apiError';
import { safeHttpUrl, isStripeCheckoutUrl } from '../../../shared/utils/url';
import { useSubscription, useUpdateSubscriptionPlan, useSubscriptionInvoices, useSetParticipation } from '../hooks/useSubscription';
import { updatePaymentMethodApi, foundingRenewalApi } from '../api/subscription.api';
import { useCancelSubscription } from '../hooks/useCancelSubscription';
import { useResumeSubscription } from '../hooks/useResumeSubscription';
import { TIER_MAP, FOUNDING_RENEWAL_TERM_MONTHS } from './components/subscribeTiers';
import PlanCards from './components/PlanCards';

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  Active:     { bg: 'rgba(46,125,50,0.1)',   color: '#2e7d32' },
  Trialing:   { bg: 'rgba(25,118,210,0.1)',  color: '#1976d2' },
  Past_Due:   { bg: 'rgba(237,108,2,0.1)',   color: '#ed6c02' },
  Incomplete: { bg: 'rgba(237,108,2,0.1)',   color: '#ed6c02' },
  Cancelled:  { bg: 'rgba(211,47,47,0.1)',   color: '#d32f2f' },
};

// Business-friendly status labels (no raw enum values like "Past_Due" in the UI).
const STATUS_LABEL: Record<string, string> = {
  Active: 'Active',
  Trialing: 'Trialing',
  Past_Due: 'Past due',
  Incomplete: 'Payment pending',
  Cancelled: 'Cancelled',
};

export default function SubscriptionManagementPage() {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [cancelResult, setCancelResult] = useState<{ removedFromDraw: boolean; refundType: 'full' | 'prorated' | 'none'; refundAmount: number; immediateRemoval?: boolean } | null>(null);
  const [editPlanOpen, setEditPlanOpen] = useState(false);
  const [newTier, setNewTier] = useState<number>(0);
  const [updateError, setUpdateError] = useState('');
  // Bottom of the Change Plan dialog - selecting a plan scrolls the breakdown into view
  // (esp. on mobile, where the price + confirm sit below the cards).
  const editPlanBottomRef = useRef<HTMLDivElement>(null);
  const handleSelectNewTier = (tier: number) => {
    setNewTier(tier);
    requestAnimationFrame(() => {
      editPlanBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  };

  const { data: sub, isLoading, isError } = useSubscription();
  const { data: invoices, isLoading: invoicesLoading } = useSubscriptionInvoices();

  const { mutate: doCancel, isPending: cancelling } = useCancelSubscription();
  const { mutate: doResume, isPending: resuming } = useResumeSubscription();

  const { mutate: doUpdatePlan, isPending: updatingPlan } = useUpdateSubscriptionPlan();
  // Cancel dialog choice: keep participating in everything already paid for (default)
  // or be removed from the map and the paid upcoming campaign immediately (no refund).
  const [cancelMode, setCancelMode] = useState<'stay' | 'immediate'>('stay');
  // Founding cancel (participation pause): permanent opt-out until reactivated.
  const { mutate: doSetParticipation, isPending: settingParticipation } = useSetParticipation();
  const [pauseConfirmOpen, setPauseConfirmOpen] = useState(false);
  const [pauseError, setPauseError] = useState('');

  const [pmLoading, setPmLoading] = useState(false);
  const [pmError, setPmError] = useState('');
  const handleUpdatePaymentMethod = async () => {
    setPmLoading(true);
    setPmError('');
    try {
      const { url } = await updatePaymentMethodApi();
      window.location.href = url;
    } catch (err) {
      setPmError(apiErrorMessage(err, 'Could not open the payment update page. Please try again.'));
      setPmLoading(false);
    }
  };

  // Founding one-time renewal (Special Terms Section 6): the checkout URL guard lives
  // in mutationFn so a bad value rejects the mutation instead of throwing in onSuccess.
  const [renewalError, setRenewalError] = useState('');
  const { mutate: startFoundingRenewal, isPending: renewingFounding } = useMutation({
    mutationFn: async () => {
      const { url } = await foundingRenewalApi();
      if (!isStripeCheckoutUrl(url)) throw new Error('Invalid checkout URL');
      return url;
    },
    onSuccess: (url) => { window.location.href = url; },
    onError: (err: unknown) => setRenewalError(apiErrorMessage(err, 'Could not start the renewal. Please try again.')),
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

  // Subscribe-by deadline for the founding transition banner: the next campaign opens on
  // the 1st, so the last day to start a plan and still be in it is the end of this month.
  const lastDayOfMonthLabel = (() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  })();

  // Staged plan (founding hand-off): the plan the business chose, waiting for the next
  // campaign to open. While set, it is what Stripe will bill, so it leads the display.
  const hasPendingPlan = sub?.pending_entries_per_location != null;

  // The business already PAID for the upcoming (not-yet-open) campaign: the 24th charge
  // landed (status Active) and that campaign has not opened yet. The cancel dialog must
  // then say explicitly that immediate removal forfeits it with no refund.
  const paidUpcomingCampaign = !sub?.is_founding && sub?.in_charged_window === true && sub?.status === 'Active';

  // Cancelled before ever being charged into a campaign: there is nothing pending (no charge,
  // no draw), so we drop the "cancels on <date> / still active" framing and just show it as
  // cancelled - the future period-end date is meaningless here and only confuses.
  // Excluded: immediate-removal cancels (participation_paused) and charged-window cancels
  // (paidUpcomingCampaign) DID pay - they keep the "cancels on <date>" framing.
  const cancelledNoCampaign = !!sub?.cancel_at_period_end && !sub?.draw_id && !sub?.participation_paused && !paidUpcomingCampaign;

  const drawDateLabel = sub?.draw_date
    ? new Date(sub.draw_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  // Founding Partner Special Terms: the plan is a fixed term with NO cancellation
  // refund and no early termination - the cancel action does not exist for founding at all
  // (the membership simply runs through its term and does not renew).

  // One-time renewal window (Special Terms Section 6). The server computes this flag
  // with the same helper its checkout guard uses (single source of truth) - no client
  // date math, so the banner can never show when the server would reject the renewal.
  const foundingRenewalOpen = sub?.founding_renewal_open === true;

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
  // Founding Partner Special Terms: fixed term, no early termination, no refund -
  // there is no cancel action for founding memberships (they expire on their own).
  const canCancel = sub.status !== 'Cancelled' && !sub.cancel_at_period_end && !sub.is_founding;

  return (
    <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: 'var(--dvh100, 100dvh)' }, pb: { xs: 10, md: 6 } }}>
      <AppPageHero
        title='My Plan'
        subtitle='Manage your subscription'
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
            {cancelResult.immediateRemoval
              ? <>Subscription cancelled. Your business has been removed from the map and will not participate in upcoming campaigns. Payments already made are not refunded, and you will not be charged again.</>
              : sub.draw_id
              ? <>Subscription cancelled. Your plan stays active until {periodEndLabel} and you keep every campaign you have already paid for. It will not renew after that.</>
              : paidUpcomingCampaign
              ? <>Subscription cancelled. You keep the upcoming campaign you have already paid for, and you will not be charged again.</>
              : <>Subscription cancelled. You have not been charged and are not entered in any campaign, so nothing further will happen.</>}
          </Alert>
        )}

        {cancelError && (
          <Alert severity='error' sx={{ mb: 3, borderRadius: 2 }} onClose={() => setCancelError('')}>
            {cancelError}
          </Alert>
        )}

        {/* Payment issue: the charge on the 24th did not go through. Fixing the card before
            the month ends keeps the business in the next campaign; a late fix still recovers
            it into the running campaign automatically. */}
        {(sub.status === 'Past_Due' || sub.status === 'Incomplete') && (
          <Alert
            severity='error'
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button
                color='inherit'
                size='small'
                disabled={pmLoading}
                onClick={handleUpdatePaymentMethod}
                sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
              >
                {pmLoading ? <CircularProgress size={16} color='inherit' /> : 'Update payment method'}
              </Button>
            }
          >
            We could not process your payment. We retry your card automatically, but updating your
            payment method fixes it right away. Update by <strong>{lastDayOfMonthLabel}</strong> to
            keep your spot in the next campaign.
          </Alert>
        )}
        {pmError && (
          <Alert severity='error' sx={{ mb: 3, borderRadius: 2 }} onClose={() => setPmError('')}>
            {pmError}
          </Alert>
        )}

        {/* Founding partner final included month: the term still runs, but it no longer covers
            the next campaign. Subscribing before this month ends means no gap. */}
        <AnimatePresence>
          {sub?.is_founding && sub?.founding_transition_available && sub?.current_period_end && new Date(sub.current_period_end) >= new Date() && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              <Paper elevation={0} sx={{ mb: 3, p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: alpha(AMBER_HOURGLASS, 0.04) }}>
                <Stack direction='row' alignItems='center' spacing={2} mb={2}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: alpha(AMBER_HOURGLASS, 0.15), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <WorkspacePremium sx={{ color: AMBER_HOURGLASS, fontSize: 24 }} />
                  </Box>
                  <Box flex={1}>
                    <Typography variant='h6' fontWeight={800}>Your founding term is ending</Typography>
                    <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                      Your Founding Partner term ends {periodEndLabel}. The current campaign is the last one included in your founding term.
                      Start a plan by <strong>{lastDayOfMonthLabel}</strong> and you will be in the next campaign without missing a day.
                    </Typography>
                  </Box>
                </Stack>
                <Box>
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={() => navigate('/subscribe')}
                    sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
                  >
                    Choose a plan
                  </Button>
                </Box>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expired founding member prompt */}
        <AnimatePresence>
          {sub?.is_founding && sub?.current_period_end && new Date(sub.current_period_end) < new Date() && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              <Paper elevation={0} sx={{ mb: 3, p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: alpha(AMBER_HOURGLASS, 0.04) }}>
                <Stack direction='row' alignItems='center' spacing={2} mb={2}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: alpha(AMBER_HOURGLASS, 0.15), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <WorkspacePremium sx={{ color: AMBER_HOURGLASS, fontSize: 24 }} />
                  </Box>
                  <Box flex={1}>
                    <Typography variant='h6' fontWeight={800}>Your founding term has ended</Typography>
                    <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>Your founding partner term is complete. Start a plan to keep running campaigns.</Typography>
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
                      <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: sub.is_founding ? alpha(AMBER_HOURGLASS, 0.15) : 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {sub.is_founding
                          ? <WorkspacePremium sx={{ color: AMBER_HOURGLASS, fontSize: 24 }} />
                          : <ReceiptLong sx={{ color: 'white', fontSize: 24 }} />}
                      </Box>
                      <Box flex={1}>
                        <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          { 'Current Plan'}
                        </Typography>
                        <Typography variant='h6' fontWeight={800} lineHeight={1.2}>
                          {sub.is_founding
                            ? 'Founding Partner'
                            : `Partner ${sub.billing_interval === 'yearly' ? 'Yearly' : 'Monthly'} Plan`}
                        </Typography>
                        {(sub.fee_at_entry != null || hasPendingPlan) && (
                          <Typography variant='body2' fontWeight={700} sx={{ color: PRIMARY_MAIN, mt: 0.5 }}>
                            {hasPendingPlan
                              ? `$${Number(sub.pending_fee_at_entry ?? 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} / month · starts with the next campaign`
                              : sub.is_founding
                              ? `$${Number(sub.founding_amount_paid ?? sub.fee_at_entry ?? 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} one-time for your founding term`
                              : sub.billing_interval === 'yearly'
                                ? `$${Number(sub.fee_at_entry).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} / month · billed yearly`
                                : `$${Number(sub.fee_at_entry).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} / month`}
                          </Typography>
                        )}
                        {(sub.active_location_count != null || sub.entries_per_location != null) && (
                          <Typography variant='caption' color='text.secondary' sx={{ mt: 0.25 }}>
                            {(() => {
                              // With a staged plan, the price line above shows the NEXT
                              // campaign's fee - so the counts must describe the same
                              // configuration (staged tier + next campaign's locations).
                              const locs = hasPendingPlan
                                ? (sub.next_campaign_location_count ?? sub.active_location_count)
                                : sub.active_location_count;
                              const entries = hasPendingPlan
                                ? sub.pending_entries_per_location
                                : sub.entries_per_location;
                              return [
                                locs != null && `${locs} location${locs !== 1 ? 's' : ''}`,
                                entries != null && `${entries} entries per location`,
                              ].filter(Boolean).join(' · ');
                            })()}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                    <Chip
                    label={cancelledNoCampaign ? 'Cancelled' : sub.cancel_at_period_end ? 'Cancels Soon' : (STATUS_LABEL[sub.status] ?? sub.status)}
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
                      {cancelledNoCampaign ? (
                        <Box>
                          <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.5 }}>
                            Plan status
                          </Typography>
                          <Typography variant='h6' fontWeight={800} color='text.primary'>Cancelled</Typography>
                          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.5 }}>
                            {sub.status === 'Cancelled'
                              // Truly ended (period end passed): only a NEW plan can bring it back, and an
                              // in-window signup pays for the upcoming campaign at checkout.
                              ? 'You were not charged and are not in any campaign. Start a new plan whenever you are ready to join the next campaign.'
                              : 'You were not charged and are not in any campaign. Resume your plan whenever you\'re ready.'}
                          </Typography>
                        </Box>
                      ) : periodEndLabel && (
                        <Box>
                          <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.5 }}>
                            {sub.is_founding ? 'Membership expires' : sub.cancel_at_period_end ? 'Cancels on' : 'Next charge on'}
                          </Typography>
                          <Typography variant='h6' fontWeight={800} color='text.primary'>{periodEndLabel}</Typography>
                          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.5 }}>
                            {sub.is_founding
                              ? 'One-time payment. Every campaign through your term is included, no auto-renewal.'
                              : sub.cancel_at_period_end
                                ? sub.participation_paused
                                  ? 'No further charges. Your business is off the map and will not join upcoming campaigns - payments already made are not refunded.'
                                  : 'You stay in every campaign you have already paid for - no further charges'
                                : 'Your plan is billed on the 24th of each month. Each payment covers the next month\'s campaign.'}
                          </Typography>
                        </Box>
                      )}
                    </Stack>

                    {/* Founding one-time renewal (Special Terms Section 6): offered in the
                        FINAL 30 days of the term, at the exact original founding price. */}
                    <AnimatePresence>
                      {foundingRenewalOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Box
                            sx={{
                              mt: 2.5, p: 2.5, borderRadius: 2,
                              border: '1px solid', borderColor: alpha(AMBER_HOURGLASS, 0.4),
                              background: `linear-gradient(120deg, ${alpha(GOLD_TROPHY, 0.08)}, ${alpha(AMBER_HOURGLASS, 0.14)})`,
                            }}
                          >
                            <Stack direction='row' spacing={1.5} alignItems='flex-start'>
                              <WorkspacePremium sx={{ color: ACCENT_GOLD_DARK, fontSize: 26, mt: 0.25 }} />
                              <Box flex={1}>
                                <Typography variant='subtitle2' fontWeight={800} sx={{ color: ACCENT_GOLD_DARK }}>
                                  Renew your founding plan
                                </Typography>
                                <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5, lineHeight: 1.6 }}>
                                  Your founding term ends {periodEndLabel}. As a Founding Partner you can renew the exact same plan for another {FOUNDING_RENEWAL_TERM_MONTHS} months at your original monthly rate
                                  {sub.founding_renewal_price ? <> - <strong>${Number(sub.founding_renewal_price).toLocaleString()}</strong> for the full {FOUNDING_RENEWAL_TERM_MONTHS} months</> : null}. Your new term starts right where this one ends.
                                </Typography>
                                <Button
                                  variant='contained'
                                  size='medium'
                                  disabled={renewingFounding}
                                  onClick={() => startFoundingRenewal()}
                                  sx={{
                                    mt: 1.5, fontWeight: 800, textTransform: 'none',
                                    background: GRADIENT_GOLD_VIVID,
                                    color: GOLD_INK,
                                    '&:hover': { background: GRADIENT_GOLD_VIVID },
                                  }}
                                >
                                  {renewingFounding ? <CircularProgress size={20} sx={{ color: GOLD_INK }} /> : `Renew for ${FOUNDING_RENEWAL_TERM_MONTHS} months${sub.founding_renewal_price ? ` - $${Number(sub.founding_renewal_price).toLocaleString()}` : ''}`}
                                </Button>
                                {renewalError && (
                                  <Typography variant='caption' color='error.main' fontWeight={700} display='block' sx={{ mt: 1 }}>
                                    {renewalError}
                                  </Typography>
                                )}
                                <Typography variant='caption' color='text.secondary' display='block' sx={{ mt: 1 }}>
                                  Renewals follow the{' '}
                                  <Box component={Link} to='/founding-terms' sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'underline' }}>
                                    Founding Partner Special Terms
                                  </Box>.
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {hasPendingPlan && (
                      <Alert severity='info' sx={{ mt: 2.5, borderRadius: 2 }}>
                        {(() => {
                          const locs = sub.next_campaign_location_count ?? sub.active_location_count;
                          const parts = [
                            `${Number(sub.pending_entries_per_location).toLocaleString()} entries per location`,
                            locs != null ? `${locs} location${locs !== 1 ? 's' : ''}` : null,
                            sub.pending_fee_at_entry != null ? `$${Number(sub.pending_fee_at_entry).toLocaleString()}/month` : null,
                          ].filter(Boolean).join(' · ');
                          // Contrast the current tier only when it actually differs -
                          // otherwise (e.g. a locations-only change) just say nothing changes yet.
                          const tierChanged = sub.entries_per_location != null
                            && sub.entries_per_location !== sub.pending_entries_per_location;
                          return (
                            <>
                              Your updated plan ({parts}) begins with the next campaign.
                              {tierChanged
                                ? ` The current campaign keeps its plan of ${Number(sub.entries_per_location).toLocaleString()} entries per location.`
                                : ' The current campaign is not affected.'}
                            </>
                          );
                        })()}
                      </Alert>
                    )}

                    {/* Founding pause only: the Reactivate action hits the founding-only
                        participation endpoint. A monthly immediate-removal cancel also sets
                        participation_paused, but its state is explained by the cancels-soon
                        alert below and recovered via the Resume Campaign button instead. */}
                    {sub.is_founding && sub.participation_paused && (
                      <Alert
                        severity='warning'
                        sx={{ mt: 2.5, borderRadius: 2 }}
                        action={
                          <Button
                            color='inherit'
                            size='small'
                            disabled={settingParticipation}
                            onClick={() => doSetParticipation(false, { onError: (err: unknown) => setPauseError(apiErrorMessage(err, 'Could not reactivate your plan.')) })}
                            sx={{ fontWeight: 700 }}
                          >
                            {settingParticipation ? <CircularProgress size={16} color='inherit' /> : 'Reactivate'}
                          </Button>
                        }
                      >
                        Your participation is cancelled. Your business is not on the map and will not join upcoming campaigns. You can reactivate at any time while your founding term is active.
                      </Alert>
                    )}
                    {pauseError && (
                      <Alert severity='error' sx={{ mt: 2.5, borderRadius: 2 }} onClose={() => setPauseError('')}>{pauseError}</Alert>
                    )}

                    {sub.cancel_at_period_end && !cancelledNoCampaign && !sub.is_founding && (
                      <Alert severity='warning' sx={{ mt: 2.5, borderRadius: 2 }}>
                        {sub.participation_paused
                          ? <>Your plan is cancelled and ends on <strong>{periodEndLabel}</strong>. Your business has been removed from the map and will not participate in upcoming campaigns. Payments already made are not refunded. Resume to restore your participation.</>
                          : <>Your plan is still fully active and will continue until <strong>{periodEndLabel}</strong>. You stay in every campaign you have already paid for. It just will not renew after that.</>}
                      </Alert>
                    )}
                    {/* Founding: the plan is fixed for the term (Special Terms) - no Edit Plan at all */}
                    {!sub.is_founding && (
                      <Box pt={2}>
                        <Button
                          size='small'
                          variant='outlined'
                          startIcon={<Edit />}
                          onClick={() => { setNewTier(sub.pending_entries_per_location ?? sub.entries_per_location ?? 2500); setEditPlanOpen(true); setUpdateError(''); }}
                          disabled={sub.status === 'Cancelled' || sub.cancel_at_period_end}
                          sx={{ fontWeight: 700, textTransform: 'none' }}
                        >
                          Edit Plan
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </motion.div>

              {/* Billing card with actions */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
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
                    <Stack direction='row' alignItems='center' spacing={2}>
                      <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CreditCard sx={{ color: 'white', fontSize: 24 }} />
                      </Box>
                      <Typography variant='h6' fontWeight={800}>Billing</Typography>
                    </Stack>
                  </Box>

                  {/* Card body */}
                  <Box sx={{ px: 3, py: 2.5 }}>
                    <Stack spacing={2}>
                      {/* Resume or Start New Plan - primary actions when applicable */}
                      <AnimatePresence>
                        {sub.cancel_at_period_end && sub.status !== 'Cancelled' && !sub.is_founding && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Button
                              fullWidth
                              variant='contained'
                              color='primary'
                              size='large'
                              startIcon={resuming ? undefined : <CheckCircle />}
                              onClick={() => doResume(undefined, {
                                onSuccess: () => setCancelResult(null),
                                onError: (err) => { setCancelError(err.response?.data?.error ?? 'Could not resume subscription. Please try again.'); },
                              })}
                              disabled={resuming}
                              sx={{ borderRadius: 2, fontWeight: 700, py: 1.75 }}
                            >
                              {resuming ? <CircularProgress size={22} color='inherit' /> : 'Resume Campaign'}
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {sub.status === 'Cancelled' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
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
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Update payment method - primary utility action */}
                      {sub.stripe_subscription_id && sub.status !== 'Cancelled' && (
                        <Button
                          fullWidth
                          variant='outlined'
                          size='large'
                          startIcon={pmLoading ? undefined : <CreditCard />}
                          onClick={handleUpdatePaymentMethod}
                          disabled={pmLoading}
                          sx={{ borderRadius: 2, fontWeight: 700, py: 1.75 }}
                        >
                          {pmLoading ? <CircularProgress size={22} color='inherit' /> : 'Update payment method'}
                        </Button>
                      )}

                      {/* Cancel subscription - quieter destructive action */}
                      {canCancel && (
                        <Button
                          fullWidth
                          variant='outlined'
                          color='error'
                          size='medium'
                          startIcon={<Cancel />}
                          onClick={() => { setCancelMode('stay'); setConfirmOpen(true); }}
                          sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                          Cancel my subscription
                        </Button>
                      )}

                      {/* Founding: fixed term per the Special Terms - no refund, no early
                          termination of the TERM. Month-agnostic wording: a renewed member's
                          remaining term differs from the initial one, so the end DATE carries
                          the information. */}
                      {sub.is_founding && sub.status !== 'Cancelled' && (
                        <Typography variant='caption' color='text.secondary' textAlign='center' sx={{ lineHeight: 1.6 }}>
                          Your Founding Partner plan is a one-time purchase for a fixed term{periodEndLabel ? ` ending ${periodEndLabel}` : ''}. It does not renew and payments are not refunded. See the{' '}
                          <Box
                            component={Link}
                            to='/founding-terms'
                            sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'underline' ,whiteSpace:'nowrap'}}
                          >
                            Founding Partner Special Terms
                          </Box>.
                        </Typography>
                      )}

                      {/* Founding cancel - permanent participation opt-out (not a one-campaign
                          skip). Available anytime while not already paused; no charged-window
                          gate since there is no recurring billing to time it against. */}
                      {sub.is_founding && sub.status !== 'Cancelled' && !sub.participation_paused && (
                        <Button
                          fullWidth
                          variant='outlined'
                          color='error'
                          size='medium'
                          startIcon={<Cancel />}
                          onClick={() => { setPauseError(''); setPauseConfirmOpen(true); }}
                          sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                          Cancel my plan
                        </Button>
                      )}

                    </Stack>
                  </Box>
                </Paper>
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
                          {/* NULL = prize not revealed yet (admin teaser), never $0.00 */}
                          <Typography variant='h5' fontWeight={900} color='primary.main' sx={{ fontSize: { xs: '1.75rem', md: '2rem' } }}>
                            {sub?.prize_amount != null ? `$${Number(sub.prize_amount).toFixed(2)}` : 'Revealing soon'}
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
                        {/* NULL = prize not revealed yet (admin teaser), never $0.00 */}
                        <Typography variant='h5' fontWeight={900} color='primary.main' sx={{ fontSize: { xs: '1.75rem', md: '2rem' } }}>
                          {sub.next_campaign_prize != null ? `$${Number(sub.next_campaign_prize).toFixed(2)}` : 'Revealing soon'}
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
                      // One-off lines (immediate campaign payments and plan-change settlements)
                      // have a zero-length period; their description is shown verbatim instead
                      // of the per-location monthly breakdown used for recurring cycle lines.
                      const isOneOffLine = (l: { period_start: number | undefined; period_end: number | undefined }) =>
                        l.period_start != null && l.period_start === l.period_end;
                      const subLines = invoice.description.filter(l => !isProrationLine(l));
                      // A pure change note has a description but no money movement; anything
                      // with an amount renders as a payment row.
                      const isChangeEntry = amount === 0 && (!!invoice.invoice_description || (invoice.description.length > 0 && subLines.length === 0));

                      const changeReason = invoice.invoice_description
                        ?? (isChangeEntry ? 'Plan or location updated' : null);
                      // The Stripe link for this row: for recurring invoices it's the clean hosted
                      // invoice page (invoice.stripe.com/i/...); for founding/one-time rows it's the
                      // charge receipt page. Synthetic entries (change log, refunds) have none = null.
                      const receiptUrl = safeHttpUrl(invoice.hosted_invoice_url);

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
                                {receiptUrl && (
                                  <Button
                                    size='small'
                                    href={receiptUrl}
                                    target='_blank'
                                    rel='noopener'
                                    endIcon={<OpenInNew sx={{ fontSize: '13px !important' }} />}
                                    sx={{
                                      ml: 'auto !important',
                                      textTransform: 'none',
                                      fontWeight: 600,
                                      minWidth: 0,
                                      px: 1.25,
                                      py: 0.625,
                                      flexShrink: 0,
                                      fontSize: '0.875rem',
                                      borderRadius: '20px',
                                      border: '1px solid',
                                      borderColor: alpha(PRIMARY_MAIN, 0.2),
                                      color: 'text.secondary',
                                      backgroundColor: alpha(PRIMARY_MAIN, 0.04),
                                      transition: 'all 0.2s ease-in-out',
                                      '&:hover': {
                                        backgroundColor: alpha(PRIMARY_MAIN, 0.08),
                                        borderColor: alpha(PRIMARY_MAIN, 0.35),
                                        color: 'primary.main',
                                        transform: 'translateY(-1px)',
                                      },
                                      '&:active': {
                                        transform: 'translateY(0)',
                                      },
                                    }}
                                  >
                                    {isRefunded ? 'Refund' : 'Invoice'}
                                  </Button>
                                )}
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
                                    // One-off charges (immediate campaign payment, plan or
                                    // location settlement) carry their own explanation.
                                    if (isOneOffLine(line)) {
                                      return (
                                        <Typography key={li} variant='caption' color='text.secondary' sx={{ display: 'block', lineHeight: 1.5 }}>
                                          {line.description ?? invoice.invoice_description ?? 'One-time charge'}
                                        </Typography>
                                      );
                                    }
                                    const qty = line.quantity ?? 1;
                                    const pricePerLoc = qty > 0 ? Math.abs(line.amount) / qty : Math.abs(line.amount);
                                    const label = qty > 1
                                      ? `${qty} locations × $${pricePerLoc.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}/location`
                                      : `1 location - $${Math.abs(line.amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}/month`;
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
      <Dialog open={editPlanOpen} onClose={() => setEditPlanOpen(false)} fullWidth maxWidth='md' PaperProps={{ sx: { borderRadius: 2, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Change Plan</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            {/* Plan picker */}
            <Box>
              <Typography variant='body2' color='text.secondary' mb={2}>
                Pick your plan. It takes effect with the next campaign.
              </Typography>
              <PlanCards selectedTier={newTier} onSelect={handleSelectNewTier} disabled={updatingPlan} />
            </Box>

            {/* Price breakdown */}
            <Box sx={{ bgcolor: 'rgba(2,146,183,0.05)', borderRadius: 2.5, p: 2.5, border: '1px solid rgba(2,146,183,0.15)' }}>
              <Stack spacing={1.5}>
                <Stack direction='row' justifyContent='space-between'>
                  <Typography variant='body2' color='text.secondary'>Locations</Typography>
                  <Typography variant='body2' fontWeight={700}>{sub.next_campaign_location_count ?? sub.active_location_count ?? 1}</Typography>
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
                    ${((TIER_MAP[newTier] ?? 0) * (sub.next_campaign_location_count ?? sub.active_location_count ?? 1)).toLocaleString()}
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            <Typography variant='caption' color='text.secondary' sx={{ lineHeight: 1.5 }}>
              Your new plan takes effect with the next campaign. The current campaign is not affected.
              {sub.in_charged_window ? ' Since the next campaign is already paid, any price difference is charged or refunded right away.' : ''}
            </Typography>
            {/* Scroll target: selecting a plan brings the breakdown into view */}
            <Box ref={editPlanBottomRef} />
          </Stack>
        </DialogContent>
        {/* Error lives OUTSIDE the scrollable content so it is always visible above the actions. */}
        {updateError && (
          <Box sx={{ px: 3, pt: 1 }}>
            <Alert severity='error' onClose={() => setUpdateError('')} sx={{ borderRadius: 2 }}>{updateError}</Alert>
          </Box>
        )}
        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button onClick={() => setEditPlanOpen(false)} variant='outlined' sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setUpdateError('');
              doUpdatePlan(newTier, {
                onSuccess: () => setEditPlanOpen(false),
                onError: (err: unknown) => setUpdateError(apiErrorMessage(err, 'Failed to update plan')),
              });
            }}
            variant='contained'
            // Compare against the plan the NEXT campaign will run with (staged change wins
            // over the live tier - e.g. a founding member's live 2,500 benefit is not
            // their plan; their staged choice is).
            disabled={updatingPlan || newTier === (sub.pending_entries_per_location ?? sub.entries_per_location ?? 0)}
            sx={{ fontWeight: 700 }}
          >
            {updatingPlan ? <CircularProgress size={20} color='inherit' /> : 'Confirm Change'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm dialog. When the business is participating in anything it already paid
          for (running campaign, or the upcoming one after the 24th charge), cancelling
          asks ONE choice: keep everything paid for until it ends, or leave immediately
          (off the map, out of the paid upcoming campaign, no refund). */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} PaperProps={{ sx: { borderRadius: 2, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Are you sure you want to cancel?</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5}>
            {(sub.draw_id || paidUpcomingCampaign) ? (
              <>
                <DialogContentText>
                  Your plan will not renew and you will not be charged again.
                  {paidUpcomingCampaign && <> You have <strong>already paid for the upcoming campaign</strong>{sub.next_campaign_name ? ` (${sub.next_campaign_name})` : ''}.</>}
                  {' '}Choose what happens to your participation:
                </DialogContentText>
                <RadioGroup value={cancelMode} onChange={(e) => setCancelMode(e.target.value as 'stay' | 'immediate')}>
                  <FormControlLabel
                    value='stay'
                    control={<Radio size='small' />}
                    sx={{ alignItems: 'flex-start', mb: 1, '& .MuiRadio-root': { pt: 0 } }}
                    label={
                      <Box>
                        <Typography variant='body2' fontWeight={700}>Keep participating until my paid campaigns end</Typography>
                        <Typography variant='caption' color='text.secondary' sx={{ lineHeight: 1.5 }}>
                          Your business stays on the map and stays in every campaign you have already paid for. Your plan simply ends afterward.
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value='immediate'
                    control={<Radio size='small' />}
                    sx={{ alignItems: 'flex-start', '& .MuiRadio-root': { pt: 0 } }}
                    label={
                      <Box>
                        <Typography variant='body2' fontWeight={700}>Remove my business now</Typography>
                        <Typography variant='caption' color='text.secondary' sx={{ lineHeight: 1.5 }}>
                          Your business leaves the map immediately, customers can no longer submit entries, and it will not join the upcoming campaign. Payments already made are <strong>not refunded</strong>. Entries customers already earned stay valid.
                        </Typography>
                      </Box>
                    }
                  />
                </RadioGroup>
              </>
            ) : (
              <DialogContentText>
                Cancelling will stop your subscription. You are not in a campaign yet, so you will not be entered into the next campaign and your plan will not renew.
              </DialogContentText>
            )}
            <Typography variant='caption' color='text.secondary' display='block' sx={{ mt: 1, lineHeight: 1.5 }}>
              Cancellation and refunds are governed by our{' '}
              <Box
                component={Link}
                to='/cancellation'
                sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'underline' }}
              >
                Cancellation &amp; Refund Policy
              </Box>.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} variant='outlined' sx={{ fontWeight: 700 }}>
            Keep Subscription
          </Button>
          <Button
            onClick={() => doCancel(cancelMode === 'immediate', {
              onSuccess: (data) => { setCancelResult(data); setConfirmOpen(false); },
              onError: (err) => { setCancelError(err.response?.data?.error ?? 'Cancellation failed. Please try again.'); setConfirmOpen(false); },
            })}
            color='error'
            variant='contained'
            disabled={cancelling}
            sx={{ fontWeight: 700 }}
          >
            {cancelling ? <CircularProgress size={20} color='inherit' /> : 'Yes, Cancel'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Founding cancel dialog - permanent participation opt-out, reactivatable */}
      <Dialog open={pauseConfirmOpen} onClose={() => setPauseConfirmOpen(false)} PaperProps={{ sx: { borderRadius: 2, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Are you sure you want to cancel?</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5}>
            <DialogContentText>
              Cancelling stops your participation in Winnbell campaigns. Your business is removed from the map right away, customers can no longer submit entries at your business, and you will not join any upcoming campaigns.
            </DialogContentText>
            <DialogContentText>
              As set out in the Founding Partner Special Terms, payments are <strong>not refunded</strong> and your founding term keeps running while cancelled.
            </DialogContentText>
            <DialogContentText>
              Entries customers already earned stay valid for the current draw. You can reactivate your plan at any time while your founding term is active.
            </DialogContentText>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPauseConfirmOpen(false)} variant='outlined' sx={{ fontWeight: 700 }}>
            Keep My Plan
          </Button>
          <Button
            onClick={() => {
              setPauseError('');
              doSetParticipation(true, {
                onSuccess: () => setPauseConfirmOpen(false),
                onError: (err: unknown) => { setPauseConfirmOpen(false); setPauseError(apiErrorMessage(err, 'Could not cancel. Please try again.')); },
              });
            }}
            color='error'
            variant='contained'
            disabled={settingParticipation}
            sx={{ fontWeight: 700 }}
          >
            {settingParticipation ? <CircularProgress size={20} color='inherit' /> : 'Yes, Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

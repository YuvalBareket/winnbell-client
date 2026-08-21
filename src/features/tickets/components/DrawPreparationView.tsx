import type { KeyboardEvent } from 'react';
import {
  Box, Container, Typography, Paper, Chip, LinearProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  EmojiEvents, CheckCircle, RadioButtonUnchecked, CalendarMonth, OpenInNew, Celebration,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GRADIENT_HERO } from '../../../shared/colors';
import type { SubscriptionDetails } from '../../subscription/hooks/useSubscription';
import { useCampaigns } from '../../campaign/hooks/useCampaignData';
import AppPageHero from '../../../shared/components/AppPageHero';

interface DrawPreparationViewProps {
  subscription: SubscriptionDetails | undefined;
  hasDescription: boolean;
  hasLocations: boolean;
  hasReceiptExample?: boolean;
  /** Current minimum spend per receipt. Always has a value ($20 default), so the
      checklist row shows the amount as a reminder to review it rather than a task. */
  minSpend?: number | null;
  isDesktop: boolean;
  isManager?: boolean;
  isSubscribed?: boolean;
}

const DrawPreparationView = ({
  subscription,
  hasDescription,
  hasLocations,
  hasReceiptExample = false,
  minSpend = null,
  isDesktop,
  isManager = false,
  isSubscribed = true,
}: DrawPreparationViewProps) => {
  const navigate = useNavigate();

  // A subscription set to cancel that was never charged into a campaign (no draw_id) is
  // effectively not subscribed going forward - it will not renew and enters no campaign.
  // Show the getting-ready / subscribe checklist, not the "you're registered" one, so we
  // never claim an active subscription or a registered campaign that will not happen.
  const effectivelySubscribed = isSubscribed
    && !(subscription?.cancel_at_period_end && !subscription?.draw_id);

  // Free-trial era: a business can hold a campaign membership WITHOUT any subscription
  // (the join button below inserts it directly). The campaigns list is the source of
  // truth for that membership - an Upcoming item means "registered, opens soon", an Open
  // one means live (the parent usually swaps to the dashboard then; the missing-receipt
  // gate can still land here). The list query is shared with the dashboard page, so this
  // costs no extra request.
  const { data: campaignsData } = useCampaigns();
  const joinedCampaign = (campaignsData ?? []).find((c) => c.status === 'Open')
    ?? (campaignsData ?? []).find((c) => c.status === 'Upcoming')
    ?? null;
  const trialJoined = !effectivelySubscribed && joinedCampaign != null;
  // "Registered" drives every visual state that used to mean "subscribed": a trial join
  // and a subscription are the same thing to this page - a campaign membership.
  const registered = effectivelySubscribed || trialJoined;

  // A cancelling business already has a plan record, so send them to Manage plan (to
  // reactivate) rather than the fresh subscribe flow. A truly new business (no plan
  // record at all) gets the free-trial JOIN link instead of the subscribe link - the
  // actual join button (with the threshold confirm dialog) lives on the plan page.
  const hasExistingPlan = !!subscription?.cancel_at_period_end;

  // A business that subscribed mid-campaign has no draw_entry yet (enrollment happens when
  // the admin opens the next campaign), so draw_* are null. Fall back to the upcoming
  // campaign it will join (next_campaign_*) so the card shows a real name, date and prize.
  // Only when it WILL actually join: a cancelling business (effectivelySubscribed false) or
  // one that opted out of the next campaign must not see it presented as theirs.
  // A trial join falls back to the joined campaign's own row from the campaigns list.
  const showNextCampaign = effectivelySubscribed && !subscription?.skip_next_campaign && !subscription?.participation_paused;
  const drawName = subscription?.draw_name ?? (showNextCampaign ? subscription?.next_campaign_name : null) ?? joinedCampaign?.name ?? null;
  const drawDateValue = subscription?.draw_date ?? (showNextCampaign ? subscription?.next_campaign_date : null) ?? joinedCampaign?.draw_date ?? null;
  const startDateValue = subscription?.draw_start_date ?? (showNextCampaign ? subscription?.next_campaign_start_date : null) ?? joinedCampaign?.start_date ?? null;
  const prizeValue = subscription?.prize_amount ?? (showNextCampaign ? subscription?.next_campaign_prize : null) ?? joinedCampaign?.prize_amount ?? null;

  // A registered upcoming campaign counts down to its START, which is when the business
  // goes live (the draw date is the fallback when no start is known).
  const targetDateValue = startDateValue ?? drawDateValue;
  const drawDate = targetDateValue ? new Date(targetDateValue) : null;
  // Clamped: an overdue boundary (start passed but admin opens late, or a live draw not
  // yet closed) must read "0 days to go", never a negative count.
  const daysUntil = drawDate
    ? Math.max(0, Math.ceil((drawDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const prizeAmount = prizeValue
    ? `$${Number(prizeValue).toFixed(0)}`
    : null;

  // The threshold always has a value ($20 default set at signup), so the row shows as
  // done once business data loads; it is a review reminder, not an open task.
  type ChecklistItem = {
    label: string; done: boolean; path?: string; info?: boolean; alwaysClickable?: boolean;
    /** Visually highlighted row (the free-trial join link). */
    emphasis?: boolean;
  };
  const minSpendItem: ChecklistItem = {
    label: 'Set your spending threshold',
    done: minSpend != null,
    path: '/nearby',
    // Stays clickable even when checked: the $20 default counts as "set", but the
    // owner should still be able to jump to the hub and adjust it.
    alwaysClickable: true,
  };

  // First row when NOT registered: the free-trial JOIN link for a brand-new business
  // (to the plan page, where the join button + threshold confirm dialog live), or the
  // reactivate link for a cancelling one that already holds a plan record.
  const membershipItem: ChecklistItem = hasExistingPlan
    ? { label: 'Reactivate your campaign plan', done: false, path: '/subscription/manage' }
    : { label: 'Join the current campaign', done: false, path: '/subscribe', emphasis: true };

  // The receipt example is OPTIONAL (2026-08-21): a helpful customer guide, never a gate.
  const receiptExampleItem: ChecklistItem = {
    label: 'Add a receipt example for your customers (optional)',
    done: hasReceiptExample,
    path: '/nearby',
  };

  const checklist: ChecklistItem[] = registered
    ? [
        effectivelySubscribed
          ? { label: 'Subscription active', done: true }
          : { label: `Joined ${drawName ?? 'the campaign'}`, done: true },
        { label: `Registered for ${drawName ?? 'upcoming campaign'}`, done: true },
        receiptExampleItem,
        minSpendItem,
        { label: 'Add your business description', done: hasDescription, path: '/nearby' },
        { label: 'Add at least one active location', done: hasLocations, path: '/nearby' },
        { label: 'Go live on the map when campaign opens', done: false, info: true },
      ]
    : [
        membershipItem,
        receiptExampleItem,
        minSpendItem,
        { label: 'Add your business description', done: hasDescription, path: '/nearby' },
        { label: 'Add at least one active location', done: hasLocations, path: '/nearby' },
        { label: 'Go live on the map when your campaign opens', done: false, info: true },
      ];
  const taskItems = checklist.filter(c => !c.info);
  const completedCount = taskItems.filter(c => c.done).length;
  const progress = (completedCount / taskItems.length) * 100;

  return (
    <Box sx={{ minHeight: isDesktop ? 'auto' : 'calc(var(--dvh100, 100dvh) - 138px)', pb: 6 }}>
      <AppPageHero
        title={registered ? 'Preparing for Your Campaign' : 'Get Your Business Ready'}
        subtitle={registered
          ? "You're registered - your business goes live when the campaign opens"
          : 'A few quick steps to get your business live on Winnbell'}
      />

      <Container maxWidth='lg' sx={{ mt: 1 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: 3, alignItems: 'flex-start' }}>

          {/* Left: Draw info card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ background: GRADIENT_HERO, p: 3, color: 'white' }}>
              <Typography variant='overline' sx={{ opacity: 0.8, letterSpacing: 1.5 }}>{registered ? 'Registered Campaign' : 'Upcoming Campaign'}</Typography>
              <Typography variant='h6' fontWeight={800} sx={{ mt: 0.5 }}>
                {drawName ?? 'Upcoming Monthly Campaign'}
              </Typography>
              {drawDate && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <CalendarMonth sx={{ fontSize: 16, opacity: 0.8 }} />
                  <Typography variant='body2' sx={{ opacity: 0.9 }}>
                    Starts {drawDate.toLocaleDateString('en-US', { timeZone: 'America/New_York', month: 'long', day: 'numeric', year: 'numeric' })}
                  </Typography>
                </Box>
              )}
            </Box>
            <Box sx={{ p: 3 }}>
              {/* Days-to-go / prize stats - desktop only */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, mb: 3 }}>
                {daysUntil !== null && (
                  <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: 'rgba(25,93,230,0.05)', borderRadius: 2 }}>
                    <Typography variant='h4' fontWeight={800} color='primary'>{daysUntil}</Typography>
                    <Typography variant='caption' color='text.secondary' fontWeight={600}>days to go</Typography>
                  </Box>
                )}
                {prizeAmount && (
                  <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: 'rgba(46,125,50,0.05)', borderRadius: 2 }}>
                    <Typography variant='h4' fontWeight={800} sx={{ color: 'success.main' }}>{prizeAmount}</Typography>
                    <Typography variant='caption' color='text.secondary' fontWeight={600}>prize pool</Typography>
                  </Box>
                )}
              </Box>
              <Box sx={{ p: 2, bgcolor: 'rgba(25,93,230,0.04)', borderRadius: 2, border: '1px solid rgba(25,93,230,0.1)' }}>
                <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
                  Once the campaign is live, customers can submit your receipts through Winnbell and earn campaign entries.
                </Typography>
              </Box>
            </Box>
            </Paper>
          </motion.div>

          {/* Right: Preparation checklist (owners) or info (managers) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {isManager ? (
              <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', p: 3 }}>
                <Typography variant='h6' fontWeight={800} mb={0.5}>How it works at your location</Typography>
                <Typography variant='body2' color='text.secondary' mb={2.5}>
                  {registered
                    ? 'Your campaign is set up. Here is what to expect once it opens.'
                    : 'Your location goes live once the business owner joins the campaign.'}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  {(registered
                    ? [
                        { title: 'Registered for the campaign', desc: `Your business is set for ${drawName ?? 'the upcoming campaign'}.` },
                        { title: 'Campaign opens', desc: 'When it goes live, customers can submit receipts from your location to enter.' },
                        { title: 'Entries appear here', desc: 'Every entry from your location shows up on this page to track.' },
                      ]
                    : [
                        { title: 'Owner joins the campaign', desc: 'The business owner joins the current campaign to go live.' },
                        { title: 'Campaign opens', desc: 'Once live, customers can submit receipts from your location to enter.' },
                        { title: 'Entries appear here', desc: 'Every entry from your location shows up on this page to track.' },
                      ]
                  ).map((step, i, arr) => (
                    <Box key={i} sx={{ display: 'flex', gap: 1.75, position: 'relative', pb: i === arr.length - 1 ? 0 : 2.5 }}>
                      {/* Connector line */}
                      {i !== arr.length - 1 && (
                        <Box sx={{ position: 'absolute', left: 15, top: 32, bottom: 0, width: '2px', bgcolor: 'divider' }} />
                      )}
                      {/* Numbered node */}
                      <Box sx={{
                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: i === 0 && registered ? 'success.main' : 'primary.main',
                        color: 'white', fontWeight: 800, fontSize: 14,
                      }}>
                        {i + 1}
                      </Box>
                      <Box sx={{ pt: 0.25 }}>
                        <Typography variant='body2' fontWeight={700} color='text.primary'>{step.title}</Typography>
                        <Typography variant='caption' color='text.secondary' sx={{ lineHeight: 1.5, display: 'block', mt: 0.25 }}>
                          {step.desc}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
            ) : (
              <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant='h6' fontWeight={800}>Onboarding Checklist</Typography>
                <Chip label={`${completedCount}/${taskItems.length}`} size='small' color={completedCount === taskItems.length ? 'success' : 'default'} sx={{ fontWeight: 700 }} />
              </Box>
              <LinearProgress
                variant='determinate'
                value={progress}
                aria-label='Onboarding checklist progress'
                sx={{ mb: 3, height: 6, borderRadius: 2, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { borderRadius: 2 } }}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {checklist.map((item, i) => {
                  const clickable = !!item.path && (!item.done || item.alwaysClickable);
                  const emphasized = !!item.emphasis;
                  return (
                  <Box
                    key={i}
                    onClick={() => clickable && navigate(item.path!)}
                    {...(clickable ? { role: 'button' as const, tabIndex: 0, onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(item.path!); } } } : {})}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5,
                      p: 1.5, borderRadius: 2,
                      bgcolor: item.done ? 'rgba(46,125,50,0.04)' : emphasized ? 'rgba(25,93,230,0.06)' : item.info ? 'rgba(25,93,230,0.03)' : 'rgba(0,0,0,0.02)',
                      border: '1px solid',
                      borderColor: item.done ? 'rgba(46,125,50,0.15)' : emphasized ? 'rgba(25,93,230,0.3)' : item.info ? 'rgba(25,93,230,0.12)' : 'divider',
                      cursor: clickable ? 'pointer' : 'default',
                      '&:hover': clickable ? { bgcolor: 'rgba(25,93,230,0.04)' } : {},
                      transition: 'background 0.15s',
                    }}
                  >
                    {item.done
                      ? <CheckCircle sx={{ fontSize: 20, color: 'success.main', flexShrink: 0 }} />
                      : emphasized
                        ? <Celebration sx={{ fontSize: 20, color: 'primary.main', flexShrink: 0 }} />
                        : item.info
                        ? <EmojiEvents sx={{ fontSize: 20, color: 'primary.main', flexShrink: 0, opacity: 0.6 }} />
                        : <RadioButtonUnchecked sx={{ fontSize: 20, color: 'text.disabled', flexShrink: 0 }} />}
                    <Typography variant='body2' fontWeight={emphasized ? 700 : 600} color={item.done ? 'text.primary' : emphasized || item.info ? 'primary.main' : 'text.secondary'} flex={1}>
                      {item.label}
                    </Typography>
                    {clickable && <OpenInNew sx={{ fontSize: 14, color: 'text.disabled' }} />}
                  </Box>
                  );
                })}
              </Box>


              </Paper>
            )}
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
};

export default DrawPreparationView;

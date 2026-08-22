import { useState } from 'react';
import {
  Box, Container, Paper, Stack, Typography, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputAdornment,
} from '@mui/material';
import { CelebrationOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import AppPageHero from '../../../shared/components/AppPageHero';
import AttractButton from '../../../shared/components/AttractButton';
import { api } from '../../../shared/api/client';
import { isStripeCheckoutUrl } from '../../../shared/utils/url';
import {
  MOBILE_CONTENT_HEIGHT, BRAND_ICON_BLUE, TEXT_HEADING, TEXT_SECONDARY,
} from '../../../shared/colors';
import { MIN_RECEIPT_THRESHOLD, MAX_ENTRIES_PER_RECEIPT } from '../../../shared/constants/entries';
import { useBusinessData } from '../../partner/hooks/useBusinessData';
import { useUpdateCampaignSettings } from '../../partner/hooks/useUpdateCampaignSettings';
import { useCampaigns, useJoinCampaign } from '../../campaign/hooks/useCampaignData';
import PlanCheckout from './components/PlanCheckout';

// ── TEMPORARY: September free-trial campaign ────────────────────────────────────
// During the trial every business joins the current campaign directly from this page,
// free, via the join button + threshold dialog below. Flip this back to `false` to
// restore the normal plan picker (that is the only change needed to revert).
const FREE_TRIAL_JOIN = true;

// ── Main page ─────────────────────────────────────────────────────────────────
// Single step: pick a plan and pay. The campaign settings (minimum spend, receipt
// example) start from sensible defaults ($20 minimum) and are collected AFTER
// payment - the success page points at the Business Hub, where both are editable
// at any time.

const SubscribePage = () => {
  const navigate = useNavigate();
  const { data: businessData } = useBusinessData();
  const locationCount = businessData?.locations?.filter(l => l.is_active).length ?? null;

  const [selectedTier, setSelectedTier] = useState(2500); // Growth (most popular)
  const [loading, setLoading] = useState(false);
  const [foundingLoading, setFoundingLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Free-trial join state ───────────────────────────────────────────────────
  // The threshold is the one setting that must be right BEFORE going live: once the
  // campaign is open, changes are held until the campaign ends. So the join button
  // opens a confirm dialog showing the current value, editable one last time.
  const { data: myCampaigns } = useCampaigns(undefined, FREE_TRIAL_JOIN);
  const alreadyJoined = (myCampaigns ?? []).some((c) => c.status === 'Open' || c.status === 'Upcoming');
  const currentThreshold = businessData?.min_transaction_amount != null
    ? Number(businessData.min_transaction_amount)
    : 20;
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [thresholdInput, setThresholdInput] = useState('');
  const [joinError, setJoinError] = useState('');
  const updateSettings = useUpdateCampaignSettings();
  const joinCampaign = useJoinCampaign();
  const joinPending = updateSettings.isPending || joinCampaign.isPending;

  const thresholdValue = parseFloat(thresholdInput);
  const thresholdValid = Number.isFinite(thresholdValue)
    && thresholdValue >= MIN_RECEIPT_THRESHOLD && thresholdValue <= 100000;

  const openJoinDialog = () => {
    setThresholdInput(String(currentThreshold));
    setJoinError('');
    setJoinDialogOpen(true);
  };

  const handleConfirmJoin = async () => {
    if (!thresholdValid || joinPending) return;
    setJoinError('');
    try {
      // Persist the threshold first (only when changed), then join. If the threshold
      // save succeeds but the join fails, nothing is lost: the saved value stands and
      // the retry only re-runs the join.
      let thresholdStaged = false;
      if (thresholdValue !== currentThreshold) {
        const saved = await updateSettings.mutateAsync({ min_transaction_amount: thresholdValue });
        // Edge (stale alreadyJoined cache): the business is ALREADY in the open campaign,
        // so the change was STAGED for the next campaign, not applied. Say so instead of
        // letting them believe the new threshold is live.
        thresholdStaged = !!saved?.isPending;
      }
      await joinCampaign.mutateAsync();
      if (thresholdStaged) {
        setJoinError('You are already in the live campaign, so your threshold change will take effect next campaign.');
        return;
      }
      navigate('/campaign');
    } catch (err) {
      const msg = isAxiosError(err) ? err.response?.data?.message ?? err.response?.data?.error ?? '' : '';
      setJoinError(msg.length > 0 ? msg : 'Something went wrong. Please try again.');
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post<{ url: string }>('/business/subscription/checkout', {
        entries_per_location: selectedTier,
      });
      if (!isStripeCheckoutUrl(data.url)) throw new Error('Invalid checkout URL');
      window.location.href = data.url;
    } catch (err) {
      const msg = isAxiosError(err) ? err.response?.data?.error ?? '' : '';
      setError(
        msg.includes('already has an active subscription')
          ? 'Your business is already enrolled in a campaign. Go to Campaign Management to update settings.'
          : msg.length > 0
          ? msg
          : 'Something went wrong. Please try again.',
      );
      setLoading(false);
    }
  };

  const handleFoundingSubscribe = async () => {
    setFoundingLoading(true);
    setError('');
    try {
      const { data } = await api.post<{ url: string }>('/business/subscription/checkout', { founding: true });
      if (!isStripeCheckoutUrl(data.url)) throw new Error('Invalid checkout URL');
      window.location.href = data.url;
    } catch (err) {
      const msg = isAxiosError(err) ? err.response?.data?.error ?? '' : '';
      setError(msg.length > 0 ? msg : 'Something went wrong. Please try again.');
      setFoundingLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: 'var(--dvh100, 100dvh)' },
        pb: 8,
      }}
    >
      <AppPageHero
        title={FREE_TRIAL_JOIN ? 'So glad you are here' : 'Pick your plan'}
        subtitle={
          FREE_TRIAL_JOIN
            ? 'Join the current campaign and go live today'
            : 'Choose the entry volume that suits your business traffic'
        }
      />

      <Container maxWidth='lg' sx={{ mt: { xs: 2, md: 1 } }}>
        {FREE_TRIAL_JOIN ? (
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            sx={{ maxWidth: 520, mx: 'auto', mt: { xs: 2, md: 4 } }}
          >
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 4,
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack spacing={2} alignItems='center'>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: `${BRAND_ICON_BLUE}14`,
                    color: BRAND_ICON_BLUE,
                  }}
                >
                  <CelebrationOutlined sx={{ fontSize: 32 }} />
                </Box>
                <Typography variant='h6' sx={{ fontWeight: 700, color: TEXT_HEADING }}>
                  We would love to have you with us
                </Typography>
                <Typography variant='body1' sx={{ color: TEXT_SECONDARY, lineHeight: 1.65 }}>
                  It truly means the world that you want to be part of Winnbell.
                  Our current campaign is open to every local business and joining is
                  completely free. Tap the button below, confirm your entry threshold,
                  and your business goes live for customers right away. Thank you for
                  believing in what we are building. It means everything.
                </Typography>
                {alreadyJoined ? (
                  <Button
                    variant='contained'
                    onClick={() => navigate('/campaign')}
                    sx={{ mt: 1, borderRadius: 2, px: 4 }}
                  >
                    You are in - view your campaign
                  </Button>
                ) : (
                  <AttractButton
                    variant='contained'
                    size='large'
                    onClick={openJoinDialog}
                    sx={{ mt: 1, borderRadius: 2, px: 5, fontWeight: 700, textTransform: 'none' }}
                  >
                    Join the campaign
                  </AttractButton>
                )}
              </Stack>
            </Paper>
          </Box>
        ) : (
          <PlanCheckout
            selectedTier={selectedTier}
            setSelectedTier={setSelectedTier}
            locationCount={locationCount}
            loading={loading}
            foundingLoading={foundingLoading}
            error={error}
            onSubscribe={handleSubscribe}
            onFoundingSubscribe={handleFoundingSubscribe}
            onSkip={() => navigate('/nearby')}
          />
        )}
      </Container>

      {/* Threshold confirm dialog: the one setting to get right before going live. */}
      <Dialog
        open={joinDialogOpen}
        onClose={() => { if (!joinPending) setJoinDialogOpen(false); }}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm your entry threshold</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <Typography variant='body2' sx={{ color: TEXT_SECONDARY, lineHeight: 1.6 }}>
              Customers earn one entry each time a single receipt at your business reaches
              your threshold, counting what they paid before tax and tip, up to{' '}
              {MAX_ENTRIES_PER_RECEIPT} entries per receipt. Yours is currently ${currentThreshold}.
              This is the moment to change it if you want to: once your campaign is live, the
              threshold stays locked until the campaign ends.
            </Typography>
            <TextField
              label='Entry threshold'
              type='number'
              value={thresholdInput}
              onChange={(e) => setThresholdInput(e.target.value)}
              disabled={joinPending}
              slotProps={{
                input: { startAdornment: <InputAdornment position='start'>$</InputAdornment> },
                htmlInput: { min: MIN_RECEIPT_THRESHOLD, max: 100000, step: 1 },
              }}
              error={thresholdInput !== '' && !thresholdValid}
              helperText={
                thresholdInput !== '' && !thresholdValid
                  ? `Between $${MIN_RECEIPT_THRESHOLD} and $100,000.`
                  : thresholdValid
                  ? `A purchase of $${thresholdValue} or more earns an entry. Max ${MAX_ENTRIES_PER_RECEIPT} entries in one purchase.`
                  : ' '
              }
              fullWidth
            />
            {joinError && (
              <Typography variant='caption' sx={{ color: 'error.main' }}>
                {joinError}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setJoinDialogOpen(false)} disabled={joinPending} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant='contained'
            onClick={handleConfirmJoin}
            disabled={!thresholdValid || joinPending}
            sx={{ borderRadius: 2, px: 3, fontWeight: 700, textTransform: 'none' }}
          >
            {joinPending
              ? 'Joining...'
              : thresholdValid
              ? `Join with a $${thresholdValue} threshold`
              : 'Join the campaign'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubscribePage;

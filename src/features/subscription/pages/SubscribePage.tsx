import { useState } from 'react';
import {
  Box, Container, Paper, Stack, Typography, Button,
} from '@mui/material';
import { EventAvailableOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import AppPageHero from '../../../shared/components/AppPageHero';
import { api } from '../../../shared/api/client';
import { isStripeCheckoutUrl } from '../../../shared/utils/url';
import {
  MOBILE_CONTENT_HEIGHT, BRAND_ICON_BLUE, TEXT_HEADING, TEXT_SECONDARY,
} from '../../../shared/colors';
import { useBusinessData } from '../../partner/hooks/useBusinessData';
import PlanCheckout from './components/PlanCheckout';

// ── TEMPORARY: September trial campaign ─────────────────────────────────────────
// During the September trial, businesses just sign in and we add them to the draw
// manually - no self-serve subscription. Flip this back to `false` to restore the
// normal plan picker (that is the only change needed to revert).
const CAMPAIGN_SIGNUP_PAUSED = true;

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
        title={CAMPAIGN_SIGNUP_PAUSED ? 'So glad you are here' : 'Pick your plan'}
        subtitle={
          CAMPAIGN_SIGNUP_PAUSED
            ? 'We would love to have you on board'
            : 'Choose the entry volume that suits your business traffic'
        }
      />

      <Container maxWidth='lg' sx={{ mt: { xs: 2, md: 1 } }}>
        {CAMPAIGN_SIGNUP_PAUSED ? (
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
                  <EventAvailableOutlined sx={{ fontSize: 32 }} />
                </Box>
                <Typography variant='h6' sx={{ fontWeight: 700, color: TEXT_HEADING }}>
                  Thank you for wanting to join us
                </Typography>
                <Typography variant='body1' sx={{ color: TEXT_SECONDARY, lineHeight: 1.65 }}>
                  It truly means the world that you want to be part of Winnbell.
                  Right now we are growing carefully with a small group of local businesses
                  so we can give every single one of them our full attention, which means
                  new sign-ups are on a short pause. Please know we would absolutely love to
                  have you with us. Drop us a quick hello through our contact page and we
                  promise to reach out the very moment we have room for you. Thank you for
                  believing in what we are building. It means everything.
                </Typography>
                <Button
                  variant='contained'
                  onClick={() => navigate('/contact')}
                  sx={{ mt: 1, borderRadius: 2, px: 4 }}
                >
                  Say hello
                </Button>
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
    </Box>
  );
};

export default SubscribePage;

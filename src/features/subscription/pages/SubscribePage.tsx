import { useState } from 'react';
import {
  Box, Container,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import AppPageHero from '../../../shared/components/AppPageHero';
import { api } from '../../../shared/api/client';
import { isStripeCheckoutUrl } from '../../../shared/utils/url';
import {
  MOBILE_CONTENT_HEIGHT,
} from '../../../shared/colors';
import { useBusinessData } from '../../partner/hooks/useBusinessData';
import PlanCheckout from './components/PlanCheckout';

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
        title='Pick your plan'
        subtitle='Choose the entry volume that suits your business traffic'
      />

      <Container maxWidth='lg' sx={{ mt: { xs: 2, md: 1 } }}>
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
      </Container>
    </Box>
  );
};

export default SubscribePage;

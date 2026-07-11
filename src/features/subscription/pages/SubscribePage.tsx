import { useState } from 'react';
import {
  Box, Container,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import AppPageHero from '../../../shared/components/AppPageHero';
import { api } from '../../../shared/api/client';
import { isStripeCheckoutUrl } from '../../../shared/utils/url';
import {
  MOBILE_CONTENT_HEIGHT,
} from '../../../shared/colors';
import { useBusinessData } from '../../partner/hooks/useBusinessData';
import { getUploadUrl, updateCampaignSettingsApi } from '../../partner/api/business.api';
import StepIndicator from './components/StepIndicator';
import SubscribeStep1 from './components/SubscribeStep1';
import SubscribeStep2 from './components/SubscribeStep2';
import SubscribeStep3 from './components/SubscribeStep3';


// ── Main page ─────────────────────────────────────────────────────────────────

const SubscribePage = () => {
  const navigate = useNavigate();
  const { data: businessData } = useBusinessData();
  const locationCount = businessData?.locations?.filter(l => l.is_active).length ?? null;

  const [step, setStep] = useState(1);

  // ── STEP 1 ─────────────────────────────────────────────────────────────────
  const [thresholdInput, setThresholdInput] = useState('');
  const [savingThreshold, setSavingThreshold] = useState(false);
  const [thresholdError, setThresholdError] = useState('');


  const parsedThreshold = thresholdInput.trim() === '' ? null : parseFloat(thresholdInput);
  const isThresholdValid = parsedThreshold !== null && !isNaN(parsedThreshold) && parsedThreshold > 0;

  const handleThresholdContinue = async () => {
    if (!isThresholdValid) return;
    setSavingThreshold(true);
    setThresholdError('');
    try {
      await updateCampaignSettingsApi({ min_transaction_amount: parsedThreshold });
      setStep(2);
    } catch (err) {
      console.error('Failed to save threshold:', err);
      setThresholdError('Failed to save settings. Please check your connection and try again.');
    } finally {
      setSavingThreshold(false);
    }
  };

  // ── STEP 2 - canvas marker ─────────────────────────────────────────────────
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveReceipt = async (blob: Blob) => {
    setIsSaving(true);
    try {
      const { uploadUrl, publicUrl } = await getUploadUrl('image/jpeg', blob.size);
      await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'image/jpeg' }, body: blob });
      // Step 1 already saved the threshold; the receipt example is independent, so only send the image.
      await updateCampaignSettingsApi({ receipt_example_image_url: publicUrl });
      setImgFile(null);
      setStep(3);
    } catch (err) {
      console.error('Failed to save receipt example:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // ── STEP 3 ─────────────────────────────────────────────────────────────────
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
        title='Grow Your Business'
        subtitle='A simple monthly subscription that brings customers back'
        actions={
          <Box sx={{ display: { xs: 'none', md: 'block' }, width: '100%', minWidth: { lg: 460 } }}>
            <StepIndicator currentStep={step} />
          </Box>
        }
      />

      <Container maxWidth='lg' sx={{ mt: { xs: 2, md: 1 } }}>
        {/* Step indicator - mobile only (desktop shows it in the header); sits on the bg, no card */}
        <Box sx={{ display: { xs: 'block', md: 'none' },  mb: 0 }}>
          <StepIndicator currentStep={step} />
        </Box>

              {/* Step body - animated per step */}
              <AnimatePresence mode='wait'>

                {/* ── Step 1 ── */}
                {step === 1 && (
                  <motion.div key='step-1' initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
                    <SubscribeStep1
                      thresholdInput={thresholdInput}
                      setThresholdInput={setThresholdInput}
                      isThresholdValid={isThresholdValid}
                      parsedThreshold={parsedThreshold}
                      savingThreshold={savingThreshold}
                      errorMessage={thresholdError}
                      onContinue={handleThresholdContinue}
                      onSkip={() => navigate('/nearby')}
                    />
                  </motion.div>
                )}

                {/* ── Step 2 ── */}
                {step === 2 && (
                  <motion.div key='step-2' initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
                    <SubscribeStep2
                      imgFile={imgFile}
                      setImgFile={setImgFile}
                      isSaving={isSaving}
                      onSave={handleSaveReceipt}
                      onBack={() => setStep(1)}
                    />
                  </motion.div>
                )}

                {/* ── Step 3 ── */}
                {step === 3 && (
                  <motion.div key='step-3' initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
                    <SubscribeStep3
                      selectedTier={selectedTier}
                      setSelectedTier={setSelectedTier}
                      locationCount={locationCount}
                      loading={loading}
                      foundingLoading={foundingLoading}
                      error={error}
                      onSubscribe={handleSubscribe}
                      onFoundingSubscribe={handleFoundingSubscribe}
                      onSkip={() => navigate('/nearby')}
                      onBack={() => setStep(2)}
                    />
                  </motion.div>
                )}

        </AnimatePresence>
      </Container>
    </Box>
  );
};

export default SubscribePage;

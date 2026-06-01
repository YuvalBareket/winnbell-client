import { useState } from 'react';
import {
  Box, Typography, Paper, Stack,
  IconButton,
} from '@mui/material';
import {
  ConfirmationNumber, EmojiEvents, Storefront, Groups, ArrowBack,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../../shared/api/client';
import {
  GRADIENT_HERO, ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_30, MOBILE_CONTENT_HEIGHT,
} from '../../../shared/colors';
import { useBusinessData } from '../../partner/hooks/useBusinessData';
import { getUploadUrl, updateCampaignSettingsApi } from '../../partner/api/business.api';
import StepIndicator from './components/StepIndicator';
import SubscribeStep1 from './components/SubscribeStep1';
import SubscribeStep2 from './components/SubscribeStep2';
import SubscribeStep3 from './components/SubscribeStep3';

const FEATURES = [
  { icon: <ConfirmationNumber />, text: 'Issue unlimited entries to your customers' },
  { icon: <EmojiEvents />,        text: 'Enter the next monthly campaign and grow your prize pool' },
  { icon: <Storefront />,         text: 'Appear on the Winnbell map so customers can find you' },
  { icon: <Groups />,             text: 'Assign branch managers to run your locations' },
];

// ── Step headers ──────────────────────────────────────────────────────────────

const STEP_COPY = [
  {
    headline: 'Start your campaign',
    sub: 'Set a minimum receipt amount for entry eligibility, or accept any receipt amount from your store.',
  },
  {
    headline: 'Make it crystal clear',
    sub: 'Upload a receipt from your store and mark exactly where customers find the number they need to enter.',
  },
  {
    headline: 'Pick your plan',
    sub: 'Choose the entry volume that fits your traffic. You can scale up anytime.',
  },
];

// ── Main page ─────────────────────────────────────────────────────────────────

const SubscribePage = () => {
  const navigate = useNavigate();
  const { data: businessData } = useBusinessData();
  const locationCount = businessData?.locations?.filter(l => l.is_active).length ?? null;

  const [step, setStep] = useState(1);
  const [savedThreshold, setSavedThreshold] = useState<number | null>(null);

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
      setSavedThreshold(parsedThreshold);
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
      const { uploadUrl, publicUrl } = await getUploadUrl('image/jpeg');
      await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'image/jpeg' }, body: blob });
      await updateCampaignSettingsApi({ min_transaction_amount: savedThreshold, receipt_example_image_url: publicUrl });
      setImgFile(null);
      setStep(3);
    } catch (err) {
      console.error('Failed to save receipt example:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // ── STEP 3 ─────────────────────────────────────────────────────────────────
  const [selectedTier, setSelectedTier] = useState(500);
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
      window.location.href = data.url;
    } catch (err: any) {
      const msg = err.response?.data?.error ?? '';
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
      window.location.href = data.url;
    } catch (err: any) {
      const msg = err.response?.data?.error ?? '';
      setError(msg.length > 0 ? msg : 'Something went wrong. Please try again.');
      setFoundingLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const copy = STEP_COPY[step - 1];

  return (
    <Box
      sx={{
        minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: '100dvh' },
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        '& > *': { minHeight: { md: '100dvh' }, alignItems: 'stretch' },
      }}
    >
      {/* ── Left brand panel ── */}
      <Box
        sx={{
          width: { xs: '100%', md: '45%' },
          background: GRADIENT_HERO,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: { xs: 4, md: '5vh 6vw' },
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          minHeight: { xs: 300, md: '100dvh' },
        }}
      >
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', bgcolor: ALPHA_WHITE_15, filter: 'blur(70px)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -80, left: -60, width: 260, height: 260, borderRadius: '50%', bgcolor: 'rgba(66,189,186,0.18)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <Stack direction='row' alignItems='center' spacing={1.5}>
          <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: ALPHA_WHITE_20, border: `1px solid ${ALPHA_WHITE_30}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ConfirmationNumber sx={{ fontSize: 24 }} />
          </Box>
          <Typography variant='h5' fontWeight={900} letterSpacing={-0.5}>Winnbell</Typography>
        </Stack>

        <Box sx={{ my: { xs: 3, md: 0 } }}>
          <Typography variant='h2' fontWeight={900} lineHeight={1.1} mb={2} sx={{ fontSize: { xs: '2.2rem', md: '3rem', lg: '3.5rem' } }}>
            Grow Your<br />Business
          </Typography>
          <Typography variant='body1' sx={{ opacity: 0.85, lineHeight: 1.8, maxWidth: 380, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
            One flat monthly fee. Get listed on the map, issue entries to your customers, and compete in the monthly campaign.
          </Typography>
        </Box>

        <Stack spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
          {FEATURES.map((f, i) => (
            <Stack key={i} direction='row' alignItems='center' spacing={2}>
              <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: ALPHA_WHITE_15, border: `1px solid ${ALPHA_WHITE_20}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {f.icon}
              </Box>
              <Typography variant='body2' fontWeight={600} sx={{ opacity: 0.9, lineHeight: 1.5 }}>
                {f.text}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Typography variant='caption' sx={{ opacity: 0.5, display: { xs: 'none', md: 'block' } }}>
          Simple monthly subscription. Cancel anytime.
        </Typography>
      </Box>

      {/* ── Right wizard panel ── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: { xs: 3, sm: 4, md: '4vh 4vw' },
          overflowY: 'auto',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: { xs: '100%', sm: 520, md: 560 } }}>
          <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>

            {/* Step indicator */}
            <Box sx={{ px: { xs: 3, md: 4 }, pt: { xs: 3, md: 4 }, pb: 0 }}>
              <StepIndicator currentStep={step} />
            </Box>

            {/* Header - animated per step */}
            <AnimatePresence mode='wait'>
              <motion.div
                key={`header-${step}`}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.18 }}
              >
                <Box
                  sx={{
                    px: { xs: 3, md: 4 },
                    pb: 3,
                    background: 'linear-gradient(135deg, rgba(2,146,183,0.04) 0%, rgba(66,189,186,0.06) 100%)',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Stack direction='row' alignItems='center' spacing={1} mb={0.75}>
                    {step > 1 && (
                      <IconButton size='small' onClick={() => setStep(step - 1)} sx={{ p: 0.5, color: 'text.secondary', '&:hover': { bgcolor: 'transparent', color: 'text.primary' } }}>
                        <ArrowBack sx={{ fontSize: 22 }} />
                      </IconButton>
                    )}
                    <Typography variant='h4' fontWeight={900} color='text.primary' lineHeight={1.15}>
                      {copy.headline}
                    </Typography>
                  </Stack>
                  <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
                    {copy.sub}
                  </Typography>
                </Box>
              </motion.div>
            </AnimatePresence>

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
                    existingImageUrl={undefined}
                    isSaving={isSaving}
                    onSave={handleSaveReceipt}
                    onContinue={() => setStep(3)}
                    onSkip={() => setStep(3)}
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
                  />
                </motion.div>
              )}

            </AnimatePresence>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default SubscribePage;

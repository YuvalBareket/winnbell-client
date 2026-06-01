import {
  Box, Button, Typography, Stack, Divider, Skeleton,
  IconButton, CircularProgress, FormControlLabel, Checkbox,
} from '@mui/material';
import { Remove, Add, CreditCard, WorkspacePremium, CheckCircle } from '@mui/icons-material';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TIER_MAP, TIER_KEYS, MAX_TIER } from './subscribeTiers';
import { useFoundingAvailability } from '../../hooks/useFoundingAvailability';

interface Props {
  selectedTier: number;
  setSelectedTier: (t: number) => void;
  locationCount: number | null;
  loading: boolean;
  foundingLoading: boolean;
  error: string;
  onSubscribe: () => void;
  onFoundingSubscribe: () => void;
  onSkip: () => void;
}

const FOUNDING_ENTRIES = 1000;
const FOUNDING_PRICE   = 1200;

const SubscribeStep3 = ({
  selectedTier, setSelectedTier,
  locationCount, loading, foundingLoading, error,
  onSubscribe, onFoundingSubscribe, onSkip,
}: Props) => {
  const { data: founding } = useFoundingAvailability();
  const [foundingMode, setFoundingMode] = useState(false);

  const effectiveLocations  = locationCount || 1;
  const foundingAvailable = founding && founding.active && founding.remaining > 0 && effectiveLocations <= 3;

  // Regular plan values
  const pricePerLocation    = TIER_MAP[selectedTier] ?? 0;

  // Savings vs regular monthly plan
  const regularMonthlyForFounding = TIER_MAP[FOUNDING_ENTRIES] ?? 0;
  const regularYearlyCost = regularMonthlyForFounding * effectiveLocations * 12;
  const foundingSaving = regularYearlyCost - FOUNDING_PRICE;
  const totalMonthly        = pricePerLocation * effectiveLocations;
  const currentIndex        = TIER_KEYS.indexOf(selectedTier);
  const atMin               = currentIndex === 0;
  const atMax               = currentIndex === TIER_KEYS.length - 1;

  return (
    <Box sx={{ px: { xs: 3, md: 4 }, py: { xs: 3, md: 4 } }}>

      {/* ── Founding Partner selector banner (shown when active + spots remain) ── */}
      <AnimatePresence>
      {foundingAvailable && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{ marginBottom: 0 }}
        >
        <Box
          onClick={() => !foundingLoading && !loading && setFoundingMode(m => !m)}
          sx={{
            mb: 4, p: 3.5, borderRadius: 3, cursor: 'pointer',
            position: 'relative', overflow: 'hidden',
            border: foundingMode ? '2px solid #f59e0b' : '1.5px solid rgba(245,158,11,0.4)',
            background: foundingMode
              ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)'
              : 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 50%, #fbbf24 100%)',
            boxShadow: foundingMode
              ? '0 8px 32px rgba(245,158,11,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
              : '0 4px 16px rgba(245,158,11,0.15)',
            transition: 'all 0.24s cubic-bezier(0.34, 1.56, 0.64, 1)',
            '&:hover': {
              borderColor: '#f59e0b',
              boxShadow: foundingMode
                ? '0 10px 40px rgba(245,158,11,0.35), inset 0 1px 0 rgba(255,255,255,0.4)'
                : '0 6px 24px rgba(245,158,11,0.25)',
              transform: 'translateY(-2px)',
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%', right: '-50%',
              width: '300px', height: '300px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none',
            },
          }}
        >
          <Stack direction='column' spacing={2.5} position='relative' zIndex={1}>
            {/* Badge + Headline row */}
            <Stack direction='row' alignItems='flex-start' justifyContent='space-between'>
              <Stack direction='column' spacing={1} flex={1}>
                {/* Badge */}
                <Box
                  sx={{
                    display: 'inline-flex',
                    px: 1.5, py: 0.5,
                    bgcolor: 'rgba(0,0,0,0.08)',
                    borderRadius: 1,
                    width: 'fit-content',
                  }}
                >
                  <Typography
                    variant='caption'
                    fontWeight={900}
                    color='#7c2d12'
                    sx={{ letterSpacing: '0.08em', fontSize: '0.7rem' }}
                  >
                    FOUNDING PARTNER
                  </Typography>
                </Box>

                {/* Headline */}
                <Typography
                  variant='h4'
                  fontWeight={900}
                  sx={{
                    color: foundingMode ? '#fff' : '#78350f',
                    lineHeight: 1.1,
                    textShadow: foundingMode ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  Limited Offer
                </Typography>
              </Stack>

              {/* Crown/Premium icon or Selected checkmark */}
              {foundingMode ? (
                <CheckCircle
                  sx={{
                    color: '#fff',
                    fontSize: 28,
                    flexShrink: 0,
                    ml: 2,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
                  }}
                />
              ) : (
                <WorkspacePremium
                  sx={{
                    color: '#92400e',
                    fontSize: 24,
                    flexShrink: 0,
                    ml: 2,
                  }}
                />
              )}
            </Stack>

            {/* Spots counter + CTA row */}
            <Stack direction='row' alignItems='center' justifyContent='space-between'>
              {/* Spots pill */}
              {founding.remaining <= 10 && (
                <Box
                  sx={{
                    px: 1.75, py: 0.75,
                    borderRadius: 2,
                    bgcolor: founding.remaining <= 5
                      ? 'rgba(239,68,68,0.15)'
                      : 'rgba(0,0,0,0.06)',
                    border: founding.remaining <= 5
                      ? '1px solid rgba(239,68,68,0.3)'
                      : '1px solid rgba(0,0,0,0.1)',
                  }}
                >
                  <Typography
                    variant='caption'
                    fontWeight={700}
                    sx={{
                      color: founding.remaining <= 5 ? '#dc2626' : '#92400e',
                      fontSize: '0.8rem',
                    }}
                  >
                    {founding.remaining} of {founding.cap} spots left
                  </Typography>
                </Box>
              )}

              {/* CTA hint */}
              {!foundingMode && (
                <Typography
                  variant='caption'
                  sx={{
                    color: '#92400e',
                    fontStyle: 'italic',
                    fontWeight: 500,
                    opacity: 0.7,
                  }}
                >
                  Tap to claim your spot →
                </Typography>
              )}
            </Stack>
          </Stack>
        </Box>
        </motion.div>
      )}
      </AnimatePresence>

      {/* ── FOUNDING MODE: details ── */}
      {foundingMode ? (
        <>
          <Typography variant='h6' fontWeight={700} mb={0.5}>Entries per location</Typography>
          <Typography variant='caption' color='text.secondary' display='block' mb={3}>per month</Typography>

          <Stack direction='row' alignItems='center' justifyContent='center' spacing={2} sx={{ mb: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant='h4' fontWeight={900}>
                {FOUNDING_ENTRIES.toLocaleString()} entries
              </Typography>
              <Typography variant='body2' color='text.secondary' mt={1}>
                per location / month
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ bgcolor: 'rgba(245,158,11,0.06)', borderRadius: 2.5, p: 3, mb: 3, border: '1px solid rgba(245,158,11,0.2)' }}>
            <Stack spacing={2}>
              <Stack direction='row' justifyContent='space-between'>
                <Typography variant='body2' color='text.secondary'>Entries per location</Typography>
                <Typography variant='body2' fontWeight={700}>{FOUNDING_ENTRIES.toLocaleString()} / mo</Typography>
              </Stack>
              <Stack direction='row' justifyContent='space-between'>
                <Typography variant='body2' color='text.secondary'>Your locations</Typography>
                {locationCount === null
                  ? <Skeleton width={40} height={20} />
                  : <Typography variant='body2' fontWeight={700}>{effectiveLocations}</Typography>}
              </Stack>
              <Stack direction='row' justifyContent='space-between'>
                <Typography variant='body2' color='text.secondary'>Duration</Typography>
                <Typography variant='body2' fontWeight={700}>Every campaign for 12 months</Typography>
              </Stack>
              <Divider />
              <Stack direction='row' justifyContent='space-between' alignItems='center'>
                <Typography variant='body2' fontWeight={700}>One-time total</Typography>
                <Typography variant='h5' fontWeight={900}
                  sx={{ background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  ${FOUNDING_PRICE.toLocaleString()}
                </Typography>
              </Stack>
              {foundingSaving > 0 && (
                <Stack direction='row' justifyContent='space-between' alignItems='center'
                  sx={{ bgcolor: 'rgba(22,163,74,0.08)', borderRadius: 1.5, px: 1.5, py: 1, border: '1px solid rgba(22,163,74,0.2)' }}>
                  <Typography variant='caption' fontWeight={700} color='#15803d'>You save</Typography>
                  <Typography variant='caption' fontWeight={900} color='#15803d'>
                    ${foundingSaving.toLocaleString()} vs regular plan
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>

          {error && <Typography variant='body2' color='error' textAlign='center' mb={2}>{error}</Typography>}

          <Button
            fullWidth variant='contained' size='large'
            startIcon={foundingLoading ? undefined : <WorkspacePremium />}
            onClick={onFoundingSubscribe}
            disabled={foundingLoading || loading}
            sx={{
              py: 1.875, borderRadius: 3, fontWeight: 800, fontSize: '1rem', textTransform: 'none',
              bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' },
              boxShadow: '0 4px 14px rgba(245,158,11,0.4)',
              '&:hover .MuiButton-root': { boxShadow: '0 6px 20px rgba(245,158,11,0.5)' },
            }}
          >
            {foundingLoading
              ? <CircularProgress size={24} color='inherit' />
              : 'Claim Your Founding Spot'}
          </Button>

          <Typography variant='caption' color='text.disabled' textAlign='center' display='block' mt={1.5}>
            You'll be redirected to Stripe's secure checkout. One-time payment, no recurring charges.
          </Typography>

          <Button fullWidth variant='text' size='small' onClick={() => setFoundingMode(false)}
            sx={{ mt: 1, color: 'text.disabled', fontWeight: 600, textTransform: 'none' }}>
            Switch to regular monthly plan
          </Button>
        </>
      ) : (
        <>
          {/* ── REGULAR MODE: tier stepper + price breakdown ── */}
          <Typography variant='h6' fontWeight={700} mb={0.5}>How many entries per location?</Typography>
          <Typography variant='caption' color='text.secondary' display='block' mb={3}>per month</Typography>

          <Stack direction='row' alignItems='center' justifyContent='center' spacing={2} sx={{ mb: 4 }}>
            <IconButton onClick={() => setSelectedTier(TIER_KEYS[currentIndex - 1])} disabled={atMin}
              sx={{ width: 52, height: 52, border: '2px solid', borderColor: 'divider', borderRadius: 2, opacity: atMin ? 0.4 : 1 }}>
              <Remove />
            </IconButton>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant='h4' fontWeight={900} sx={{ minWidth: { xs: 160, md: 200 } }}>
                {selectedTier.toLocaleString()} entries
              </Typography>
              <Typography variant='body2' color='text.secondary' mt={1}>
                ${pricePerLocation.toLocaleString()} per location / month
              </Typography>
            </Box>
            <IconButton onClick={() => setSelectedTier(TIER_KEYS[currentIndex + 1])} disabled={atMax}
              sx={{ width: 52, height: 52, border: '2px solid', borderColor: 'divider', borderRadius: 2, opacity: atMax ? 0.4 : 1 }}>
              <Add />
            </IconButton>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ bgcolor: 'rgba(2,146,183,0.06)', borderRadius: 2.5, p: 3, mb: 3 }}>
            <Stack spacing={2}>
              <Stack direction='row' justifyContent='space-between'>
                <Typography variant='body2' color='text.secondary'>Entries per location</Typography>
                <Typography variant='body2' fontWeight={700}>{selectedTier.toLocaleString()} / mo</Typography>
              </Stack>
              <Stack direction='row' justifyContent='space-between'>
                <Typography variant='body2' color='text.secondary'>Your locations</Typography>
                {locationCount === null
                  ? <Skeleton width={40} height={20} />
                  : <Typography variant='body2' fontWeight={700}>{effectiveLocations}</Typography>}
              </Stack>
              <Stack direction='row' justifyContent='space-between'>
                <Typography variant='body2' color='text.secondary'>Price per location</Typography>
                <Typography variant='body2' fontWeight={700}>${pricePerLocation.toLocaleString()}</Typography>
              </Stack>
              <Divider />
              <Stack direction='row' justifyContent='space-between' alignItems='center'>
                <Typography variant='body2' fontWeight={700}>Total per month</Typography>
                <Typography variant='h5' fontWeight={900}
                  sx={{ background: 'linear-gradient(135deg, #0292b7 0%, #42bdba 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  ${totalMonthly.toFixed(0)}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          {atMax && (
            <Typography variant='body2' textAlign='center' sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.6 }}>
              Need more than {MAX_TIER.toLocaleString()} entries?{' '}
              <Typography component='span' variant='body2' sx={{ color: 'primary.main', fontWeight: 700, cursor: 'pointer' }}
                onClick={() => { window.location.href = 'mailto:support@winnbell.com'; }}>
                Contact us
              </Typography>{' '}for a custom plan.
            </Typography>
          )}

          {error && <Typography variant='body2' color='error' textAlign='center' mb={2}>{error}</Typography>}

          <FormControlLabel
            sx={{ mb: 2, display: 'flex', alignItems: 'flex-start', gap: 0.5 }}
            control={<Checkbox defaultChecked size='small' sx={{ pt: 0 }} />}
            label={
              <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.5 }}>
                Automatically renew for next campaign - cancel anytime before the 7-day cutoff
              </Typography>
            }
          />

          <Button fullWidth variant='contained' size='large'
            startIcon={loading ? undefined : <CreditCard />}
            onClick={onSubscribe}
            disabled={loading || foundingLoading}
            sx={{ py: 1.875, borderRadius: 3, fontWeight: 800, fontSize: '1rem', textTransform: 'none', boxShadow: '0 4px 14px rgba(2,146,183,0.35)', '&:hover': { boxShadow: '0 6px 20px rgba(2,146,183,0.45)' } }}>
            {loading ? <CircularProgress size={24} color='inherit' /> : 'Start Campaign'}
          </Button>

          <Typography variant='caption' color='text.disabled' textAlign='center' display='block' mt={1.5}>
            You'll be redirected to Stripe's secure checkout. You'll be enrolled in the next monthly campaign on payment.
          </Typography>

          <Button fullWidth variant='text' size='small' onClick={onSkip}
            sx={{ mt: 1.5, color: 'text.disabled', fontWeight: 600, textTransform: 'none' }}>
            I'll do it later
          </Button>
        </>
      )}

    </Box>
  );
};

export default SubscribeStep3;

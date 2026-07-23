import {
  Box, Button, Typography, Stack, Divider,
  CircularProgress, IconButton, Checkbox, FormControlLabel,
} from '@mui/material';
import { WorkspacePremium, ArrowBack, Check, CreditCard, LockOutlined } from '@mui/icons-material';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TIER_MAP, MAX_TIER, PLAN_META } from './subscribeTiers';
import PlanCards from './PlanCards';
import { useFoundingAvailability } from '../../hooks/useFoundingAvailability';
import { useSubscription } from '../../hooks/useSubscription';
import {
  PRIMARY_DEEP,
  ALPHA_WHITE_85,
  ALPHA_WHITE_70,
  TEXT_TERTIARY,
  TEXT_EMPHASIS,
  STATUS_ACTIVATED_TEXT,
  GOLD_SOFT,
  GOLD_TROPHY,
  GOLD_INK,
  GOLD_TINT_IVORY,
  GOLD_TINT_CREAM,
  AMBER_HOURGLASS,
  ALPHA_GREEN_10,
} from '../../../../shared/colors';

// Gold gradients for the founding offer (light gold to amber).
const GOLD_GRADIENT = `linear-gradient(135deg, ${GOLD_SOFT}, ${AMBER_HOURGLASS})`;
const GOLD_GRADIENT_BAR = `linear-gradient(90deg, ${GOLD_SOFT}, ${AMBER_HOURGLASS})`;

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
  onBack?: () => void;
}

const FOUNDING_ENTRIES = 2500;
const FOUNDING_PRICE   = 1200;

const PlanCheckout = ({
  selectedTier, setSelectedTier,
  locationCount, loading, foundingLoading, error,
  onSubscribe, onFoundingSubscribe, onSkip, onBack,
}: Props) => {
  const { data: founding } = useFoundingAvailability();
  const { data: existingSub } = useSubscription();
  const [foundingMode, setFoundingMode] = useState(false);
  // Founding Partner Special Terms: enrollment requires explicit electronic acceptance
  // (fixed 12-month term, immediate charge, no cancellation refund) before checkout.
  const [foundingTermsAccepted, setFoundingTermsAccepted] = useState(false);
  const [foundingTermsError, setFoundingTermsError] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  // Selecting a plan reveals the Start Campaign action (esp. on mobile, where the
  // summary bar sits below the cards).
  const handleSelectTier = (tier: number) => {
    setSelectedTier(tier);
    requestAnimationFrame(() => {
      summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const effectiveLocations  = locationCount || 1;
  // Hide the founding offer from a business that already holds a live subscription row -
  // in particular a founding member in their transition window, who is here to start a
  // REGULAR plan (the server rejects a second founding purchase for them anyway).
  const hasLiveSubscription = !!existingSub && existingSub.status !== 'Cancelled';
  // Per-location pricing: founding is open to any business size ($1,200 x locations).
  const foundingAvailable = founding && founding.active && founding.remaining > 0 && !hasLiveSubscription;

  // Regular plan values
  const pricePerLocation    = TIER_MAP[selectedTier] ?? 0;

  // Founding totals + savings vs regular monthly plan (both scale with location count)
  const foundingTotal = FOUNDING_PRICE * effectiveLocations;
  const regularMonthlyForFounding = TIER_MAP[FOUNDING_ENTRIES] ?? 0;
  const regularYearlyCost = regularMonthlyForFounding * effectiveLocations * 12;
  const foundingSaving = regularYearlyCost - foundingTotal;
  const totalMonthly        = pricePerLocation * effectiveLocations;

  return (
    <Box sx={{ px: { xs: 0, md: 4 }, pt: { xs: 0.5, md: 2 }, pb: { xs: 2, md: 4 } }}>

      {/* Back button (regular mode only) */}
      {!foundingMode && onBack && (
        <IconButton onClick={onBack} size='small' aria-label='Back' sx={{ ml: -0.75, mb: 1, color: TEXT_TERTIARY }}>
          <ArrowBack sx={{ fontSize: 22 }} />
        </IconButton>
      )}

      {/* ── Founding Partner card (shown when active + spots remain) ── */}
      <AnimatePresence>
      {foundingAvailable && !foundingMode && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{ marginBottom: 0 }}
        >
        <motion.div whileHover={{ scale: 1.012 }} whileTap={{ scale: 0.995 }} animate={{ scale: [1, 1.012, 1] }} transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}>
        <Box
          onClick={() => { if (!foundingLoading && !loading) { setFoundingMode(m => !m); setFoundingTermsError(false); } }}
          sx={{
            mb: { xs: '26px', md: '30px' }, mt: { xs: 1.5, md: 0 },
            p: '2px',
            borderRadius: '18px',
            cursor: 'pointer',
            // Gold gradient acts as the border; the card itself is white inside.
            background: `linear-gradient(135deg, ${GOLD_SOFT}, ${GOLD_TROPHY} 40%, ${AMBER_HOURGLASS} 75%, ${GOLD_SOFT})`,
            boxShadow: '0 10px 30px -14px rgba(245,158,11,0.4)',
            transition: 'box-shadow 0.24s ease',
            '&:hover': { boxShadow: '0 14px 38px -12px rgba(245,158,11,0.5)' },
          }}
        >
          {/* Inner white card with soft gold glow accents */}
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '16px',
              background: `linear-gradient(120deg, #ffffff 0%, ${GOLD_TINT_IVORY} 55%, ${GOLD_TINT_CREAM} 100%)`,
              px: { xs: 2.5, md: 3.5 }, py: { xs: 2.5, md: 3 },
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'stretch', md: 'center' },
              justifyContent: { xs: 'flex-start', md: 'space-between' },
              gap: { xs: 2.5, md: 3 },
            }}
          >
            {/* gold glow accents */}
            <Box sx={{ position: 'absolute', top: -80, right: 40, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.28), transparent 70%)', pointerEvents: 'none' }} />
            <Box sx={{ position: 'absolute', bottom: -80, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.18), transparent 70%)', pointerEvents: 'none' }} />

          {/* LEFT GROUP: Icon + Text */}
          <Stack
            direction='row'
            alignItems='center'
            spacing={2}
            flex={1}
            position='relative'
            zIndex={1}
            sx={{ minWidth: 0 }}
          >
            {/* Icon tile */}
            <Box
              sx={{
                width: 56, height: 56,
                borderRadius: '15px',
                background: GOLD_GRADIENT,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 8px 20px -6px rgba(245,158,11,0.55)',
              }}
            >
              <WorkspacePremium sx={{ color: GOLD_INK, fontSize: 32 }} />
            </Box>

            {/* Text column */}
            <Stack spacing={1.25} flex={1} sx={{ minWidth: 0 }}>
              {/* Pill + Spots indicator row */}
              <Stack
                direction='row'
                alignItems='center'
                spacing={1.5}
                sx={{ flexWrap: 'wrap', gap: 1 }}
              >
                {/* FOUNDING PARTNER pill */}
                <Box
                  sx={{
                    display: 'inline-flex',
                    px: '11px', py: '4px',
                    background: `linear-gradient(135deg, ${GOLD_SOFT}, ${GOLD_TROPHY})`,
                    borderRadius: '6px',
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '11px',
                      fontWeight: 900,
                      letterSpacing: '0.12em',
                      color: GOLD_INK,
                    }}
                  >
                    FOUNDING PARTNER
                  </Typography>
                </Box>
              </Stack>

              {/* Headline */}
              <Typography
                sx={{
                  fontSize: { xs: '1.5rem', md: '1.7rem' },
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  color: GOLD_INK,
                  lineHeight: 1.1,
                }}
              >
                Limited Offer
              </Typography>
            </Stack>
          </Stack>

          {/* Claim - right side, same row as the text */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.75,
              alignSelf: { xs: 'stretch', md: 'center' },
              width: { xs: '100%', md: 'auto' },
              background: GOLD_GRADIENT,
              color: GOLD_INK,
              fontWeight: 900,
              fontSize: '0.9rem',
              px: 2.5,
              py: 1.25,
              borderRadius: '12px',
              whiteSpace: 'nowrap',
              boxShadow: '0 8px 20px -8px rgba(245,158,11,0.5)',
            }}
          >
            {foundingMode ? 'Choose a plan' : 'Claim your spot'}
          </Box>
          </Box>

        </Box>
        </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* ── FOUNDING MODE: details ── */}
      {foundingMode ? (
        <>
          {/* ── FOUNDING MODE: confirm + order summary (two-column) ── */}
          <Stack direction='row' alignItems='center' spacing={0.5}>
            <IconButton
              onClick={() => { if (!foundingLoading) { setFoundingMode(false); setFoundingTermsError(false); } }}
              size='small'
              aria-label='Back to plans'
              sx={{ ml: -0.75, color: TEXT_TERTIARY }}
            >
              <ArrowBack sx={{ fontSize: 22 }} />
            </IconButton>
            <Typography sx={{ fontSize: { xs: 20, md: 24 }, fontWeight: 800, letterSpacing: '-0.02em', color: PRIMARY_DEEP }}>
              Confirm your Founding Partner plan
            </Typography>
          </Stack>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5, mb: 3 }}>
            One-time payment for a full year of campaigns. Review and claim your spot.
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 360px' }, gap: { xs: 2, md: 3 }, alignItems: 'start' }}>

            {/* LEFT: what's included (desktop only) */}
            <Box sx={{ display: { xs: 'none', md: 'block' }, borderRadius: '18px', overflow: 'hidden', border: '1px solid', borderColor: 'divider', boxShadow: '0 8px 22px -14px rgba(15,39,71,0.18)', background: '#fff' }}>
              <Box sx={{ height: 5, background: GOLD_GRADIENT_BAR }} />
              <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <Stack direction='row' alignItems='center' spacing={2}>
                  <Box sx={{ width: 52, height: 52, borderRadius: '14px', background: GOLD_GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 8px 18px -8px rgba(245,158,11,0.6)' }}>
                    <WorkspacePremium sx={{ color: GOLD_INK, fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Stack direction='row' alignItems='center' spacing={1}>
                      <Typography sx={{ fontSize: 16, fontWeight: 900, color: PRIMARY_DEEP }}>Founding Partner</Typography>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, bgcolor: ALPHA_GREEN_10, borderRadius: '999px', px: 1, py: '3px' }}>
                        <Check sx={{ fontSize: 13, color: STATUS_ACTIVATED_TEXT }} />
                        <Typography sx={{ fontSize: 11, fontWeight: 800, color: STATUS_ACTIVATED_TEXT }}>Selected</Typography>
                      </Box>
                    </Stack>
                    <Typography variant='caption' color='text.secondary'>Locked-in founding rate for a full year</Typography>
                  </Box>
                </Stack>

                <Divider sx={{ my: 2.5 }} />

                <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary', mb: 1.5 }}>
                  What&apos;s included
                </Typography>
                <Stack spacing={1.5}>
                  {[
                    <><b style={{ color: PRIMARY_DEEP }}>{FOUNDING_ENTRIES.toLocaleString()} entries</b> per location in every campaign</>,
                    <>All campaigns for a full <b style={{ color: PRIMARY_DEEP }}>12 months</b></>,
                    <><b style={{ color: PRIMARY_DEEP }}>One-time payment</b>. No monthly bill for 12 months</>,
                    <>Your locations shown on the <b style={{ color: PRIMARY_DEEP }}>Winnbell map</b></>,
                  ].map((node, i) => (
                    <Stack key={i} direction='row' spacing={1.25} alignItems='flex-start'>
                      <Check sx={{ fontSize: 18, color: AMBER_HOURGLASS, flexShrink: 0, mt: '1px' }} />
                      <Typography sx={{ fontSize: 13.5, color: TEXT_EMPHASIS, lineHeight: 1.45 }}>{node}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Box>

            {/* RIGHT: order summary */}
            <Box sx={{ borderRadius: '18px', overflow: 'hidden', border: '1px solid', borderColor: 'divider', boxShadow: '0 8px 22px -14px rgba(15,39,71,0.18)', background: '#fff', position: { md: 'sticky' }, top: 20 }}>
              <Box sx={{ height: 5, background: GOLD_GRADIENT_BAR }} />
              <Box sx={{ p: { xs: 2.5, md: 3 } }}>
                <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary', mb: 2 }}>
                  Order summary
                </Typography>

                {foundingSaving > 0 && (
                  <>
                    <Stack direction='row' justifyContent='space-between' sx={{ mb: 1.5 }}>
                      <Typography variant='body2' color='text.secondary' fontWeight={600}>Regular plan &middot; 12 mo</Typography>
                      <Typography variant='body2' color='text.secondary' fontWeight={600} sx={{ textDecoration: 'line-through' }}>${regularYearlyCost.toLocaleString()}</Typography>
                    </Stack>
                    <Stack direction='row' justifyContent='space-between' sx={{ mb: 2 }}>
                      <Typography variant='body2' color='text.secondary' fontWeight={600}>Founding discount</Typography>
                      <Typography variant='body2' fontWeight={800} color={STATUS_ACTIVATED_TEXT}>-${foundingSaving.toLocaleString()}</Typography>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />
                  </>
                )}

                {effectiveLocations > 1 && (
                  <Stack direction='row' justifyContent='space-between' sx={{ mb: 1 }}>
                    <Typography variant='body2' color='text.secondary' fontWeight={600}>
                      {effectiveLocations} locations &times; ${FOUNDING_PRICE.toLocaleString()}
                    </Typography>
                  </Stack>
                )}
                <Stack direction='row' justifyContent='space-between' alignItems='flex-end' sx={{ mb: 0.5 }}>
                  <Typography variant='body2' color='text.secondary' fontWeight={700}>Total today</Typography>
                  <Typography sx={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.02em', color: PRIMARY_DEEP, lineHeight: 1 }}>${foundingTotal.toLocaleString()}</Typography>
                </Stack>
                <Typography sx={{ textAlign: 'right', fontSize: 11.5, color: 'text.secondary', fontWeight: 600, mb: 2.5 }}>
                  $1,200 per location &middot; then $0 / month for 12 months
                </Typography>

                {error && <Typography variant='body2' color='error' textAlign='center' mb={1.5}>{error}</Typography>}

                {/* Founding Partner Special Terms acceptance (electronic signature per the
                    Terms' Section 9). The claim button stays enabled; clicking without
                    accepting surfaces the inline error below instead of a dead button. */}
                    <Stack sx={{mb:1.5}}>
                <FormControlLabel
                  sx={{ alignItems: 'flex-start', mr: 0 }}
                  control={
                    <Checkbox
                      size='small'
                      checked={foundingTermsAccepted}
                      onChange={(e) => { setFoundingTermsAccepted(e.target.checked); if (e.target.checked) setFoundingTermsError(false); }}
                      sx={{ mt: -0.5 }}
                    />
                  }
                  label={
                    <Typography variant='caption' color='text.secondary' sx={{ lineHeight: 1.5 }}>
                      I agree to the{' '}
                      <Box
                        component='a'
                        href='/founding-terms'
                        target='_blank'
                        rel='noopener'
                        onClick={(e) => e.stopPropagation()}
                        sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'underline' }}
                      >
                        Founding Partner Special Terms
                      </Box>
                      {' '}(a fixed 12-month plan, charged in full today, with no refund for early cancellation).
                    </Typography>
                  }
                />
                <AnimatePresence>
                  {foundingTermsError && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Typography variant='caption' color='error.main' fontWeight={700} display='block' sx={{ mb: 1 }}>
                        Please accept the Founding Partner Special Terms to continue.
                      </Typography>
                    </motion.div>
                  )}
                </AnimatePresence>
</Stack>
                {/* Dimmed (but still clickable - clicking surfaces the inline error) until the
                    Special Terms box is checked; lights up to full gold once accepted. */}
                <Button
                  fullWidth
                  onClick={() => {
                    if (!foundingTermsAccepted) { setFoundingTermsError(true); return; }
                    onFoundingSubscribe();
                  }}
                  disabled={foundingLoading || loading}
                  startIcon={foundingLoading ? undefined : <CreditCard sx={{ fontSize: 18 }} />}
                  sx={{
                    background: GOLD_GRADIENT,
                    color: GOLD_INK, fontWeight: 900, fontSize: 15, borderRadius: '13px',
                    py: '13px', textTransform: 'none',
                    opacity: foundingTermsAccepted ? 1 : 0.5,
                    filter: foundingTermsAccepted ? 'none' : 'saturate(0.5)',
                    boxShadow: foundingTermsAccepted ? '0 12px 26px -12px rgba(245,158,11,0.7)' : 'none',
                    transition: 'opacity 0.25s ease, filter 0.25s ease, box-shadow 0.25s ease',
                    '&:hover': {
                      background: GOLD_GRADIENT,
                      boxShadow: foundingTermsAccepted ? '0 16px 30px -10px rgba(245,158,11,0.75)' : 'none',
                    },
                    '&.Mui-disabled': { opacity: 0.7, color: GOLD_INK },
                  }}
                >
                  {foundingLoading ? <CircularProgress size={22} sx={{ color: GOLD_INK }} /> : 'Claim Founding Spot'}
                </Button>

                <Stack direction='row' alignItems='center' justifyContent='center' spacing={0.75} sx={{ mt: 1.5 }}>
                  <LockOutlined sx={{ fontSize: 13, color: 'text.secondary' }} />
                  <Typography variant='caption' color='text.secondary'>Secure one-time payment</Typography>
                </Stack>

                <Typography variant='caption' color='text.secondary' textAlign='center' display='block' sx={{ mt: 1.25, lineHeight: 1.5 }}>
                  Charged once today. Your locations join the next campaign, since the current one is already open.
                </Typography>
                <Typography variant='caption' color='text.secondary' textAlign='center' display='block' sx={{ mt: 0.75 }}>
                  Covers your current {effectiveLocations === 1 ? 'location' : `${effectiveLocations} locations`} for the full year. Locations are fixed for the founding year.
                </Typography>

                <Box sx={{ textAlign: 'center', mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant='caption' color='text.secondary'>
                    Prefer monthly?{' '}
                    <Box component='span' onClick={() => { if (!foundingLoading) { setFoundingMode(false); setFoundingTermsError(false); } }} sx={{ color: 'primary.main', fontWeight: 700, cursor: 'pointer' }}>
                      Back to plans
                    </Box>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </>
      ) : (
        <>
          {/* ── REGULAR MODE: 3-plan picker + dark summary bar ── */}
          <Box sx={{ mb: 3 }}>
            <PlanCards selectedTier={selectedTier} onSelect={handleSelectTier} disabled={loading || foundingLoading} />
          </Box>

          {/* ── Dark summary bar ── */}
          <Box
            ref={summaryRef}
            sx={{
              background: PRIMARY_DEEP,
              borderRadius: '16px',
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
              flexWrap: 'wrap',
              mb: 1.75,
            }}
          >
            {/* Left: plan summary */}
            <Typography
              sx={{
                color: ALPHA_WHITE_85,
                fontSize: '13.5px',
                fontWeight: 600,
                lineHeight: 1.5,
              }}
            >
              {PLAN_META[selectedTier]?.name ?? ''}
              {' · '}
              {selectedTier.toLocaleString()} entries
              {' · '}
              <Box component='span' sx={{ color: '#fff' }}>
                {locationCount === null ? '?' : effectiveLocations} location{effectiveLocations !== 1 ? 's' : ''}
              </Box>
              {' · '}
              <Box component='span' sx={{ color: ALPHA_WHITE_70 }}>
                billed monthly
              </Box>
            </Typography>

            {/* Right: total + button */}
            <Stack direction='row' alignItems='center' gap={2.5}>
              {/* Total label + price */}
              <Box sx={{ textAlign: 'right' }}>
                <Typography
                  sx={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: ALPHA_WHITE_70,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Total / month
                </Typography>
                <Typography
                  sx={{
                    fontSize: '26px',
                    fontWeight: 900,
                    letterSpacing: '-0.02em',
                    color: '#fff',
                  }}
                >
                  ${totalMonthly.toFixed(0)}
                </Typography>
              </Box>

              {/* CTA button */}
              <Button
                variant='contained'
                onClick={onSubscribe}
                disabled={loading || foundingLoading}
                sx={{
                  background: '#fff',
                  color: PRIMARY_DEEP,
                  fontSize: '15px',
                  fontWeight: 800,
                  borderRadius: '12px',
                  padding: '14px 24px',
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    background: '#f5f5f5',
                  },
                  '&:disabled': {
                    background: '#ccc',
                    color: '#666',
                  },
                }}
              >
                {loading ? <CircularProgress size={20} color='inherit' sx={{ mr: 1 }} /> : null}
                Start Campaign
              </Button>
            </Stack>
          </Box>

          {/* ── Footnote lines ── */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems='center'
            justifyContent='center'
            gap={0.5}
            sx={{ flexWrap: 'wrap', mb: 3 }}
          >
            <Typography
              sx={{
                fontSize: '11.5px',
                color: TEXT_TERTIARY,
                fontWeight: 500,
              }}
            >
              Billed on the 24th each month | the participation start from the next campaign, since this one is already open
            </Typography>
            <Typography
              sx={{
                fontSize: '11.5px',
                color: TEXT_TERTIARY,
                fontWeight: 500,
              }}
            >
             | Need more than {MAX_TIER.toLocaleString()} entries?{' '}
              <Box
                component='span'
                onClick={() => { window.location.href = 'mailto:support@winnbell.com'; }}
                sx={{
                  color: 'primary.main',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Contact us
              </Box>
            </Typography>
          </Stack>

          {error && <Typography variant='body2' color='error' textAlign='center' mb={2}>{error}</Typography>}

          <Button fullWidth variant='text' size='small' onClick={onSkip}
            sx={{ color: 'text.disabled', fontWeight: 600, textTransform: 'none' }}>
            I'll do it later
          </Button>
        </>
      )}

    </Box>
  );
};

export default PlanCheckout;

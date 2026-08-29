import { type ReactNode } from 'react';
import { Box, Typography, Button, Stack, CircularProgress, useMediaQuery, useTheme } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AttractButton from './AttractButton';
import CampaignCountdown from './CampaignCountdown';
import AuthBrandPanel from '../../features/auth/components/AuthBrandPanel';
import { staggerContainer, popIn, riseIn } from '../motion';
import { formatCurrency } from '../utils/date';
import { goldShineSx } from '../../features/draw/components/goldShine';
import {
  GRADIENT_HERO, GRADIENT_CTA, ACCENT_GOLD, ACCENT_GOLD_DARK, GOLD_TROPHY,
  PRIMARY_MAIN, BG_SUBTLE, BG_SURFACE, TEXT_HEADING, TEXT_SECONDARY, TEXT_TERTIARY,
  ALPHA_PRIMARY_20, ALPHA_WHITE_80,
} from '../colors';

interface WelcomeInviteProps {
  // Small uppercase context marker above the hero sentence ("Invite from Sarah" /
  // "Scanned at Joe's"). Tells the visitor why this page is personalized.
  contextChip: { icon: ReactNode; label: string };
  brandHeadline: ReactNode; // AuthBrandPanel headline (desktop split panel)
  brandTagline: string;     // AuthBrandPanel tagline (desktop split panel)
  // The approved sentence's opening, ending right before the prize figure
  // ("Sarah sent you a head start toward the"). The sentence then breaks around
  // the gold prize numeral and closes with "cash prize draw."
  leadClause: ReactNode;
  prizeAmount: number | null; // null renders the sentence inline without the numeral
  subtext: string;
  steps: string[];          // three short stepper labels
  ctaLabel?: string;        // primary CTA text (both desktop and mobile)
  // True while the page's personalization queries are in flight - shows a branded
  // loader instead of flashing fallback copy that then swaps to the real name/prize.
  loading?: boolean;
  // Pre-campaign: the upcoming draw's start date (ISO). Renders a live ticking
  // countdown under the hero sentence so an early flyer scan builds anticipation
  // instead of reading as an empty page.
  opensAt?: string | null;
}

const FINE_PRINT = 'No purchase necessary to enter or win. 18+.';

// Branded interstitial while the referral/location lookup resolves: the same gradient
// the hero opens with, so the reveal reads as one continuous surface, not a swap.
const WelcomeLoading = () => (
  <Box
    role='status'
    aria-label='Loading'
    sx={{
      minHeight: 'var(--dvh100, 100dvh)',
      background: GRADIENT_HERO,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}
    >
      <Box component='img' src='/winnbell_app_name_white.svg' alt='Winnbell' sx={{ height: 38, width: 'auto' }} />
      <CircularProgress size={26} thickness={4} sx={{ color: 'white', opacity: 0.85 }} />
    </motion.div>
  </Box>
);

// Deeper gold ramp for the shimmer on white: the campaign card's light golds vanish
// against a white panel, so the sweep runs between the darker bronze tokens instead.
const GOLD_SHIMMER_ON_WHITE = `linear-gradient(90deg, ${ACCENT_GOLD_DARK} 0%, ${ACCENT_GOLD} 30%, ${GOLD_TROPHY} 50%, ${ACCENT_GOLD} 70%, ${ACCENT_GOLD_DARK} 100%)`;

// The prize numeral is the hook: the same shiny gold sweep as the My Entries campaign
// card (goldShineSx), everything else stays blue. inline-block contains the clipped
// background - an oversized background on a background-clip:text element reports
// phantom scroll overflow (see LandingHero).
const GoldAmount = ({ amount, onGradient, fontSize }: { amount: number; onGradient: boolean; fontSize: string }) => (
  <Box
    component='span'
    sx={{
      display: 'inline-block',
      fontSize,
      fontWeight: 900,
      lineHeight: 1.05,
      letterSpacing: '-0.02em',
      ...goldShineSx,
      ...(onGradient ? {} : { background: GOLD_SHIMMER_ON_WHITE, backgroundSize: '200% auto', filter: 'none' }),
      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
    }}
  >
    {formatCurrency(amount)}
  </Box>
);

// Numbered circle shared by both steppers - filled blue so the row of steps and the
// CTA speak the same color, with nothing competing against the gold numeral.
const StepCircle = ({ n, size }: { n: number; size: number }) => (
  <Box
    aria-hidden
    sx={{
      width: size,
      height: size,
      borderRadius: '50%',
      flexShrink: 0,
      bgcolor: PRIMARY_MAIN,
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.42,
      fontWeight: 800,
      boxShadow: '0 4px 10px rgba(21,101,192,0.25)',
    }}
  >
    {n}
  </Box>
);

// Mobile: vertical stepper - circles on a connecting line, label beside each.
const StepperVertical = ({ steps }: { steps: string[] }) => (
  <Box component='ol' sx={{ listStyle: 'none', m: 0, p: 0 }}>
    {steps.map((label, i) => (
      <Box component='li' key={label} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'stretch' }}>
          <StepCircle n={i + 1} size={30} />
          {i < steps.length - 1 && (
            <Box sx={{ width: 2, flex: 1, minHeight: 14, my: 0.5, borderRadius: 1, bgcolor: ALPHA_PRIMARY_20 }} />
          )}
        </Box>
        <Typography sx={{ pt: '5px', pb: i < steps.length - 1 ? 2.25 : 0, fontSize: '14.5px', fontWeight: 700, letterSpacing: '-0.01em', color: TEXT_HEADING }}>
          {label}
        </Typography>
      </Box>
    ))}
  </Box>
);

// Desktop: horizontal stepper - three circles on one connecting line, labels beneath.
const StepperHorizontal = ({ steps }: { steps: string[] }) => (
  <Box sx={{ position: 'relative' }}>
    <Box aria-hidden sx={{ position: 'absolute', top: 18, left: '16%', right: '16%', height: 2, borderRadius: 1, bgcolor: ALPHA_PRIMARY_20 }} />
    <Box component='ol' sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex' }}>
      {steps.map((label, i) => (
        <Box component='li' key={label} sx={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.25, px: 1 }}>
          <StepCircle n={i + 1} size={38} />
          <Typography sx={{ fontSize: '12.5px', fontWeight: 700, color: TEXT_HEADING, textAlign: 'center', lineHeight: 1.35 }}>
            {label}
          </Typography>
        </Box>
      ))}
    </Box>
  </Box>
);

// Shared "conversion hero" for logged-out visitors arriving via a referral link
// (JoinPage) or a location flyer QR (ScanWelcomePage). The hook is the prize
// number: the approved sentence breaks around the gold numeral, the steps are a
// numbered stepper instead of a card, and one gradient CTA is the only saturated
// color below the hero - no bordered cards competing for attention.
const WelcomeInvite = ({
  contextChip,
  brandHeadline,
  brandTagline,
  leadClause,
  prizeAmount,
  subtext,
  steps,
  ctaLabel = 'Create your free account',
  loading = false,
  opensAt,
}: WelcomeInviteProps) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Guard against a malformed amount from the API ("$NaN" hero would be worse than none).
  const prizeValue = prizeAmount != null && Number.isFinite(Number(prizeAmount)) && Number(prizeAmount) > 0
    ? Number(prizeAmount)
    : null;

  if (loading) return <WelcomeLoading />;

  // ─── Desktop: split screen (brand panel + white content panel), matching the auth pages ──
  if (isDesktop) {
    return (
      <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} sx={{ display: 'flex', height: 'var(--dvh100, 100dvh)', overflow: 'hidden' }}>
        <AuthBrandPanel headline={brandHeadline} tagline={brandTagline} bullets={[]} />

        {/* Right: white content panel - the only scroller on desktop */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            bgcolor: BG_SURFACE,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            px: 7,
            py: 6,
          }}
        >
          <Box sx={{ maxWidth: 520, width: '100%' }}>
            <motion.div variants={staggerContainer} initial='hidden' animate='visible'>
              {/* No context chip on desktop - the brand panel already tells the visitor
                  why the page is personalized; the chip is mobile-only. */}
              {/* The approved sentence, broken around the prize figure */}
              <motion.div variants={riseIn}>
                <Typography component='h1' sx={{ m: 0 }}>
                  <Box component='span' sx={{ display: 'block', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.3, color: TEXT_HEADING }}>
                    {leadClause}
                  </Box>
                  {prizeValue != null && (
                    <Box component='span' sx={{ display: 'block', my: 0.75 }}>
                      <GoldAmount amount={prizeValue} onGradient={false} fontSize='64px' />
                    </Box>
                  )}
                  <Box component='span' sx={{ display: 'block', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.3, color: TEXT_HEADING, mt: prizeValue != null ? 0 : 0.5 }}>
                    cash prize draw.
                  </Box>
                </Typography>
              </motion.div>

              {opensAt && <CampaignCountdown opensAt={opensAt} onGradient={false} />}

              <motion.div variants={riseIn}>
                <Typography sx={{ color: TEXT_SECONDARY, fontSize: '15.5px', fontWeight: 500, lineHeight: 1.55, mt: 2, mb: 3 }}>
                  {subtext}
                </Typography>
              </motion.div>

              <motion.div variants={popIn}>
                <Box sx={{ mb: 3.25, maxWidth: 480 }}>
                  <StepperHorizontal steps={steps} />
                </Box>
              </motion.div>

              {/* CTA + links + fine print */}
              <motion.div variants={riseIn}>
                <Stack spacing={1.5} sx={{ maxWidth: 420 }}>
                  <AttractButton
                    variant='contained'
                    size='large'
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/register')}
                    sx={{
                      fontWeight: 800,
                      fontSize: '1rem',
                      py: 2,
                      borderRadius: '14px',
                      textTransform: 'none',
                      background: GRADIENT_CTA,
                      boxShadow: '0 8px 20px rgba(21,101,192,0.3)',
                      '&:hover': { background: GRADIENT_CTA, boxShadow: '0 12px 28px rgba(21,101,192,0.4)' },
                    }}
                  >
                    {ctaLabel}
                  </AttractButton>
                  <Stack direction='row' alignItems='center' justifyContent='space-between'>
                    <Button
                      variant='text'
                      onClick={() => navigate('/login')}
                      sx={{ color: PRIMARY_MAIN, fontWeight: 700, fontSize: '0.9rem', textTransform: 'none', px: 0 }}
                    >
                      Already a member? Sign in
                    </Button>
                    <Button
                      variant='text'
                      onClick={() => navigate('/')}
                      sx={{ color: TEXT_SECONDARY, fontWeight: 600, fontSize: '0.85rem', textTransform: 'none', px: 0 }}
                    >
                      What is Winnbell?
                    </Button>
                  </Stack>
                  <Typography sx={{ fontSize: '11px', fontWeight: 600, color: TEXT_TERTIARY }}>
                    {FINE_PRINT}
                  </Typography>
                </Stack>
              </motion.div>
            </motion.div>
          </Box>
        </Box>
      </Box>
    );
  }

  // ─── Mobile: the gradient band IS the hero - eyebrow, sentence and gold numeral live
  // on it; the light body carries the support line, the stepper and the bottom CTA ────
  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} sx={{ minHeight: 'var(--dvh100, 100dvh)', bgcolor: BG_SUBTLE, display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          background: GRADIENT_HERO,
          color: 'white',
          borderRadius: '0 0 28px 28px',
          px: 2.5,
          pt: 1.75,
          pb: 3,
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Decorative glow orb - top right, soft white */}
        <Box
          sx={{
            position: 'absolute',
            top: '-130px',
            right: '-90px',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 68%)',
            pointerEvents: 'none',
          }}
        />

        {/* Wordmark + Sign in link row */}
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box
            component='a'
            href='/'
            aria-label='Winnbell home'
            onClick={(e) => { e.preventDefault(); navigate('/'); }}
            sx={{ display: 'inline-flex', textDecoration: 'none', cursor: 'pointer' }}
          >
            <Box
              component='img'
              src='/winnbell_app_name_white.svg'
              alt='Winnbell'
              sx={{ height: 34, width: 'auto' }}
            />
          </Box>
          <Button
            onClick={() => navigate('/login')}
            disableRipple
            sx={{
              minWidth: 'auto',
              p: 0,
              color: 'white',
              fontFamily: 'inherit',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              textTransform: 'none',
              whiteSpace: 'nowrap',
              mr: '5px', minHeight: '0px',
              '&:hover': { bgcolor: 'transparent', opacity: 0.8 },
            }}
          >
            Sign in
          </Button>
        </Box>

        {/* Context chip */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <Box sx={{ position: 'relative', zIndex: 1, mt: 2, display: 'flex', alignItems: 'center', gap: 0.75, '& svg': { fontSize: 14, color: ALPHA_WHITE_80 } }}>
            {contextChip.icon}
            <Typography sx={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: ALPHA_WHITE_80 }}>
              {contextChip.label}
            </Typography>
          </Box>
        </motion.div>

        {/* The approved sentence, broken around the gold prize figure */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}>
          <Typography component='h1' sx={{ position: 'relative', zIndex: 1, m: 0, mt: 1.25 }}>
            <Box component='span' sx={{ display: 'block', fontSize: '17.5px', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.4, color: 'white' }}>
              {leadClause}
            </Box>
            {prizeValue != null && (
              <Box component='span' sx={{ display: 'block', my: 0.5 }}>
                <GoldAmount amount={prizeValue} onGradient fontSize='clamp(3.2rem, 14vw, 4.25rem)' />
              </Box>
            )}
            <Box component='span' sx={{ display: 'block', fontSize: '17.5px', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.4, color: 'white', mt: prizeValue != null ? 0 : 0.25 }}>
              cash prize draw.
            </Box>
          </Typography>
        </motion.div>

        {opensAt && <CampaignCountdown opensAt={opensAt} onGradient />}
      </Box>

      {/* Light body: support line, stepper, CTA riding the bottom */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, pt: 2.5, pb: 2.25, display: 'flex', flexDirection: 'column', gap: 2.25 }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.16 }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.55, color: TEXT_SECONDARY }}>
            {subtext}
          </Typography>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.24 }}>
          <StepperVertical steps={steps} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.32 }}
          style={{ marginTop: 'auto' }}
        >
          <Stack spacing={1.125} sx={{ pt: 1.5 }}>
            <AttractButton
              onClick={() => navigate('/register')}
              endIcon={<ArrowForward />}
              sx={{
                width: '100%',
                borderRadius: '14px',
                p: '17px',
                fontFamily: 'inherit',
                fontSize: '15.5px',
                fontWeight: 800,
                letterSpacing: '-0.01em',
                color: 'white',
                background: GRADIENT_CTA,
                boxShadow: '0 8px 20px rgba(21,101,192,0.3)',
                textTransform: 'none',
                '&:hover': { background: GRADIENT_CTA, boxShadow: '0 12px 28px rgba(21,101,192,0.4)' },
              }}
            >
              {ctaLabel}
            </AttractButton>
            <Typography sx={{ textAlign: 'center', fontSize: '10.5px', fontWeight: 600, color: TEXT_TERTIARY, lineHeight: 1.4 }}>
              {FINE_PRINT}
            </Typography>
          </Stack>
        </motion.div>
      </Box>
    </Box>
  );
};

export default WelcomeInvite;

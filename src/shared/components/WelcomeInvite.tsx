import type { ReactNode } from 'react';
import { Box, Typography, Button, Stack, Container, useMediaQuery, useTheme } from '@mui/material';
import { ArrowForward, AccessTimeOutlined, EmojiEventsOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import AttractButton from './AttractButton';
import AuthBrandPanel from '../../features/auth/components/AuthBrandPanel';
import { staggerContainer, popIn, riseIn } from '../motion';
import { formatDrawDate } from '../utils/date';
import { getActiveDraws } from '../../features/draw/api/draw.api';
import { queryKeys } from '../constants/queryKeys';
import {
  GRADIENT_HERO, PRIMARY_MAIN, BG_PAGE, BG_SUBTLE, BG_SURFACE, TEXT_HEADING, TEXT_SECONDARY, TEXT_TERTIARY_AA,
  BORDER_LIGHT, SHADOW_CARD, PRIMARY_TINT,
  ACCENT_GOLD, ACCENT_GOLD_LIGHT, ACCENT_GOLD_CREAM, ACCENT_GOLD_DARK, GOLD_INK,
} from '../colors';
import { formatCurrency } from '../utils/date';

// Gold-highlighted draw card: the mobile body's eye-catcher (deliberately mobile-only -
// the desktop panel keeps its original steps-focused layout, per user 2026-08-01).
const DrawPrizeCard = ({ prizeAmount, drawDate }: { prizeAmount: number; drawDate: string }) => (
  <Box
    sx={{
      background: `linear-gradient(135deg, ${ACCENT_GOLD_LIGHT} 0%, ${BG_SURFACE} 58%, ${ACCENT_GOLD_LIGHT} 130%)`,
      border: `1px solid ${ACCENT_GOLD}`,
      borderRadius: '15px',
      boxShadow: `0 10px 28px -8px ${ACCENT_GOLD}55, ${SHADOW_CARD}`,
      p: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* Soft gold glow orb, top-right */}
    <Box sx={{ position: 'absolute', top: -70, right: -50, width: 190, height: 190, borderRadius: '50%', background: `radial-gradient(circle, ${ACCENT_GOLD_CREAM} 0%, transparent 68%)`, pointerEvents: 'none' }} />

    {/* Label + Live pill */}
    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
      <Typography sx={{ fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT_GOLD_DARK }}>
        The current draw
      </Typography>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, bgcolor: ACCENT_GOLD_CREAM, borderRadius: '999px', px: 1.125, py: 0.5 }}>
        <Box sx={{ width: '5px', height: '5px', borderRadius: '50%', bgcolor: ACCENT_GOLD_DARK }} />
        <Typography sx={{ fontSize: '9.5px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: GOLD_INK }}>
          Live
        </Typography>
      </Box>
    </Box>

    {/* Prize amount + trophy */}
    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography sx={{ fontSize: '40px', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, color: TEXT_HEADING, fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrency(prizeAmount)}
          </Typography>
        
        </Box>
        {/* Draw date with clock icon */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: '12.5px', fontWeight: 600, color: TEXT_SECONDARY, mt: 1.25 }}>
          <AccessTimeOutlined sx={{ fontSize: 15, color: ACCENT_GOLD_DARK }} />
          <span>Drawn {formatDrawDate(drawDate)}</span>
        </Box>
      </Box>
      <Box sx={{ width: 52, height: 52, flexShrink: 0, borderRadius: '14px', background: `linear-gradient(135deg, ${ACCENT_GOLD_CREAM}, ${ACCENT_GOLD_LIGHT})`, border: `1px solid ${ACCENT_GOLD}66`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmojiEventsOutlined sx={{ fontSize: 28, color: ACCENT_GOLD_DARK }} />
      </Box>
    </Box>
  </Box>
);

export interface WelcomeStep {
  icon: ReactNode;
  title: string;
  text: string;
  // tint/iconColor drive the light desktop cards; the mobile glass cards ignore them (white icons).
  tint: string;
  iconColor: string;
}

interface WelcomeInviteProps {
  brandHeadline: ReactNode; // AuthBrandPanel headline (desktop split panel)
  brandTagline: string;     // AuthBrandPanel tagline (desktop split panel)
  headline: string;         // the main headline (desktop content + mobile)
  subtext?: string;
  headerSubline?: string;   // mobile-only subline in the gradient header
  highlight?: {             // mobile-only highlight card (icon + title + subtitle)
    icon: ReactNode;
    title: string;
    subtitle: string;
  };
  steps: WelcomeStep[];
}

const DEFAULT_SUBTEXT = 'You are one step from entering the current draw. Here is how it works.';

// Shared "friendly welcome" screen for logged-out visitors arriving via a referral link (JoinPage)
// or a location flyer QR (ScanWelcomePage). Identical layout + CTAs; only the copy and the
// how-it-works steps differ (passed as props). Desktop = split brand/content panel matching the
// auth pages; mobile = a card-based white-on-light design with prize card + how-it-works.
const WelcomeInvite = ({
  brandHeadline,
  brandTagline,
  headline,
  subtext = DEFAULT_SUBTEXT,
  headerSubline,
  highlight,
  steps
}: WelcomeInviteProps) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Fetch the active draw for the prize card (mobile only)
  const { data: draws } = useQuery({
    queryKey: queryKeys.draws.active,
    queryFn: getActiveDraws,
    staleTime: 2 * 60_000,
  });
  const openDraw = draws?.find(d => d.status?.toLowerCase() === 'open');

  // ─── Desktop: split screen (brand panel + light content panel), matching the auth pages ──
  if (isDesktop) {
    return (
      <Box sx={{ display: 'flex', height: 'var(--dvh100, 100dvh)', overflow: 'hidden' }}>
        <AuthBrandPanel headline={brandHeadline} tagline={brandTagline} bullets={[]} />

        {/* Right: light content panel - the only scroller on desktop */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            bgcolor: BG_PAGE,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            px: 7,
            py: 6,
          }}
        >
          <Container maxWidth="sm" disableGutters>
            <motion.div variants={staggerContainer} initial="hidden" animate="visible">
              <motion.div variants={riseIn}>
                <Typography sx={{ fontWeight: 900, fontSize: '2.6rem', lineHeight: 1.08, letterSpacing: '-0.03em', color: TEXT_HEADING, mb: 1.5 }}>
                  {headline}
                </Typography>
              </motion.div>

              <motion.div variants={riseIn}>
                <Typography sx={{ color: TEXT_SECONDARY, fontSize: '1.05rem', lineHeight: 1.6, mb: 3.5 }}>
                  {subtext}
                </Typography>
              </motion.div>

              {/* How-it-works step cards */}
              <Stack spacing={1.5} sx={{ mb: 3.5 }}>
                {steps.map((step, i) => (
                  <motion.div key={i} variants={popIn}>
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{ p: 2, borderRadius: 3, border: `1px solid ${BORDER_LIGHT}`, bgcolor: 'white', boxShadow: SHADOW_CARD }}
                    >
                      <Box sx={{ width: 46, height: 46, flexShrink: 0, borderRadius: 2.5, bgcolor: step.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', '& svg': { fontSize: 24, color: step.iconColor } }}>
                        {step.icon}
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.98rem', lineHeight: 1.3, color: TEXT_HEADING }}>{step.title}</Typography>
                        <Typography sx={{ fontSize: '0.88rem', lineHeight: 1.5, color: TEXT_SECONDARY }}>{step.text}</Typography>
                      </Box>
                    </Stack>
                  </motion.div>
                ))}
              </Stack>

              {/* CTAs */}
              <motion.div variants={riseIn}>
                <Stack spacing={1.25} sx={{ maxWidth: 420 }}>
                  <AttractButton
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/register')}
                    sx={{ fontWeight: 800, fontSize: '1rem', py: 1.5, textTransform: 'none' }}
                  >
                    Create your free account
                  </AttractButton>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Button
                      variant="text"
                      onClick={() => navigate('/login')}
                      sx={{ color: PRIMARY_MAIN, fontWeight: 700, fontSize: '0.9rem', textTransform: 'none' }}
                    >
                      Already a member? Sign in
                    </Button>
                    <Button
                      variant="text"
                      onClick={() => navigate('/')}
                      sx={{ color: TEXT_SECONDARY, fontWeight: 600, fontSize: '0.85rem', textTransform: 'none' }}
                    >
                      What is Winnbell?
                    </Button>
                  </Stack>
                </Stack>
              </motion.div>
            </motion.div>
          </Container>
        </Box>
      </Box>
    );
  }

  // ─── Mobile: gradient header + light card-based body ──────────────────────────
  return (
    <Box sx={{ minHeight: 'var(--dvh100, 100dvh)', bgcolor: BG_SUBTLE, display: 'flex', flexDirection: 'column' }}>
      {/* Gradient header band with rounded bottom corners */}
      <Box
        sx={{
          background: GRADIENT_HERO,
          color: 'white',
          borderRadius: '0 0 28px 28px',
          px: 2,
          pt: 2,
          pb: 3.5,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative glow orb - top right, soft white */}
        <Box
          sx={{
            position: 'absolute',
            top: '-110px',
            right: '-90px',
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 68%)',
            pointerEvents: 'none',
          }}
        />

        {/* Wordmark + Sign in link row */}
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
          <Box
            component="a"
            href="/"
            aria-label="Winnbell home"
            onClick={(e) => { e.preventDefault(); navigate('/'); }}
            sx={{ display: 'inline-flex', textDecoration: 'none', cursor: 'pointer' }}
          >
            <Box
              component="img"
              src="/winnbell_app_name_white.svg"
              alt="Winnbell"
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
              mr: '5px', minHeight:'0px',
              '&:hover': { bgcolor: 'transparent', opacity: 0.8 },
            }}
          >
            Sign in
          </Button>
        </Box>

        {/* Headline + subline */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography sx={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2, mb: 0.5 }}>
            {headline}
          </Typography>
          {headerSubline && (
            <Typography sx={{ fontSize: 13, fontWeight: 500, opacity: 0.8 }}>
              {headerSubline}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Light page body with cards */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Gold draw card - the eye-catcher, only if a draw is live */}
        {openDraw && openDraw.prize_amount && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <DrawPrizeCard prizeAmount={openDraw.prize_amount} drawDate={openDraw.draw_date} />
          </motion.div>
        )}

        {/* Highlight card - icon tile + bold title + muted subtitle */}
        {highlight && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
            <Box
              sx={{
                bgcolor: BG_SURFACE,
                border: `1px solid ${BORDER_LIGHT}`,
                borderRadius: '15px',
                boxShadow: SHADOW_CARD,
                p: '13px 15px',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '11px',
                  flexShrink: 0,
                  bgcolor: PRIMARY_TINT,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '& svg': { fontSize: 21, color: PRIMARY_MAIN },
                }}
              >
                {highlight.icon}
              </Box>
              <Box>
                <Typography sx={{ fontSize: '13.5px', fontWeight: 800, letterSpacing: '-0.01em', color: TEXT_HEADING, lineHeight: 1.2 }}>
                  {highlight.title}
                </Typography>
                <Typography sx={{ fontSize: '11.5px', fontWeight: 600, color: TEXT_TERTIARY_AA, mt: 0.25 }}>
                  {highlight.subtitle}
                </Typography>
              </Box>
            </Box>
          </motion.div>
        )}

        {/* How it works card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Box
            sx={{
              bgcolor: BG_SURFACE,
              border: `1px solid ${BORDER_LIGHT}`,
              borderRadius: '15px',
              boxShadow: SHADOW_CARD,
              p: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.875,
            }}
          >
            <Typography sx={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: TEXT_TERTIARY_AA }}>
              How it works
            </Typography>
            <Stack spacing={1.875}>
              {steps.map((step, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '9px',
                      flexShrink: 0,
                      bgcolor: PRIMARY_TINT,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '& svg': { fontSize: 18, color: PRIMARY_MAIN },
                    }}
                  >
                    {step.icon}
                  </Box>
                  <Typography sx={{ fontSize: '13.5px', fontWeight: 600, color: TEXT_SECONDARY, lineHeight: 1.2 }}>
                    {step.title}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </motion.div>

        {/* CTA + fine print */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
          <Stack spacing={1.25} sx={{ mt: 0.5 }}>
            <Button
              onClick={() => navigate('/register')}
              endIcon={<ArrowForward />}
              sx={{
                width: '100%',
                borderRadius: '14px',
                p: 2,
                fontFamily: 'inherit',
                fontSize: '15.5px',
                fontWeight: 800,
                letterSpacing: '-0.01em',
                color: 'white',
                background: GRADIENT_HERO,
                boxShadow: '0 8px 20px rgba(21,101,192,0.3)',
                textTransform: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                '&:hover': {
                  boxShadow: '0 12px 28px rgba(21,101,192,0.4)',
                },
              }}
            >
              Create your free account
            </Button>
            <Typography sx={{ textAlign: 'center', fontSize: '10.5px', fontWeight: 600, color: TEXT_TERTIARY_AA }}>
              No purchase necessary. Alternative method of entry available. 18+.
            </Typography>
          </Stack>
        </motion.div>

        {/* Bottom spacing for mobile scroll */}
        <Box sx={{ height: 1 }} />
      </Box>
    </Box>
  );
};

export default WelcomeInvite;

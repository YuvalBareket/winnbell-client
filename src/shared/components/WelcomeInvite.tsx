import type { ReactNode } from 'react';
import { Box, Typography, Button, Stack, useMediaQuery, useTheme } from '@mui/material';
import { ArrowForward, EmojiEvents, AccessTime } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import AttractButton from './AttractButton';
import AuthBrandPanel from '../../features/auth/components/AuthBrandPanel';
import { staggerContainer, popIn, riseIn } from '../motion';
import { formatDrawDate, formatCurrency } from '../utils/date';
import { getActiveDraws } from '../../features/draw/api/draw.api';
import { queryKeys } from '../constants/queryKeys';
import {
  GRADIENT_HERO, GRADIENT_CTA, PRIMARY_MAIN, PRIMARY_TINT,
  BG_SUBTLE, BG_SURFACE, TEXT_HEADING, TEXT_SECONDARY, TEXT_TERTIARY,
  BORDER_LIGHT, BORDER_SUBTLE, BG_ROW_SUBTLE, SHADOW_CARD, ALPHA_WHITE_80,
} from '../colors';

// Blue emphasis inside the approved headline sentence (the sender / business / prize amount).
// Hierarchy is done with type, not by rewriting the approved wording.
export const WelcomeHighlight = ({ children }: { children: ReactNode }) => (
  <Box component='span' sx={{ color: PRIMARY_MAIN }}>{children}</Box>
);

export interface WelcomeStep {
  icon: ReactNode;
  title: string;
  text: string;
}

interface WelcomeInviteProps {
  // Small uppercase context marker in the mobile gradient band (mobile-only, per user).
  // Tells the visitor why this page is personalized ("Invite from Sarah" / "Scanned at Joe's").
  contextChip: { icon: ReactNode; label: string };
  brandHeadline: ReactNode; // AuthBrandPanel headline (desktop split panel)
  brandTagline: string;     // AuthBrandPanel tagline (desktop split panel)
  headline: ReactNode;      // the approved sentence, with <WelcomeHighlight> emphasis inside it
  subtext: string;
  steps: WelcomeStep[];
  ctaLabel?: string;        // primary CTA text (both desktop and mobile)
}

// ── Shared cards ────────────────────────────────────────────────────────────────
// The draw card leads (opportunity before mechanics): white card, blue trophy tile,
// prize headline, and a date strip. Shown on BOTH layouts, above the steps.
const DrawCard = ({ prizeAmount, drawDate, large }: { prizeAmount: number; drawDate: string; large: boolean }) => (
  <Box sx={{ bgcolor: BG_SURFACE, border: `1px solid ${BORDER_LIGHT}`, borderRadius: large ? '16px' : '15px', boxShadow: SHADOW_CARD, overflow: 'hidden' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: large ? 1.75 : 1.625, p: large ? 2 : '14px 16px' }}>
      <Box sx={{ width: large ? 52 : 46, height: large ? 52 : 46, borderRadius: large ? '14px' : '13px', flexShrink: 0, bgcolor: PRIMARY_TINT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmojiEvents sx={{ fontSize: large ? 27 : 24, color: PRIMARY_MAIN }} />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.375 }}>
        <Typography sx={{ fontSize: large ? '18px' : '17px', fontWeight: 800, letterSpacing: '-0.02em', color: TEXT_HEADING, lineHeight: 1.15 }}>
          {formatCurrency(prizeAmount)} cash-prize draw
        </Typography>
        <Typography sx={{ fontSize: large ? '13px' : '12.5px', fontWeight: 600, color: TEXT_TERTIARY, lineHeight: 1.3 }}>
          Shared across participating businesses
        </Typography>
      </Box>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.875, px: 2, py: 1.25, bgcolor: BG_ROW_SUBTLE, borderTop: `1px solid ${BORDER_SUBTLE}` }}>
      <AccessTime sx={{ fontSize: large ? 15 : 14, color: PRIMARY_MAIN }} />
      <Typography sx={{ fontSize: large ? '12.5px' : '12px', fontWeight: 600, color: TEXT_SECONDARY }}>
        Drawn {formatDrawDate(drawDate)}
      </Typography>
    </Box>
  </Box>
);

// One blue for every icon (PRIMARY_TINT tile + PRIMARY_MAIN glyph) so nothing competes
// with the CTA, and every step shows both its title and its text.
const StepsCard = ({ steps, large }: { steps: WelcomeStep[]; large: boolean }) => (
  <Box sx={{ bgcolor: BG_SURFACE, border: `1px solid ${BORDER_LIGHT}`, borderRadius: large ? '16px' : '15px', boxShadow: SHADOW_CARD, p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
    {steps.map((step, i) => (
      <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Box sx={{ width: large ? 36 : 32, height: large ? 36 : 32, borderRadius: large ? '10px' : '9px', flexShrink: 0, bgcolor: PRIMARY_TINT, display: 'flex', alignItems: 'center', justifyContent: 'center', '& svg': { fontSize: large ? 19 : 18, color: PRIMARY_MAIN } }}>
          {step.icon}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          <Typography sx={{ fontSize: large ? '14.5px' : '13.5px', fontWeight: 800, letterSpacing: '-0.01em', color: TEXT_HEADING, lineHeight: 1.25 }}>
            {step.title}
          </Typography>
          <Typography sx={{ fontSize: large ? '13px' : '12px', fontWeight: 500, color: TEXT_TERTIARY, lineHeight: 1.4 }}>
            {step.text}
          </Typography>
        </Box>
      </Box>
    ))}
  </Box>
);

const FINE_PRINT = 'No purchase necessary to enter or win. 18+.';

// Shared "friendly welcome" screen for logged-out visitors arriving via a referral link
// (JoinPage) or a location flyer QR (ScanWelcomePage). Prize before mechanics: the band
// shrinks to wordmark + Sign in + context chip, the approved headline leads in the body,
// the draw card sits above the steps, and the CTA (AttractButton on both layouts) rides
// the bottom so the whole pitch fits one screenful.
const WelcomeInvite = ({
  contextChip,
  brandHeadline,
  brandTagline,
  headline,
  subtext,
  steps,
  ctaLabel = 'Create your free account',
}: WelcomeInviteProps) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Fetch the active draw for the draw card (both layouts).
  const { data: draws } = useQuery({
    queryKey: queryKeys.draws.active,
    queryFn: getActiveDraws,
    staleTime: 2 * 60_000,
  });
  const openDraw = draws?.find(d => d.status?.toLowerCase() === 'open');

  // ─── Desktop: split screen (brand panel + white content panel), matching the auth pages ──
  if (isDesktop) {
    return (
      <Box sx={{ display: 'flex', height: 'var(--dvh100, 100dvh)', overflow: 'hidden' }}>
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
            <motion.div variants={staggerContainer} initial="hidden" animate="visible">
              <motion.div variants={riseIn}>
                <Typography sx={{ fontWeight: 800, fontSize: '30px', lineHeight: 1.14, letterSpacing: '-0.03em', color: TEXT_HEADING, mb: 1.5 }}>
                  {headline}
                </Typography>
              </motion.div>

              <motion.div variants={riseIn}>
                <Typography sx={{ color: TEXT_SECONDARY, fontSize: '15.5px', fontWeight: 500, lineHeight: 1.55, mb: 2.25 }}>
                  {subtext}
                </Typography>
              </motion.div>

              {openDraw && openDraw.prize_amount && (
                <motion.div variants={popIn}>
                  <Box sx={{ mb: 2.25 }}>
                    <DrawCard prizeAmount={openDraw.prize_amount} drawDate={openDraw.draw_date} large />
                  </Box>
                </motion.div>
              )}

              <motion.div variants={popIn}>
                <Box sx={{ mb: 2.25 }}>
                  <StepsCard steps={steps} large />
                </Box>
              </motion.div>

              {/* CTA + links + fine print */}
              <motion.div variants={riseIn}>
                <Stack spacing={1.5} sx={{ maxWidth: 420 }}>
                  <AttractButton
                    variant="contained"
                    size="large"
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
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Button
                      variant="text"
                      onClick={() => navigate('/login')}
                      sx={{ color: PRIMARY_MAIN, fontWeight: 700, fontSize: '0.9rem', textTransform: 'none', px: 0 }}
                    >
                      Already a member? Sign in
                    </Button>
                    <Button
                      variant="text"
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

  // ─── Mobile: slim gradient band + light card body, CTA pinned to the bottom ────
  return (
    <Box sx={{ minHeight: 'var(--dvh100, 100dvh)', bgcolor: BG_SUBTLE, display: 'flex', flexDirection: 'column' }}>
      {/* Gradient band: wordmark + Sign in + context chip. No headline here - it leads the body. */}
      <Box
        sx={{
          background: GRADIENT_HERO,
          color: 'white',
          borderRadius: '0 0 28px 28px',
          px: 2.5,
          pt: 1.75,
          pb: 2.25,
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
              mr: '5px', minHeight: '0px',
              '&:hover': { bgcolor: 'transparent', opacity: 0.8 },
            }}
          >
            Sign in
          </Button>
        </Box>

        {/* Context chip */}
        <Box sx={{ position: 'relative', zIndex: 1, mt: 1.5, display: 'inline-flex', alignItems: 'center', gap: 0.75, '& svg': { fontSize: 14, color: ALPHA_WHITE_80 } }}>
          {contextChip.icon}
          <Typography sx={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: ALPHA_WHITE_80 }}>
            {contextChip.label}
          </Typography>
        </Box>
      </Box>

      {/* Light body: headline, draw card, steps, CTA riding the bottom */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2.25, pt: 2.75, pb: 2.25, display: 'flex', flexDirection: 'column', gap: 1.75 }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <Typography sx={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.14, color: TEXT_HEADING }}>
              {headline}
            </Typography>
            <Typography sx={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.5, color: TEXT_SECONDARY }}>
              {subtext}
            </Typography>
          </Box>
        </motion.div>

        {openDraw && openDraw.prize_amount && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.12 }}>
            <DrawCard prizeAmount={openDraw.prize_amount} drawDate={openDraw.draw_date} large={false} />
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.19 }}>
          <StepsCard steps={steps} large={false} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.26 }}
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

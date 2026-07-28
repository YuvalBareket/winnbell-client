import type { ReactNode } from 'react';
import { Box, Typography, Button, Stack, Container, useMediaQuery, useTheme } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AttractButton from './AttractButton';
import AuthBrandPanel from '../../features/auth/components/AuthBrandPanel';
import { staggerContainer, popIn, riseIn } from '../motion';
import {
  GRADIENT_HERO, PRIMARY_MAIN, ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_30,
  BG_PAGE, TEXT_HEADING, TEXT_SECONDARY, BORDER_LIGHT, SHADOW_CARD,
} from '../colors';

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
  steps: WelcomeStep[];
}

const DEFAULT_SUBTEXT = 'You are one step from entering this month\'s draw. Here is how it works.';

// Shared "friendly welcome" screen for logged-out visitors arriving via a referral link (JoinPage)
// or a location flyer QR (ScanWelcomePage). Identical layout + CTAs; only the copy and the
// how-it-works steps differ (passed as props). Desktop = split brand/content panel matching the
// auth pages; mobile = a full-bleed gradient tuned to fit ONE screen without scrolling.
const WelcomeInvite = ({ brandHeadline, brandTagline, headline, subtext = DEFAULT_SUBTEXT, steps }: WelcomeInviteProps) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

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

  // ─── Mobile: full-bleed gradient welcome ──────────────────────────────────────
  return (
    // overflow hidden: clips the decorative orbs (they extend past the container via negative
    // offsets) so they never create a scroll; the compressed content fits one screen on its own.
    <Box sx={{ minHeight: 'var(--dvh100, 100dvh)', background: GRADIENT_HERO, color: 'white', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative orbs */}
      <Box sx={{ position: 'absolute', top: '-18%', right: '-8%', width: 400, height: 400, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: '-12%', left: '-8%', width: 320, height: 320, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)', filter: 'blur(55px)', pointerEvents: 'none' }} />

      {/* Brand */}
      <Box sx={{ px: { xs: 2.5, md: 6 }, py: { xs: 2.5, md: 3 }, position: 'relative', zIndex: 1 }}>
        <Box component="img" src="/winnbell_app_name_white.svg" alt="Winnbell" sx={{ height: { xs: 34, md: 38 }, width: 'auto' }} />
      </Box>

      {/* Content: top-aligned (starts just under the brand) and spacing tuned so the whole page
          fits one mobile screen without scrolling. flexGrow (basis auto) keeps the gradient
          filling the viewport below the content. */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', px: 2.5, py: { xs: 1.5, md: 3 }, position: 'relative', zIndex: 1 }}>
        <Container maxWidth="xs" disableGutters sx={{ textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Typography variant="h1" sx={{ fontWeight: 900, fontSize: { xs: '2rem', md: '2.7rem' }, lineHeight: 1.1, letterSpacing: '-0.03em', color: 'white', mb: 1 }}>
              {headline}
            </Typography>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: { xs: '0.9rem', md: '1.05rem' }, lineHeight: 1.5, mb: 2.5, fontWeight: 400 }}>
              {subtext}
            </Typography>
          </motion.div>

          {/* How it works card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.26 }}>
            <Box
              sx={{
                bgcolor: ALPHA_WHITE_15,
                border: `1px solid ${ALPHA_WHITE_20}`,
                borderRadius: 4,
                p: { xs: 2, md: 3 },
                mb: 2.5,
                backdropFilter: 'blur(10px)',
                textAlign: 'left',
              }}
            >
              <Stack spacing={1.75}>
                {steps.map((step, i) => (
                  <Stack key={i} direction="row" spacing={1.75} alignItems="flex-start">
                    <Box sx={{ width: 38, height: 38, flexShrink: 0, borderRadius: 2, bgcolor: ALPHA_WHITE_20, border: `1px solid ${ALPHA_WHITE_30}`, display: 'flex', alignItems: 'center', justifyContent: 'center', '& svg': { fontSize: 20, color: 'white' } }}>
                      {step.icon}
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.3 }}>{step.title}</Typography>
                      <Typography sx={{ fontSize: '0.8rem', lineHeight: 1.45, color: 'rgba(255,255,255,0.78)' }}>{step.text}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </motion.div>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.34 }}>
            <Stack spacing={1}>
              <AttractButton onLightBackground
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/register')}
                sx={{ bgcolor: 'white', color: PRIMARY_MAIN, fontWeight: 800, fontSize: '1rem', py: 1.25, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.92)', boxShadow: '0 12px 32px rgba(0,0,0,0.25)' } }}
              >
                Create your free account
              </AttractButton>
              <Button
                variant="text"
                onClick={() => navigate('/login')}
                sx={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', opacity: 0.9, '&:hover': { bgcolor: 'transparent', opacity: 1 } }}
              >
                Already a member? Sign in
              </Button>
            </Stack>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.5 }}>
            <Button
              variant="text"
              onClick={() => navigate('/')}
              sx={{ mt: 0.5, textTransform: 'none', color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: '0.85rem', '&:hover': { bgcolor: 'transparent', color: 'white' } }}
            >
              What is Winnbell?
            </Button>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default WelcomeInvite;

import { useEffect } from 'react';
import { Box, Typography, Button, Stack, Container } from '@mui/material';
import {
  ArrowForward, ReceiptLongOutlined, EmojiEventsOutlined, CardGiftcardOutlined,
} from '@mui/icons-material';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '../../shared/api/client';
import { useAppSelector } from '../../store/hook';
import { selectIsAuthenticated } from '../../store/selectors/authSelectors';
import { formatCurrency } from '../../shared/utils/date';
import { GRADIENT_HERO, PRIMARY_MAIN, ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_30 } from '../../shared/colors';

// Friendly landing-style welcome shown when a logged-out visitor scans a flyer QR
// (/scan?l=<id>). After sign-up, useSupabaseSync returns them to /scan?l=<id>.
interface PublicLocation {
  business_name: string;
  location_name: string;
  logo_url: string | null;
  draw_prize_amount: number | null;
  draw_date: string | null;
}

const ScanWelcomePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lid = searchParams.get('l');
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Remember the location so that after sign-up the user lands back on /scan?l=<id>.
  useEffect(() => {
    if (lid) localStorage.setItem('pendingLocationId', lid);
  }, [lid]);

  const { data: loc } = useQuery({
    queryKey: ['publicLocation', lid],
    queryFn: () => api.get<PublicLocation>(`/business/participating/locations/${lid}`).then(r => r.data).catch(() => null),
    enabled: !!lid,
    staleTime: 5 * 60_000,
    retry: false,
  });

  // Already signed in? Skip the pitch and go straight to the receipt flow for this location.
  if (isAuthenticated) {
    return <Navigate to={lid ? `/scan?l=${lid}` : '/scan'} replace />;
  }

  // No location id - nothing to personalize, fall back to the normal landing.
  if (!lid) return <Navigate to='/' replace />;

  const prize = loc?.draw_prize_amount ?? null;

  const steps = [
    {
      icon: <ReceiptLongOutlined />,
      title: 'Submit your receipt',
      text: loc?.business_name ? `Type in your receipt from ${loc.business_name} to earn your entries.` : 'Type in your receipt from your visit to earn your entries.',
    },
    {
      icon: <EmojiEventsOutlined />,
      title: 'Enter the monthly draw',
      text: prize ? `Every entry competes for this month's ${formatCurrency(prize)} cash prize.` : "Every entry competes for this month's cash prize.",
    },
    {
      icon: <CardGiftcardOutlined />,
      title: 'Always free to play',
      text: 'Joining is free and no purchase is ever necessary.',
    },
  ];

  return (
    <Box sx={{ minHeight: '100dvh', background: GRADIENT_HERO, color: 'white', display: 'flex', flexDirection: 'column', position: 'relative', overflowY: 'auto' }}>
      {/* Decorative orbs */}
      <Box sx={{ position: 'absolute', top: '-18%', right: '-8%', width: 400, height: 400, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: '-12%', left: '-8%', width: 320, height: 320, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)', filter: 'blur(55px)', pointerEvents: 'none' }} />

      {/* Brand */}
      <Box sx={{ px: { xs: 2.5, md: 6 }, py: { xs: 2.5, md: 3 }, position: 'relative', zIndex: 1 }}>
        <Box component='img' src='/winnbell_app_name_white.svg' alt='Winnbell' sx={{ height: { xs: 34, md: 38 }, width: 'auto' }} />
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: { xs: 'flex-start', md: 'center' }, px: 2.5, py: { xs: 1, md: 3 }, position: 'relative', zIndex: 1 }}>
        <Container maxWidth='xs' disableGutters sx={{ textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Box sx={{ display: 'inline-block', borderRadius: 99, px: 1.5, py: 0.5, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', bgcolor: ALPHA_WHITE_15, color: 'white', mb: 2 }}>
              {loc?.business_name ? `Welcome from ${loc.business_name}` : 'Welcome'}
            </Box>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Typography variant='h1' sx={{ fontWeight: 900, fontSize: { xs: '2.2rem', md: '2.7rem' }, lineHeight: 1.1, letterSpacing: '-0.03em', color: 'white', mb: 1.5 }}>
              Happy to see you.
            </Typography>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: { xs: '0.95rem', md: '1.05rem' }, lineHeight: 1.6, mb: 3, fontWeight: 400 }}>
              You are one step from entering this month's draw. Here is how it works.
            </Typography>
          </motion.div>

          {/* How it works card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.26 }}>
            <Box
              sx={{
                bgcolor: ALPHA_WHITE_15,
                border: `1px solid ${ALPHA_WHITE_20}`,
                borderRadius: 4,
                p: { xs: 2.5, md: 3 },
                mb: 3.5,
                backdropFilter: 'blur(10px)',
                textAlign: 'left',
              }}
            >
              <Stack spacing={2.25}>
                {steps.map((step, i) => (
                  <Stack key={i} direction='row' spacing={2} alignItems='flex-start'>
                    <Box sx={{ width: 42, height: 42, flexShrink: 0, borderRadius: 2.5, bgcolor: ALPHA_WHITE_20, border: `1px solid ${ALPHA_WHITE_30}`, display: 'flex', alignItems: 'center', justifyContent: 'center', '& svg': { fontSize: 22, color: 'white' } }}>
                      {step.icon}
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.3 }}>{step.title}</Typography>
                      <Typography sx={{ fontSize: '0.83rem', lineHeight: 1.5, color: 'rgba(255,255,255,0.78)' }}>{step.text}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </motion.div>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.34 }}>
            <Stack spacing={1.25}>
              <Button
                variant='contained'
                size='large'
                endIcon={<ArrowForward />}
                onClick={() => navigate('/register')}
                sx={{ bgcolor: 'white', color: PRIMARY_MAIN, fontWeight: 800, fontSize: '1rem', py: 1.5, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.92)', boxShadow: '0 12px 32px rgba(0,0,0,0.25)' } }}
              >
                Create your free account
              </Button>
              <Button
                variant='text'
                onClick={() => navigate('/login')}
                sx={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', opacity: 0.9, '&:hover': { bgcolor: 'transparent', opacity: 1 } }}
              >
                Already a member? Sign in
              </Button>
            </Stack>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.5 }}>
            <Button
              variant='text'
              onClick={() => navigate('/')}
              sx={{ mt: 1.5, textTransform: 'none', color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: '0.85rem', '&:hover': { bgcolor: 'transparent', color: 'white' } }}
            >
              What is Winnbell?
            </Button>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default ScanWelcomePage;

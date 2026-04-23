import { useState, useEffect } from 'react';
import {
  Box, Button, Typography, Paper, Stack, Chip, CircularProgress,
  Divider, Skeleton, IconButton,
} from '@mui/material';
import {
  ConfirmationNumber, EmojiEvents, Storefront, CreditCard, Groups, Remove, Add,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../shared/api/client';
import {
  GRADIENT_HERO, ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_30,
} from '../../../shared/colors';

const FEATURES = [
  { icon: <ConfirmationNumber />, text: 'Issue unlimited tickets to your customers' },
  { icon: <EmojiEvents />,        text: 'Enter the next monthly prize draw and grow your prize pool' },
  { icon: <Storefront />,         text: 'Appear on the Winnbell map so customers can find you' },
  { icon: <Groups />,             text: 'Assign branch managers to run your locations' },
];

const TIER_MAP: Record<number, number> = {
  250:  250,
  500:  490,
  750:  730,
  1000: 920,
  1250: 1140,
  1500: 1360,
  1750: 1500,
  2000: 1710,
  2250: 1910,
  2500: 2050,
    2750: 2250,
  3000: 2460,

};

const TIER_KEYS = Object.keys(TIER_MAP).map(Number).sort((a, b) => a - b);
const MIN_TIER = TIER_KEYS[0];
const MAX_TIER = TIER_KEYS[TIER_KEYS.length - 1];

const SubscribePage = () => {
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState(500);
  const [locationCount, setLocationCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch location count on mount
  useEffect(() => {
    const fetchLocationCount = async () => {
      try {
        const { data } = await api.get('/business/my-business');
        const count = data.locations?.length || 1;
        setLocationCount(count);
      } catch (err) {
        setLocationCount(1);
      }
    };
    fetchLocationCount();
  }, []);

  // Calculate pricing
  const pricePerLocation = TIER_MAP[selectedTier] ?? 0;
  const effectiveLocationCount = locationCount || 1;
  const totalMonthly = pricePerLocation * effectiveLocationCount;

  const currentIndex = TIER_KEYS.indexOf(selectedTier);
  const atMin = currentIndex === 0;
  const atMax = currentIndex === TIER_KEYS.length - 1;

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
          ? 'Your business already has an active subscription. Go to the subscription page to manage it.'
          : 'Something went wrong. Please try again.',
      );
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        // On desktop both panels fill the full viewport height
        '& > *': { minHeight: { md: '100vh' }, alignItems: 'stretch' },
      }}
    >
      {/* ── Left: Brand panel ── */}
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
          minHeight: { xs: 300, md: '100vh' },
        }}
      >
        {/* Decorative blobs */}
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', bgcolor: ALPHA_WHITE_15, filter: 'blur(70px)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -80, left: -60, width: 260, height: 260, borderRadius: '50%', bgcolor: 'rgba(66,165,245,0.18)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        {/* Logo */}
        <Stack direction='row' alignItems='center' spacing={1.5}>
          <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: ALPHA_WHITE_20, border: `1px solid ${ALPHA_WHITE_30}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ConfirmationNumber sx={{ fontSize: 24 }} />
          </Box>
          <Typography variant='h5' fontWeight={900} letterSpacing={-0.5}>Winnbell</Typography>
        </Stack>

        {/* Headline */}
        <Box sx={{ my: { xs: 3, md: 0 } }}>
          <Typography
            variant='h2'
            fontWeight={900}
            lineHeight={1.1}
            mb={2}
            sx={{ fontSize: { xs: '2.2rem', md: '3rem', lg: '3.5rem' } }}
          >
            Grow Your<br />Business
          </Typography>
          <Typography
            variant='body1'
            sx={{ opacity: 0.85, lineHeight: 1.8, maxWidth: 380, fontSize: { xs: '0.95rem', md: '1.05rem' } }}
          >
            One flat monthly fee. Get listed on the map, issue tickets to your customers, and compete in the monthly prize draw.
          </Typography>
        </Box>

        {/* Feature list */}
        <Stack spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
          {FEATURES.map((f, i) => (
            <Stack key={i} direction='row' alignItems='center' spacing={2}>
              <Box
                sx={{
                  width: 38, height: 38, borderRadius: 2,
                  bgcolor: ALPHA_WHITE_15, border: `1px solid ${ALPHA_WHITE_20}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >
                {f.icon}
              </Box>
              <Typography variant='body2' fontWeight={600} sx={{ opacity: 0.9, lineHeight: 1.5 }}>
                {f.text}
              </Typography>
            </Stack>
          ))}
        </Stack>

        {/* Bottom tagline */}
        <Typography
          variant='caption'
          sx={{ opacity: 0.5, display: { xs: 'none', md: 'block' } }}
        >
          Trusted by businesses across the city
        </Typography>
      </Box>

      {/* ── Right: Tier selection & pricing ── */}
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
          <Paper
            elevation={0}
            sx={{
              borderRadius: { xs: 4, md: 5 },
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
            }}
          >
            {/* Card header */}
            <Box
              sx={{
                px: { xs: 3, md: 4 },
                pt: { xs: 3, md: 4 },
                pb: 3,
                background: 'linear-gradient(135deg, rgba(25,93,230,0.04) 0%, rgba(127,166,255,0.06) 100%)',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack direction='row' alignItems='center' justifyContent='space-between' mb={2}>
                <Chip label='Partner Plan' color='primary' size='small' sx={{ fontWeight: 700 }} />
                <Typography variant='caption' color='text.disabled' fontWeight={500}>
                  Billed monthly
                </Typography>
              </Stack>
              <Typography variant='h4' fontWeight={900} color='text.primary' lineHeight={1}>
                Choose Your Tier
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                Select entries per location each month
              </Typography>
            </Box>

            {/* Section 1: Entries stepper */}
            <Box sx={{ px: { xs: 3, md: 4 }, py: { xs: 3, md: 4 } }}>
              <Typography variant='h6' fontWeight={700} color='text.primary' mb={0.5}>
                How many entries per location?
              </Typography>
              <Typography variant='caption' color='text.secondary' display='block' mb={3}>
                per month
              </Typography>

              {/* Stepper control */}
              <Stack direction='row' alignItems='center' justifyContent='center' spacing={2}>
                <IconButton
                  onClick={() => setSelectedTier(TIER_KEYS[currentIndex - 1])}
                  disabled={atMin}
                  sx={{ width: 52, height: 52, border: '2px solid', borderColor: 'divider', borderRadius: 2, opacity: atMin ? 0.4 : 1 }}
                >
                  <Remove />
                </IconButton>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant='h4' fontWeight={900} color='text.primary' sx={{ minWidth: { xs: 160, md: 220 } }}>
                    {selectedTier.toLocaleString()} entries
                  </Typography>
                  <Typography variant='body2' color='text.secondary' mt={1}>
                    ${pricePerLocation.toLocaleString()} per location/month
                  </Typography>
                </Box>

                <IconButton
                  onClick={() => setSelectedTier(TIER_KEYS[currentIndex + 1])}
                  disabled={atMax}
                  sx={{ width: 52, height: 52, border: '2px solid', borderColor: 'divider', borderRadius: 2, opacity: atMax ? 0.4 : 1 }}
                >
                  <Add />
                </IconButton>
              </Stack>
            </Box>

            <Divider />

            {/* Section 2: Price breakdown card */}
            <Box sx={{ px: { xs: 3, md: 4 }, py: { xs: 3, md: 4 } }}>
              <Box
                sx={{
                  bgcolor: 'rgba(25,93,230,0.06)',
                  borderRadius: 2.5,
                  p: 3,
                  mb: 3,
                }}
              >
                <Stack spacing={2}>
                  {/* Entries per location */}
                  <Stack direction='row' justifyContent='space-between' alignItems='center'>
                    <Typography variant='body2' color='text.secondary'>
                      Entries per location
                    </Typography>
                    <Typography variant='body2' fontWeight={700} color='text.primary'>
                      {selectedTier.toLocaleString()} / mo
                    </Typography>
                  </Stack>

                  {/* Your locations */}
                  <Stack direction='row' justifyContent='space-between' alignItems='center'>
                    <Typography variant='body2' color='text.secondary'>
                      Your locations
                    </Typography>
                    {locationCount === null ? (
                      <Skeleton width={40} height={20} />
                    ) : (
                      <Typography variant='body2' fontWeight={700} color='text.primary'>
                        {effectiveLocationCount}
                      </Typography>
                    )}
                  </Stack>

                  {/* Price per location / mo */}
                  <Stack direction='row' justifyContent='space-between' alignItems='center'>
                    <Typography variant='body2' color='text.secondary'>
                      Price per location
                    </Typography>
                    <Typography variant='body2' fontWeight={700} color='text.primary'>
                      ${pricePerLocation.toLocaleString()}
                    </Typography>
                  </Stack>

                  <Divider sx={{ my: 1 }} />

                  {/* Total monthly */}
                  <Stack direction='row' justifyContent='space-between' alignItems='center'>
                    <Typography variant='body2' fontWeight={700} color='text.primary'>
                      Total per month
                    </Typography>
                    <Typography
                      variant='h5'
                      fontWeight={900}
                      sx={{
                        background: 'linear-gradient(135deg, #195DE2 0%, #7FA6FF 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      ${totalMonthly.toFixed(0)}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>

              {/* Support message at max tier */}
              {atMax && (
                <Typography
                  variant='body2'
                  textAlign='center'
                  sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.6 }}
                >
                  Need more than {MAX_TIER.toLocaleString()} entries?{' '}
                  <Typography component='span' variant='body2' sx={{ color: 'primary.main', fontWeight: 700, cursor: 'pointer' }}
                    onClick={() => window.location.href = 'mailto:support@winnbell.com'}
                  >
                    Contact our support team
                  </Typography>
                  {' '}for a custom plan.
                </Typography>
              )}

              {/* Error */}
              {error && (
                <Typography variant='body2' color='error' textAlign='center' mb={2}>
                  {error}
                </Typography>
              )}

              {/* Subscribe button */}
              <Button
                fullWidth
                variant='contained'
                size='large'
                startIcon={loading ? undefined : <CreditCard />}
                onClick={handleSubscribe}
                disabled={loading}
                sx={{
                  py: { xs: 1.75, md: 2 },
                  borderRadius: 3,
                  fontWeight: 800,
                  fontSize: { xs: '0.95rem', md: '1rem' },
                  boxShadow: '0 4px 14px rgba(25,93,230,0.35)',
                  '&:hover': { boxShadow: '0 6px 20px rgba(25,93,230,0.45)' },
                }}
              >
                {loading ? <CircularProgress size={24} color='inherit' /> : 'Subscribe & Join Next Draw'}
              </Button>

              <Typography variant='caption' color='text.disabled' textAlign='center' display='block' mt={1.5}>
                You will be redirected to Stripe's secure checkout. After payment you'll be entered into the next monthly draw and can start issuing tickets once it opens.
              </Typography>

              <Button
                fullWidth
                variant='text'
                size='small'
                onClick={() => navigate('/nearby')}
                sx={{ mt: 1.5, color: 'text.disabled', fontWeight: 600 }}
              >
                I'll do it later
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default SubscribePage;

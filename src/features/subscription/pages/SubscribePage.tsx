import { useState } from 'react';
import {
  Box, Button, Typography, Paper, Stack, Chip, CircularProgress,
  List, ListItem, ListItemIcon, ListItemText, Divider,
} from '@mui/material';
import {
  CheckCircle, ConfirmationNumber, EmojiEvents, Storefront, CreditCard, Groups,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../shared/api/client';
import {
  GRADIENT_HERO, ALPHA_WHITE_10, ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_30,
} from '../../../shared/colors';

const FEATURES = [
  { icon: <ConfirmationNumber />, text: 'Issue unlimited tickets to your customers' },
  { icon: <EmojiEvents />,        text: 'Enter monthly prize draws and grow your prize pool' },
  { icon: <Storefront />,         text: 'Appear on the Winnbell map so customers can find you' },
  { icon: <Groups />,             text: 'Assign branch managers to run your locations' },
];

const SubscribePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post<{ url: string }>('/business/subscription/checkout');
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
        '& > *': { minHeight: { md: '100vh' } },
      }}
    >
      {/* ── Left: Brand panel ── */}
      <Box
        sx={{
          width: { xs: '100%', md: '52%' },
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

      {/* ── Right: Pricing card ── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: { xs: 3, sm: 4, md: '5vh 6vw' },
          overflowY: 'auto',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: { xs: '100%', sm: 460, md: 480 } }}>
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
                Monthly
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                Cancel any time before the 1st of the following month
              </Typography>
            </Box>

            {/* Features */}
            <Box sx={{ px: { xs: 3, md: 4 }, py: 3 }}>
              <List dense disablePadding>
                {FEATURES.map((f, i) => (
                  <ListItem key={i} disableGutters sx={{ py: 0.75, alignItems: 'flex-start' }}>
                    <ListItemIcon sx={{ minWidth: 30, mt: 0.25 }}>
                      <CheckCircle sx={{ fontSize: 17, color: 'success.main' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={f.text}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 500, color: 'text.secondary' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Divider />

            {/* CTA */}
            <Box sx={{ px: { xs: 3, md: 4 }, py: { xs: 3, md: 3.5 } }}>
              {error && (
                <Typography variant='body2' color='error' textAlign='center' mb={2}>
                  {error}
                </Typography>
              )}

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
                {loading ? <CircularProgress size={24} color='inherit' /> : 'Subscribe & Activate'}
              </Button>

              <Typography variant='caption' color='text.disabled' textAlign='center' display='block' mt={1.5}>
                You will be redirected to Stripe's secure checkout. Your business activates immediately after payment.
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

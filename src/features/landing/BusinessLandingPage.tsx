import { useEffect } from 'react';
import { Box, Typography, Button, Stack, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowForward, Storefront } from '@mui/icons-material';
import LandingNavbar from './components/LandingNavbar';
import ForBusinesses from './components/ForBusinesses';
import LandingFooter from './components/LandingFooter';
import {
  GRADIENT_HERO_WARM,
  ALPHA_WHITE_15,
  ALPHA_WHITE_20,
  PRIMARY_MAIN,
  TEXT_HEADING,
  TEXT_SECONDARY,
} from '../../shared/colors';

const BusinessLandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column', overflowX: 'hidden', zoom: { xs: 0.9, md: 1 } }}>
      <LandingNavbar onNavigate={navigate} variant='business' />

      {/* Business Hero */}
      <Box
        sx={{
          background: GRADIENT_HERO_WARM,
          pt: { xs: 8, md: 12 },
          pb: { xs: 10, md: 16 },
          px: { xs: 2.5, md: 0 },
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative orbs */}
        <Box sx={{ position: 'absolute', top: '-20%', right: '-5%', width: 480, height: 480, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)', filter: 'blur(70px)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: '-15%', left: '-8%', width: 360, height: 360, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.03)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <Container maxWidth='md' sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              borderRadius: 99, px: 1.5, py: 0.5,
              fontSize: '0.65rem', fontWeight: 700,
              letterSpacing: '0.15em', textTransform: 'uppercase',
              bgcolor: ALPHA_WHITE_15,
              color: 'white',
              mb: 3,
            }}
          >
            <Storefront sx={{ fontSize: '0.85rem' }} />
            For business owners
          </Box>

          <Typography
            variant='h1'
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2.4rem', sm: '3.2rem', md: '4rem' },
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: 'white',
              mb: 3,
            }}
          >
            The cheapest marketing tool{' '}
            <Box component='span' sx={{ opacity: 0.8 }}>
              you'll ever use.
            </Box>
          </Typography>

          <Typography
            sx={{
              color: 'rgba(255,255,255,0.75)',
              fontSize: { xs: '1rem', md: '1.15rem' },
              lineHeight: 1.7,
              mb: 5,
              maxWidth: 520,
              mx: 'auto',
              fontWeight: 400,
            }}
          >
            One flat monthly subscription puts your business on the Winnbell map.
            Every receipt submitted from your store is a paying customer - tracked,
            attributed, and sitting in your dashboard.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent='center' alignItems='center'>
            <Button
              variant='contained'
              size='large'
              endIcon={<ArrowForward />}
              onClick={() => navigate('/register/Business')}
              sx={{
                bgcolor: 'white',
                color: PRIMARY_MAIN,
                fontWeight: 700,
                fontSize: '1rem',
                borderRadius: 2.5,
                px: 4,
                py: 1.6,
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.92)', boxShadow: '0 12px 32px rgba(0,0,0,0.3)' },
              }}
            >
              Become a partner
            </Button>
            <Button
              variant='text'
              endIcon={<ArrowForward sx={{ fontSize: '1rem !important' }} />}
              onClick={() => navigate('/')}
              sx={{
                color: 'rgba(255,255,255,0.8)',
                fontWeight: 500,
                fontSize: '0.9rem',
                opacity: 0.9,
                '&:hover': { bgcolor: 'transparent', opacity: 1, color: 'white' },
                textTransform: 'none',
              }}
            >
              I'm a shopper, not a business owner
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Value props + primary business CTA */}
      <ForBusinesses onNavigate={navigate} onScrollToBusinesses={() => {}} />

      {/* Business-focused bottom CTA */}
      <Box sx={{ py: { xs: 8, md: 10 }, px: { xs: 2.5, md: 0 }, bgcolor: 'background.paper', textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth='sm'>
          <Typography variant='h3' sx={{ fontWeight: 900, color: TEXT_HEADING, fontSize: { xs: '1.8rem', md: '2.2rem' }, letterSpacing: '-0.03em', lineHeight: 1.1, mb: 2 }}>
            Ready to get listed?
          </Typography>
          <Typography sx={{ color: TEXT_SECONDARY, fontSize: '1.05rem', lineHeight: 1.65, mb: 2, maxWidth: 400, mx: 'auto' }}>
            Simple monthly subscription. Your locations go live the same day. Cancel anytime.
          </Typography>
          <Box
            sx={{
              display: 'inline-block',
              bgcolor: ALPHA_WHITE_20,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              px: 2.5,
              py: 1,
              mb: 4,
            }}
          >
            <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.85rem', fontWeight: 600 }}>
              No setup fees. No long-term contracts.
            </Typography>
          </Box>
          <Box>
            <Button
              variant='contained'
              size='large'
              endIcon={<ArrowForward />}
              onClick={() => navigate('/register/Business')}
              sx={{ fontWeight: 700, fontSize: '1.05rem', borderRadius: 2.5, px: 5, py: 1.6, boxShadow: '0 8px 24px rgba(25,93,230,0.3)', '&:hover': { boxShadow: '0 12px 32px rgba(25,93,230,0.4)' } }}
            >
              Create a business account
            </Button>
          </Box>
        </Container>
      </Box>

      <LandingFooter onNavigate={navigate} />
    </Box>
  );
};

export default BusinessLandingPage;

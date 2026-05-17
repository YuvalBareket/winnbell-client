import { Box, Typography, Button, Stack, Container } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { PRIMARY_MAIN, GRADIENT_HERO, ALPHA_WHITE_15 } from '../../../shared/colors';

interface LandingHeroProps {
  onNavigate: (path: string) => void;
  onScrollToBusinesses: () => void;
}

const LandingHero = ({ onNavigate, onScrollToBusinesses }: LandingHeroProps) => {
  return (
    <Box
      sx={{
        background: GRADIENT_HERO,
        pt: { xs: 8, md: 12 },
        pb: { xs: 10, md: 16 },
        px: { xs: 2.5, md: 0 },
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative orbs */}
      <Box sx={{ position: 'absolute', top: '-20%', right: '-5%', width: 400, height: 400, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 300, height: 300, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)', filter: 'blur(50px)', pointerEvents: 'none' }} />

      <Container maxWidth='md' sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <Box
          sx={{
            display: 'inline-block',
            borderRadius: 99, px: 1.5, py: 0.5,
            fontSize: '0.65rem', fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            bgcolor: ALPHA_WHITE_15,
            color: 'white',
            mb: 3,
          }}
        >
          Win real prizes
        </Box>

        <Typography
          variant='h1'
          sx={{
            fontWeight: 900,
            fontSize: { xs: '2.6rem', sm: '3.5rem', md: '4.5rem' },
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: 'white',
            mb: 3,
          }}
        >
          Every purchase.{' '}
          <Box component='span' sx={{ opacity: 0.8 }}>
            A chance to win.
          </Box>
        </Typography>

        <Typography
          sx={{
            color: 'rgba(255,255,255,0.75)',
            fontSize: { xs: '1rem', md: '1.15rem' },
            lineHeight: 1.7,
            mb: 5,
            maxWidth: 480,
            mx: 'auto',
            fontWeight: 400,
          }}
        >
          Shop at local businesses, submit your receipt, and collect free entries
          for the monthly campaign. No catch, no cost.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent='center' alignItems='center' sx={{ mb: 4 }}>
          <Button
            variant='contained'
            size='large'
            onClick={() => onNavigate('/register')}
            sx={{
              bgcolor: 'white',
              color: PRIMARY_MAIN,
              fontWeight: 700,
              fontSize: '1rem',
              borderRadius: 2.5,
              px: 4,
              py: 1.6,
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.92)', boxShadow: '0 12px 32px rgba(0,0,0,0.25)' },
            }}
          >
            Start collecting entries
          </Button>
          <Button
            variant='text'
            endIcon={<ArrowForward sx={{ fontSize: '1rem !important' }} />}
            onClick={() => onNavigate('/login')}
            sx={{
              color: 'white',
              fontWeight: 600,
              fontSize: '0.95rem',
              opacity: 0.85,
              '&:hover': { bgcolor: 'transparent', opacity: 1 },
            }}
          >
            Sign in
          </Button>
        </Stack>

        <Button
          variant='text'
          endIcon={<ArrowForward sx={{ fontSize: '0.9rem !important' }} />}
          onClick={onScrollToBusinesses}
          sx={{
            color: 'rgba(255,255,255,0.8)',
            fontWeight: 500,
            fontSize: '0.85rem',
            opacity: 0.9,
            '&:hover': { bgcolor: 'transparent', opacity: 1, color: 'white' },
            textTransform: 'none',
          }}
        >
          Are you a business owner?
        </Button>
      </Container>
    </Box>
  );
};

export default LandingHero;

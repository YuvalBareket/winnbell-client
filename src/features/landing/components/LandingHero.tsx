import { Box, Typography, Button, Stack, Container } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { PRIMARY_MAIN, GRADIENT_HERO, ALPHA_WHITE_15 } from '../../../shared/colors';
import LandingNavbar from './LandingNavbar';

interface LandingHeroProps {
  onNavigate: (path: string) => void;
}

const LandingHero = ({ onNavigate }: LandingHeroProps) => {
  return (
    <Box
      sx={{
        background: GRADIENT_HERO,
        pt: 0,
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

      <LandingNavbar onNavigate={onNavigate} />

      <Container maxWidth='md' sx={{ position: 'relative', zIndex: 1, textAlign: 'center', pt: { xs: 5, md: 5 } }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Box
            sx={{
              display: 'inline-block',
              borderRadius: 99, px: { xs: 1.25, md: 1.5 }, py: { xs: 0.4, md: 0.5 },
              fontSize: { xs: '0.6rem', md: '0.65rem' }, fontWeight: 700,
              letterSpacing: '0.15em', textTransform: 'uppercase',
              bgcolor: ALPHA_WHITE_15,
              color: 'white',
              mb: { xs: 2, md: 3 },
            }}
          >
            Win real prizes
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Typography
            variant='h1'
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2.1rem', sm: '3.5rem', md: '4.5rem' },
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: 'white',
              mb: { xs: 2, md: 3 },
            }}
          >
            Shop local. Win monthly cash prizes.
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.75)',
              fontSize: { xs: '0.9rem', md: '1.15rem' },
              lineHeight: 1.6,
              mb: { xs: 3, md: 5 },
              maxWidth: 480,
              mx: 'auto',
              fontWeight: 400,
            }}
          >
            Turn everyday shopping into chances to win real monthly cash prizes. Earn entries
            through participating businesses or claim your free entry today. No purchase necessary.
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.5, md: 2 }} justifyContent='center' alignItems='center' sx={{ mb: { xs: 2.5, md: 4 } }}>
            <Button
              variant='contained'
              size='large'
              onClick={() => onNavigate('/register')}
              sx={{
                bgcolor: 'white',
                color: PRIMARY_MAIN,
                fontWeight: 700,
                fontSize: { xs: '0.95rem', md: '1rem' },
                px: { xs: 2.5, sm: 4 },
                py: { xs: 1.4, md: 1.6 },
                width: { xs: '100%', sm: 'auto' },
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
                fontSize: { xs: '0.9rem', md: '0.95rem' },
                opacity: 0.85,
                width: { xs: '100%', sm: 'auto' },
                '&:hover': { bgcolor: 'transparent', opacity: 1 },
              }}
            >
              Sign in
            </Button>
          </Stack>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.55 }}
        >
          <Button
            variant='text'
            endIcon={<ArrowForward sx={{ fontSize: '0.9rem !important', color: 'white', opacity: 0.75 }} />}
            onClick={() => onNavigate('/for-business')}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: { xs: '0.88rem', md: '0.95rem' },
              color: 'white',
              width: { xs: '100%', sm: 'auto' },
              mt: { xs: 1, sm: 0 },
              '&:hover': { bgcolor: 'transparent' },
            }}
          >
            {/* Shimmer is scoped to this inline span (not the button root): a background-clip:text
                element with an oversized animated background reports phantom scroll overflow, which
                is what caused the hero to scroll. Keeping it inline-block contains it to the text. */}
            <Box
              component='span'
              sx={{
                display: 'inline-block',
                background: 'linear-gradient(90deg, rgba(255,255,255,0.45) 20%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.45) 80%)',
                backgroundSize: '250% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmer 2.8s linear infinite',
                '@keyframes shimmer': {
                  '0%': { backgroundPosition: '200% center' },
                  '100%': { backgroundPosition: '-100% center' },
                },
              }}
            >
              Are you a business owner?
            </Box>
          </Button>
        </motion.div>
      </Container>
    </Box>
  );
};

export default LandingHero;

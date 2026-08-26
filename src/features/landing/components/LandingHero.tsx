import { Box, Typography, Button, Stack, Container } from '@mui/material';
import AttractButton from '../../../shared/components/AttractButton';
import { ArrowForward } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { PRIMARY_MAIN, GRADIENT_HERO } from '../../../shared/colors';
import LandingNavbar from './LandingNavbar';
import HeroShowcase from './HeroShowcase';

interface LandingHeroProps {
  onNavigate: (path: string) => void;
}

const BusinessOwnerLink = ({ onNavigate }: LandingHeroProps) => (
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
);

const LandingHero = ({ onNavigate }: LandingHeroProps) => {
  return (
    <Box
      sx={{
        background: GRADIENT_HERO,
        pt: 0,
        pb: { xs: 8, md: 14 },
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

      <Container maxWidth='lg' sx={{ position: 'relative', zIndex: 1, pt: { xs: 5, md: 5 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 360px' },
            gap: { xs: 0, md: 8 },
            alignItems: 'center',
            maxWidth: { xs: 600, md: 'none' },
            mx: 'auto',
          }}
        >
          <Box
            sx={{
              textAlign: { xs: 'center', md: 'left' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: { xs: 'center', md: 'flex-start' },
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Typography
                variant='h1'
                sx={{
                  fontWeight: 900,
                  // Fluid caps keep each <br> row on a single line (3 rows total): the widest row
                  // ("Turn everyday purchases") is 13.09em wide, so font <= column width / 13.09.
                  // On xs the h1 bleeds 16px per side into the hero padding (mx -2) to buy a
                  // larger font while the text still keeps a 20px margin from the screen edge.
                  fontSize: { xs: 'min(2.6rem, 8.4vw - 3px)', sm: '2.6rem', md: 'min(3.4rem, 7.6vw - 38px)' },
                  lineHeight: 1.1,
                  letterSpacing: '0.01em',
                  color: 'white',
                  mx: { xs: -2, sm: 0 },
                  mb: { xs: 2, md: 3 },
                }}
              >
                Turn everyday purchases<br />into chances to win<br />a real cash prize.
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
                  mx: { xs: 'auto', md: 0 },
                  fontWeight: 400,
                }}
              >
                Your morning coffee, your lunch run, your usual spots. Snap your receipt
                from any participating business and you're in the draw for a real cash
                prize. Plus one weekly entry on us. No purchase necessary to enter or win.
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{ width: '100%' }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1.5, md: 2 }}
                justifyContent={{ xs: 'center', md: 'flex-start' }}
                alignItems='center'
                sx={{ mb: { xs: 4, md: 4 } }}
              >
                <AttractButton onLightBackground
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
                  Claim your weekly entry
                </AttractButton>
                <BusinessOwnerLink onNavigate={onNavigate} />
              </Stack>
            </motion.div>
          </Box>

          {/* The five-beat app story loop */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ justifySelf: 'center' }}
          >
            <HeroShowcase />
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingHero;

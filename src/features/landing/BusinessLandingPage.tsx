import { useEffect } from 'react';
import { Box, Typography, Button, Stack, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowForward, Storefront } from '@mui/icons-material';
import { motion } from 'framer-motion';
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

  // overflowX 'clip' (not 'hidden') so overflow-y stays 'visible' and no phantom 100dvh scroll
  // container appears next to the page scrollbar. See LandingPage for the full note.
  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column', overflowX: 'clip', zoom: { xs: 0.9, md: 1 } }}>
      {/* Business Hero */}
      <Box
        sx={{
          background: GRADIENT_HERO_WARM,
          pt: 0,
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

        <LandingNavbar onNavigate={navigate} variant='business' />

        <Container maxWidth='md' sx={{ position: 'relative', zIndex: 1, textAlign: 'center', pt: { xs: 5, md: 5 } }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: { xs: 0.5, md: 0.75 },
                borderRadius: 99, px: { xs: 1.25, md: 1.5 }, py: { xs: 0.4, md: 0.5 },
                fontSize: { xs: '0.6rem', md: '0.65rem' }, fontWeight: 700,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                bgcolor: ALPHA_WHITE_15,
                color: 'white',
                mb: { xs: 2, md: 3 },
              }}
            >
              <Storefront sx={{ fontSize: { xs: '0.75rem', md: '0.85rem' } }} />
              For business owners
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
                fontSize: { xs: '2rem', sm: '3.2rem', md: '4rem' },
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                color: 'white',
                mb: { xs: 2, md: 3 },
              }}
            >
              Grow your customers, not your marketing budget.
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
                maxWidth: 520,
                mx: 'auto',
                fontWeight: 400,
              }}
            >
              The marketing platform designed to bring customers to your door.
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.5, md: 2 }} justifyContent='center' alignItems='center'>
              <Button
                variant='contained'
                size='large'
                endIcon={<ArrowForward />}
                onClick={() => navigate('/register/Business')}
                sx={{
                  bgcolor: 'white',
                  color: PRIMARY_MAIN,
                  fontWeight: 700,
                  fontSize: { xs: '0.95rem', md: '1rem' },
                  px: { xs: 2.5, sm: 4 },
                  py: { xs: 1.4, md: 1.6 },
                  width: { xs: '100%', sm: 'auto' },
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
                  fontSize: { xs: '0.85rem', md: '0.9rem' },
                  opacity: 0.9,
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': { bgcolor: 'transparent', opacity: 1, color: 'white' },
                  textTransform: 'none',
                }}
              >
                I'm a shopper, not a business owner
              </Button>
            </Stack>
          </motion.div>
        </Container>
      </Box>

      {/* Value props + primary business CTA */}
      <ForBusinesses onNavigate={navigate} onScrollToBusinesses={() => {}} />

      {/* Business-focused bottom CTA */}
      <Box sx={{ py: { xs: 6, md: 10 }, px: { xs: 2.5, md: 0 }, bgcolor: 'background.paper', textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth='sm'>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            <Typography variant='h3' sx={{ fontWeight: 900, color: TEXT_HEADING, fontSize: { xs: '1.6rem', md: '2.2rem' }, letterSpacing: '-0.03em', lineHeight: 1.15, mb: { xs: 1.5, md: 2 } }}>
              Ready to get listed?
            </Typography>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <Typography sx={{ color: TEXT_SECONDARY, fontSize: { xs: '0.95rem', md: '1.05rem' }, lineHeight: 1.6, mb: { xs: 1.5, md: 2 }, maxWidth: 400, mx: 'auto' }}>
              Simple monthly subscription. Your locations go live the same day. Cancel anytime.
            </Typography>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Box
              sx={{
                display: 'inline-block',
                bgcolor: ALPHA_WHITE_20,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                px: { xs: 2, md: 2.5 },
                py: { xs: 0.75, md: 1 },
                mb: { xs: 3, md: 4 },
              }}
            >
              <Typography sx={{ color: TEXT_SECONDARY, fontSize: { xs: '0.75rem', md: '0.85rem' }, fontWeight: 600, whiteSpace: 'nowrap' }}>
                No setup fees. No long-term contracts.
              </Typography>
            </Box>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.2 }}
          >
            <Box>
              <Button
                variant='contained'
                size='large'
                endIcon={<ArrowForward />}
                onClick={() => navigate('/register/Business')}
                sx={{ fontWeight: 700, fontSize: { xs: '0.95rem', md: '1.05rem' }, px: { xs: 2.5, md: 5 }, py: { xs: 1.3, md: 1.6 }, width: { xs: '100%', md: 'auto' }, boxShadow: '0 8px 24px rgba(25,93,230,0.3)', '&:hover': { boxShadow: '0 12px 32px rgba(25,93,230,0.4)' } }}
              >
                Create a business account
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      <LandingFooter onNavigate={navigate} />
    </Box>
  );
};

export default BusinessLandingPage;

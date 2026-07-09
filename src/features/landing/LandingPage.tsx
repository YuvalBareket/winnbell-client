import { useEffect } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../shared/api/client';
import { queryKeys } from '../../shared/constants/queryKeys';
import LandingHero from './components/LandingHero';
import HowItWorks from './components/HowItWorks';
import Testimonial from './components/Testimonial';
import FinalCTA from './components/FinalCTA';
import LandingFooter from './components/LandingFooter';

const LandingPage = () => {
  const navigate = useNavigate();

  // Warm the region check in the background so tapping Log in / Sign up navigates instantly
  // — RegionGate finds it already cached instead of showing a loader while it fetches.
  useQuery({
    queryKey: queryKeys.region.check,
    queryFn: () => api.get<{ blocked: boolean }>('/auth/region-check').then(r => r.data),
    staleTime: 5 * 60_000,
    retry: false,
  });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column', overflowX: 'hidden', zoom: { xs: 0.9, md: 1 } }}>
      <LandingHero onNavigate={navigate} />
      {/* These sections run their own internal whileInView entrances - double-wrapping them
          risks the inner triggers never firing, so they render bare. */}
      <HowItWorks />
      <Testimonial />
      <FinalCTA onNavigate={navigate} />
      {/* Footer has no internal animation. NO negative viewport margin here: the footer is
          shorter than 100px, so margin '-100px' could never trigger and left it invisible. */}
      <motion.div whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 24 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>
        <LandingFooter onNavigate={navigate} />
      </motion.div>
    </Box>
  );
};

export default LandingPage;

import { useEffect } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../shared/api/client';
import { queryKeys } from '../../shared/constants/queryKeys';
import LandingNavbar from './components/LandingNavbar';
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
      <LandingNavbar onNavigate={navigate} />
      <LandingHero onNavigate={navigate} />
      <HowItWorks />
      <Testimonial />
      <FinalCTA onNavigate={navigate} />
      <LandingFooter onNavigate={navigate} />
    </Box>
  );
};

export default LandingPage;

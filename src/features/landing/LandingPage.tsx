import { useEffect } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LandingNavbar from './components/LandingNavbar';
import LandingHero from './components/LandingHero';
import HowItWorks from './components/HowItWorks';
import Testimonial from './components/Testimonial';
import FinalCTA from './components/FinalCTA';
import LandingFooter from './components/LandingFooter';

const LandingPage = () => {
  const navigate = useNavigate();

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

import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LandingNavbar from './components/LandingNavbar';
import LandingHero from './components/LandingHero';
import AudienceSplit from './components/AudienceSplit';
import HowItWorks from './components/HowItWorks';
import Testimonial from './components/Testimonial';
import ForBusinesses from './components/ForBusinesses';
import LandingFAQ from './components/LandingFAQ';
import FinalCTA from './components/FinalCTA';
import LandingFooter from './components/LandingFooter';

const LandingPage = () => {
  const navigate = useNavigate();

  const scrollToBusinesses = () => document.getElementById('for-businesses')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column', overflowX: 'hidden', zoom: { xs: 0.9, md: 1 } }}>
      <LandingNavbar onNavigate={navigate} onScrollToBusinesses={scrollToBusinesses} />
      <LandingHero onNavigate={navigate} onScrollToBusinesses={scrollToBusinesses} />
      <AudienceSplit onNavigate={navigate} />
      <HowItWorks />
      <Testimonial />
      <ForBusinesses onNavigate={navigate} onScrollToBusinesses={scrollToBusinesses} />
      <LandingFAQ />
      <FinalCTA onNavigate={navigate} onScrollToBusinesses={scrollToBusinesses} />
      <LandingFooter onNavigate={navigate} />
    </Box>
  );
};

export default LandingPage;

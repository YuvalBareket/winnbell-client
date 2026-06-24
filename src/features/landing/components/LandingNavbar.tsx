import { Box, Button, Stack } from '@mui/material';
import { PRIMARY_MAIN } from '../../../shared/colors';

interface LandingNavbarProps {
  onNavigate: (path: string) => void;
  variant?: 'consumer' | 'business';
}

// Rendered inside the hero so it shares the hero's gradient background (white logo on blue).
const LandingNavbar = ({ onNavigate, variant = 'consumer' }: LandingNavbarProps) => {
  return (
    <Box
      component='nav'
      sx={{
        position: 'relative', zIndex: 2,
        px: { xs: 0, md: 6 }, py: 1.5,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}
    >
      <Box component='img' src='/winnbell_app_name_white.svg' alt='Winnbell' sx={{ height: 40, width: 'auto', objectFit: 'contain' }} />
      <Stack direction='row' spacing={{ xs: 0.75, md: 1 }} alignItems='center'>
        <Button
          variant='text'
          onClick={() => onNavigate(variant === 'business' ? '/' : '/for-business')}
          sx={{
            color: 'white', fontWeight: 700, fontSize: '1rem',
            display: { xs: 'none', sm: 'inline-flex' },
            '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
          }}
        >
          {variant === 'business' ? 'For Users' : 'For Businesses'}
        </Button>
        <Button
          variant='text'
          onClick={() => onNavigate('/login')}
          sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '0.85rem', md: '1rem' }, minHeight: 44, px: { xs: 0.75, md: 1 }, '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } }}
        >
          Log in
        </Button>
        <Button
          variant='contained'
          onClick={() => onNavigate('/register')}
          sx={{
            bgcolor: 'white', color: PRIMARY_MAIN, fontWeight: 700,
            px: { xs: 1.5, md: 2.5 }, py: { xs: 0.75, md: 1 }, boxShadow: 'none',
            fontSize: { xs: '0.85rem', md: '1rem' }, minHeight: 44,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
          }}
        >
          Get started
        </Button>
      </Stack>
    </Box>
  );
};

export default LandingNavbar;

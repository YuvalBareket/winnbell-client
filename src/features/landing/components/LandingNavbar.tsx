import { Box, Button, Stack } from '@mui/material';
import { TEXT_HEADING } from '../../../shared/colors';

interface LandingNavbarProps {
  onNavigate: (path: string) => void;
  variant?: 'consumer' | 'business';
}

const LandingNavbar = ({ onNavigate, variant = 'consumer' }: LandingNavbarProps) => {
  return (
    <Box
      component='nav'
      sx={{
        position: 'sticky', top: 0, zIndex: 100,
        bgcolor: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        px: { xs: 2.5, md: 6 }, py: 1.5,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}
    >
      <Box component='img' src='/winnbell_app_name.svg' alt='Winnbell' sx={{ height: 40, width: 'auto', objectFit: 'contain' }} />
      <Stack direction='row' spacing={{ xs: 0.75, md: 1 }} alignItems='center'>
        <Button
          variant='text'
          onClick={() => onNavigate(variant === 'business' ? '/' : '/for-business')}
          sx={{ color: TEXT_HEADING, fontWeight: 600, fontSize: '0.9rem', display: { xs: 'none', sm: 'inline-flex' } }}
        >
          {variant === 'business' ? 'For Users' : 'For Businesses'}
        </Button>
        <Button
          variant='text'
          onClick={() => onNavigate('/login')}
          sx={{ color: TEXT_HEADING, fontWeight: 600, fontSize: { xs: '0.85rem', md: '1rem' }, minHeight: 44, px: { xs: 0.75, md: 1 } }}
        >
          Log in
        </Button>
        <Button
          variant='contained'
          onClick={() => onNavigate('/register')}
          sx={{ fontWeight: 700, px: { xs: 1.5, md: 2.5 }, py: { xs: 0.75, md: 1 }, boxShadow: 'none', fontSize: { xs: '0.85rem', md: '1rem' }, minHeight: 44 }}
        >
          Get started
        </Button>
      </Stack>
    </Box>
  );
};

export default LandingNavbar;

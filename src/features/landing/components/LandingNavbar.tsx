import { Box, Typography, Button, Stack } from '@mui/material';
import { PRIMARY_MAIN, TEXT_HEADING } from '../../../shared/colors';

interface LandingNavbarProps {
  onNavigate: (path: string) => void;
  onScrollToBusinesses: () => void;
}

const LandingNavbar = ({ onNavigate, onScrollToBusinesses }: LandingNavbarProps) => {
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
      <Typography fontWeight={900} fontSize='1.3rem' letterSpacing='-0.03em'>
        <span style={{ color: TEXT_HEADING }}>Winn</span>
        <span style={{ color: PRIMARY_MAIN }}>bell</span>
      </Typography>
      <Stack direction='row' spacing={1} alignItems='center'>
        <Button
          variant='text'
          onClick={onScrollToBusinesses}
          sx={{ color: TEXT_HEADING, fontWeight: 600, fontSize: '0.9rem', display: { xs: 'none', sm: 'inline-flex' } }}
        >
          For Businesses
        </Button>
        <Button
          variant='text'
          onClick={() => onNavigate('/login')}
          sx={{ color: TEXT_HEADING, fontWeight: 600 }}
        >
          Log in
        </Button>
        <Button
          variant='contained'
          onClick={() => onNavigate('/register')}
          sx={{ fontWeight: 700, borderRadius: 2, px: 2.5, boxShadow: 'none' }}
        >
          Get started
        </Button>
      </Stack>
    </Box>
  );
};

export default LandingNavbar;

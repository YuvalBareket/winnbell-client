import { Box, Typography, Stack } from '@mui/material';
import { PRIMARY_MAIN, TEXT_SECONDARY } from '../../../shared/colors';

interface LandingFooterProps {
  onNavigate: (path: string) => void;
}

const LandingFooter = ({ onNavigate }: LandingFooterProps) => {
  return (
    <Box
      component='footer'
      sx={{
        py: 2.5, px: { xs: 2.5, md: 6 },
        bgcolor: 'background.default',
        borderTop: '1px solid', borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box component='img' src='/winnbell_app_name.svg' alt='Winnbell' sx={{ height: { xs: 20, md: 28 }, width: 'auto', objectFit: 'contain' }} />
      <Stack direction='row' spacing={{ xs: 2, md: 2.5 }} alignItems='center'>
        {[{ label: 'Terms', path: '/terms' }, { label: 'Privacy', path: '/privacy' }, { label: 'Contact', path: '/contact' }].map(({ label, path }) => (
          <Typography key={label} component='a' onClick={() => onNavigate(path)} variant='caption' sx={{ color: TEXT_SECONDARY, cursor: 'pointer', textDecoration: 'none', fontWeight: 500, fontSize: { xs: '0.7rem', md: '0.875rem' }, '&:hover': { color: PRIMARY_MAIN } }}>
            {label}
          </Typography>
        ))}
      </Stack>
      <Typography variant='caption' color={TEXT_SECONDARY} sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' } }}>
        &copy; {new Date().getFullYear()} Winnbell
      </Typography>
    </Box>
  );
};

export default LandingFooter;

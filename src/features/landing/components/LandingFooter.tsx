import { Box, Typography, Stack } from '@mui/material';
import { PRIMARY_MAIN, TEXT_SECONDARY, TEXT_HEADING } from '../../../shared/colors';

interface LandingFooterProps {
  onNavigate: (path: string) => void;
}

const LandingFooter = ({ onNavigate }: LandingFooterProps) => {
  return (
    <Box
      component='footer'
      sx={{
        py: 3, px: { xs: 2.5, md: 6 },
        bgcolor: 'background.default',
        borderTop: '1px solid', borderColor: 'divider',
        display: 'flex', flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'space-between', gap: 2,
      }}
    >
      <Typography fontWeight={900} fontSize='1.1rem' letterSpacing='-0.03em'>
        <span style={{ color: TEXT_HEADING }}>Winn</span>
        <span style={{ color: PRIMARY_MAIN }}>bell</span>
      </Typography>
      <Stack direction='row' spacing={2.5}>
        {[{ label: 'Terms', path: '/terms' }, { label: 'Privacy', path: '/privacy' }].map(({ label, path }) => (
          <Typography key={label} component='a' onClick={() => onNavigate(path)} variant='caption' sx={{ color: TEXT_SECONDARY, cursor: 'pointer', textDecoration: 'none', fontWeight: 500, '&:hover': { color: PRIMARY_MAIN } }}>
            {label}
          </Typography>
        ))}
      </Stack>
      <Typography variant='caption' color={TEXT_SECONDARY}>
        &copy; {new Date().getFullYear()} Winnbell
      </Typography>
    </Box>
  );
};

export default LandingFooter;

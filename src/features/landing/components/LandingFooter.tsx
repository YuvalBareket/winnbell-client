import { Box, Typography, Stack, Link } from '@mui/material';
import { PRIMARY_MAIN, TEXT_SECONDARY, ALPHA_PRIMARY_20 } from '../../../shared/colors';

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
        // Mobile: one row cannot hold logo + 4 links + copyright - stack centered instead.
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        justifyContent: { md: 'space-between' },
        gap: { xs: 1.5, md: 0 },
      }}
    >
      <Box component='img' src='/winnbell_app_name.svg' alt='Winnbell' sx={{ height: { xs: 20, md: 28 }, width: 'auto', objectFit: 'contain' }} />
      <Stack direction='row' spacing={{ xs: 2, md: 2.5 }} alignItems='center' justifyContent='center' flexWrap='wrap' useFlexGap>
        {/* Real hrefs: keyboard-focusable and announced as links; SPA navigation via preventDefault */}
        {[{ label: 'Terms', path: '/terms' }, { label: 'Privacy', path: '/privacy' }, { label: 'Contact', path: '/contact' }, { label: 'Accessibility', path: '/accessibility' }].map(({ label, path }) => (
          <Link
            key={label}
            href={path}
            onClick={(e) => { e.preventDefault(); onNavigate(path); }}
            sx={{
              fontSize: { xs: '0.75rem', md: '0.875rem' },
              fontWeight: 500,
              color: PRIMARY_MAIN,
              cursor: 'pointer',
              textDecoration: 'underline',
              textDecorationColor: ALPHA_PRIMARY_20,
              textDecorationThickness: '1px',
              textUnderlineOffset: '3px',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: PRIMARY_MAIN,
                textDecorationColor: PRIMARY_MAIN,
                textDecorationThickness: '2px',
              },
              '&:focus-visible': {
                outline: `2px solid ${PRIMARY_MAIN}`,
                outlineOffset: '4px',
                borderRadius: '2px',
              },
            }}
          >
            {label}
          </Link>
        ))}
      </Stack>
      <Typography variant='caption' color={TEXT_SECONDARY} sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' } }}>
        &copy; {new Date().getFullYear()} Winnbell
      </Typography>
    </Box>
  );
};

export default LandingFooter;

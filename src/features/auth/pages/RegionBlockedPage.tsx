import { Box, Container, Typography, Stack, Paper, useMediaQuery, useTheme } from '@mui/material';
import { PublicOutlined } from '@mui/icons-material';
import AuthBrandPanel from '../components/AuthBrandPanel';
import { BG_PAGE } from '../../../shared/colors';

// ─── Main component ──────────────────────────────────────────────────────────

const RegionBlockedPage = () => {
  const currentYear = new Date().getFullYear();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // ─── Content panel ───────────────────────────────────────────────────────────

  const ContentPanel = () => (
    <Stack spacing={4} alignItems='center' textAlign='center'>
      {/* Globe icon in colored paper */}
      <Paper elevation={4} sx={{ width: 80, height: 80, bgcolor: 'primary.main', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <PublicOutlined sx={{ color: 'white', fontSize: 44 }} />
      </Paper>

      {/* Heading */}
      <Typography variant='h4' sx={{ fontWeight: 700 }}>
        Not Available Yet
      </Typography>

      {/* Subtext */}
      <Typography variant='body1' color='text.secondary' sx={{ maxWidth: 380 }}>
        Winnbell isn't available in your region yet. We're expanding soon - we'll be with you before you know it.
      </Typography>

      {/* Version caption */}
      <Typography variant='caption' color='text.disabled' sx={{ mt: 6 }}>
        Winnbell v1.0 · {currentYear}
      </Typography>
    </Stack>
  );

  // ─── Desktop layout ──────────────────────────────────────────────────────────

  if (isDesktop) {
    return (
      <Box sx={{ display: 'flex', height: 'var(--dvh100, 100dvh)', overflow: 'hidden' }}>
        <AuthBrandPanel />

        {/* Right: content panel */}
        <Box
          sx={{
            width: '50%',
            overflowY: 'auto',
            bgcolor: BG_PAGE,
            display: 'flex',
            flexDirection: 'column',
            px: 7,
            py: 5,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ maxWidth: 400 }}>
            {ContentPanel()}
          </Box>
        </Box>
      </Box>
    );
  }

  // ─── Mobile layout ──────────────────────────────────────────────────────────

  return (
    <Box sx={{ minHeight: 'var(--dvh100, 100dvh)', display: 'flex', flexDirection: 'column', bgcolor: BG_PAGE, px: 2, py: 6, justifyContent: 'center', alignItems: 'center' }}>
      <Container maxWidth='xs'>
        {ContentPanel()}
      </Container>
    </Box>
  );
};

export default RegionBlockedPage;

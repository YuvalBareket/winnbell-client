import { Box, Container, Typography, Stack, Paper, Link, useMediaQuery, useTheme } from '@mui/material';
import { PublicOutlined, Instagram } from '@mui/icons-material';
import AuthBrandPanel from '../components/AuthBrandPanel';
import { BG_PAGE, TEXT_TERTIARY_AA } from '../../../shared/colors';

const INSTAGRAM_URL = 'https://www.instagram.com/winnbell_official/';

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

      {/* Instagram follow prompt */}
      <Link
        href={INSTAGRAM_URL}
        target='_blank'
        rel='noopener noreferrer'
        underline='none'
        sx={{
          display: 'inline-flex', alignItems: 'center', gap: 0.75,
          color: 'primary.main', fontWeight: 700, fontSize: '0.95rem',
          '&:hover': { textDecoration: 'underline' },
          '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 4, borderRadius: '4px' },
        }}
      >
        <Instagram sx={{ fontSize: 20 }} />
        Stay tuned on our Instagram for updates
      </Link>

      {/* Version caption */}
      <Typography variant='caption' sx={{ mt: 6, color: TEXT_TERTIARY_AA }}>
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
            flex: 1,
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

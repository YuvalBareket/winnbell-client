import { useNavigate } from 'react-router-dom';
import { Box, Container, IconButton, Typography, Stack, useMediaQuery, useTheme } from '@mui/material';
import { ArrowBackIosNew } from '@mui/icons-material';
import AuthBrandPanel from '../components/AuthBrandPanel';
import RegionBlockedContent from '../../../shared/components/RegionBlockedContent';
import { BG_PAGE, BORDER_LIGHT, TEXT_TERTIARY_AA } from '../../../shared/colors';

// ─── Main component ──────────────────────────────────────────────────────────

const RegionBlockedPage = () => {
  const currentYear = new Date().getFullYear();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();

  // The gates land here via replace, so -1 is the page BEFORE the gated one (landing/login).
  // Direct loads have no app history - fall back to the landing page.
  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/', { replace: true });
  };

  const backButton = (
    <IconButton
      aria-label='Go back'
      onClick={handleBack}
      sx={{
        position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 16px)', left: 16,
        bgcolor: 'white', border: `1px solid ${BORDER_LIGHT}`,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <ArrowBackIosNew fontSize='small' />
    </IconButton>
  );

  // ─── Content panel ───────────────────────────────────────────────────────────

  const ContentPanel = () => (
    <Stack spacing={4} alignItems='center' textAlign='center'>
      <RegionBlockedContent />

      {/* Version caption (standalone page only) */}
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
            position: 'relative',
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
          {backButton}
          <Box sx={{ maxWidth: 400 }}>
            {ContentPanel()}
          </Box>
        </Box>
      </Box>
    );
  }

  // ─── Mobile layout ──────────────────────────────────────────────────────────

  return (
    <Box sx={{ minHeight: 'var(--dvh100, 100dvh)', position: 'relative', display: 'flex', flexDirection: 'column', bgcolor: BG_PAGE, px: 2, py: 6, justifyContent: 'center', alignItems: 'center' }}>
      {backButton}
      <Container maxWidth='xs'>
        {ContentPanel()}
      </Container>
    </Box>
  );
};

export default RegionBlockedPage;

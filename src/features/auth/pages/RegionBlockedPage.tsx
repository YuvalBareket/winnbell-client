import { Box, Container, Typography, Stack, Paper, useMediaQuery, useTheme } from '@mui/material';
import { PublicOutlined, ConfirmationNumber, Storefront, EmojiEvents, CardGiftcard } from '@mui/icons-material';
import {
  BG_PAGE, GRADIENT_HERO, ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_30,
} from '../../../shared/colors';

// ─── Shared brand panel for desktop ─────────────────────────────────────────

const BrandPanel = () => (
  <Box
    sx={{
      width: '50%',
      background: GRADIENT_HERO,
      display: { xs: 'none', md: 'flex' },
      flexDirection: 'column',
      justifyContent: 'center',
      p: 6,
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* Decorative orbs */}
    <Box sx={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', bgcolor: ALPHA_WHITE_15, filter: 'blur(60px)' }} />
    <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', bgcolor: 'rgba(66,165,245,0.2)', filter: 'blur(50px)' }} />

    {/* Logo */}
    <Stack direction='row' alignItems='center' spacing={1.5} mb={5}>
      <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: ALPHA_WHITE_20, border: `1px solid ${ALPHA_WHITE_30}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ConfirmationNumber sx={{ fontSize: 24 }} />
      </Box>
      <Typography variant='h5' fontWeight={900} letterSpacing={-0.5}>Winnbell</Typography>
    </Stack>

    {/* Headline */}
    <Typography variant='h3' fontWeight={900} lineHeight={1.15} mb={2}>
      Real Prizes.<br />Every Month.
    </Typography>
    <Typography variant='body1' sx={{ opacity: 0.8, mb: 5, lineHeight: 1.7, maxWidth: 340 }}>
      Join thousands of members supporting local businesses and competing for real monthly prizes. No purchase necessary.
    </Typography>

    {/* Feature bullets */}
    <Stack spacing={2.5}>
      {[
        { icon: <Storefront sx={{ fontSize: 18 }} />, text: 'Earn entries at local partner businesses' },
        { icon: <EmojiEvents sx={{ fontSize: 18 }} />, text: 'Claim your free weekly entry - no purchase needed' },
        { icon: <CardGiftcard sx={{ fontSize: 18 }} />, text: 'Compete for real cash prizes every month' },
      ].map((item, i) => (
        <Stack key={i} direction='row' alignItems='center' spacing={1.5}>
          <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: ALPHA_WHITE_15, border: `1px solid ${ALPHA_WHITE_20}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {item.icon}
          </Box>
          <Typography variant='body2' fontWeight={600} sx={{ opacity: 0.9 }}>{item.text}</Typography>
        </Stack>
      ))}
    </Stack>

  </Box>
);

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
      <Box sx={{ display: 'flex', height: '100dvh', overflow: 'hidden' }}>
        <BrandPanel />

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
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: BG_PAGE, px: 2, py: 6, justifyContent: 'center', alignItems: 'center' }}>
      <Container maxWidth='xs'>
        {ContentPanel()}
      </Container>
    </Box>
  );
};

export default RegionBlockedPage;

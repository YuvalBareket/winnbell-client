import { Box, Typography, Button, Stack, Container, Divider } from '@mui/material';
import {
  ConfirmationNumber, Storefront, EmojiEvents,
  CheckCircle, ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  PRIMARY_MAIN, BRAND_NAVY, BG_PAGE,
  GRADIENT_PRIMARY, GRADIENT_HERO,
  BORDER_LIGHT, TEXT_SECONDARY, TEXT_HEADING,
  ALPHA_WHITE_15, ALPHA_WHITE_30,
} from '../../shared/colors';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: BG_PAGE, display: 'flex', flexDirection: 'column' }}>

      {/* ── Navbar ── */}
      <Box
        component='nav'
        sx={{
          position: 'sticky', top: 0, zIndex: 100,
          bgcolor: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${BORDER_LIGHT}`,
          px: { xs: 3, md: 6 }, py: 1.5,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <Typography fontWeight={800} fontSize='1.25rem' letterSpacing={-0.5}>
          <span style={{ color: TEXT_HEADING }}>Winn</span>
          <span style={{ color: PRIMARY_MAIN }}>bell</span>
        </Typography>
        <Stack direction='row' spacing={1.5}>
          <Button
            variant='text'
            onClick={() => navigate('/login')}
            sx={{ color: TEXT_HEADING, fontWeight: 600, textTransform: 'none' }}
          >
            Log in
          </Button>
          <Button
            variant='contained'
            onClick={() => navigate('/register')}
            sx={{
              background: GRADIENT_PRIMARY,
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              boxShadow: 'none',
            }}
          >
            Get started
          </Button>
        </Stack>
      </Box>

      {/* ── Hero ── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          py: { xs: 8, md: 12 },
          px: { xs: 3, md: 0 },
          background: `radial-gradient(ellipse at 60% 0%, rgba(25,93,230,0.07) 0%, transparent 70%)`,
        }}
      >
        <Container maxWidth='sm' sx={{ textAlign: 'center' }}>
          <Typography
            variant='h1'
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2.4rem', md: '3.2rem' },
              lineHeight: 1.1,
              color: TEXT_HEADING,
              mb: 2.5,
            }}
          >
            Shop local.{' '}
            <Box component='span' sx={{ background: GRADIENT_PRIMARY, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Win big.
            </Box>
          </Typography>

          <Typography
            variant='body1'
            sx={{ color: TEXT_SECONDARY, fontSize: '1.1rem', lineHeight: 1.7, mb: 4, maxWidth: 480, mx: 'auto' }}
          >
            Winnbell turns every visit to a local business into a chance to win a prize.
            Scan a QR code, collect a ticket, and enter the monthly draw. Completely free.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent='center'>
            <Button
              variant='contained'
              size='large'
              endIcon={<ArrowForward />}
              onClick={() => navigate('/register')}
              sx={{
                background: GRADIENT_PRIMARY,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                borderRadius: 2.5,
                px: 4,
                py: 1.5,
                boxShadow: '0 4px 16px rgba(25,93,230,0.3)',
              }}
            >
              Start collecting tickets
            </Button>
            <Button
              variant='outlined'
              size='large'
              onClick={() => navigate('/login')}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                borderRadius: 2.5,
                px: 4,
                py: 1.5,
                borderColor: BORDER_LIGHT,
                color: TEXT_HEADING,
                '&:hover': { borderColor: PRIMARY_MAIN, color: PRIMARY_MAIN, bgcolor: 'transparent' },
              }}
            >
              I already have an account
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* ── How it works ── */}
      <Box sx={{ py: { xs: 7, md: 10 }, px: { xs: 3, md: 0 }, bgcolor: 'white', borderTop: `1px solid ${BORDER_LIGHT}` }}>
        <Container maxWidth='md'>
          <Typography variant='h5' fontWeight={800} textAlign='center' color={TEXT_HEADING} mb={6}>
            How it works
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={4}
            divider={<Divider orientation='vertical' flexItem sx={{ borderColor: BORDER_LIGHT, display: { xs: 'none', sm: 'block' } }} />}
          >
            {[
              {
                icon: <Storefront sx={{ fontSize: 32, color: PRIMARY_MAIN }} />,
                title: 'Visit a partner',
                body: 'Find a Winnbell partner near you (a cafe, shop, or restaurant) and make a purchase.',
              },
              {
                icon: <ConfirmationNumber sx={{ fontSize: 32, color: PRIMARY_MAIN }} />,
                title: 'Scan & collect',
                body: 'Scan the QR code at the counter to redeem your free ticket for the current prize draw.',
              },
              {
                icon: <EmojiEvents sx={{ fontSize: 32, color: PRIMARY_MAIN }} />,
                title: 'Win prizes',
                body: 'At the end of the draw period, a winner is selected. More tickets = more chances to win.',
              },
            ].map((step) => (
              <Box key={step.title} sx={{ flex: 1, textAlign: 'center', px: 1 }}>
                <Box
                  sx={{
                    width: 64, height: 64,
                    borderRadius: 3,
                    bgcolor: 'rgba(25,93,230,0.07)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mx: 'auto', mb: 2,
                  }}
                >
                  {step.icon}
                </Box>
                <Typography fontWeight={700} color={TEXT_HEADING} mb={0.75}>
                  {step.title}
                </Typography>
                <Typography variant='body2' color={TEXT_SECONDARY} lineHeight={1.65}>
                  {step.body}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* ── Business section ── */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          px: { xs: 3, md: 0 },
          background: GRADIENT_HERO,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* decorative orb */}
        <Box sx={{ position: 'absolute', top: '-15%', right: '-8%', width: 320, height: 320, bgcolor: ALPHA_WHITE_15, borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <Container maxWidth='sm' sx={{ position: 'relative', textAlign: 'center' }}>
          <Box
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: 1,
              bgcolor: ALPHA_WHITE_15, border: `1px solid ${ALPHA_WHITE_30}`,
              px: 2, py: 0.75, borderRadius: 50, mb: 3,
            }}
          >
            <Storefront sx={{ fontSize: 16 }} />
            <Typography variant='caption' fontWeight={700} letterSpacing={0.5} textTransform='uppercase'>
              For businesses
            </Typography>
          </Box>

          <Typography
            variant='h3'
            fontWeight={900}
            sx={{ fontSize: { xs: '2rem', md: '2.6rem' }, lineHeight: 1.15, mb: 2.5 }}
          >
            Turn customers into loyal regulars
          </Typography>

          <Typography
            variant='body1'
            sx={{ opacity: 0.85, fontSize: '1.05rem', lineHeight: 1.7, mb: 4, maxWidth: 440, mx: 'auto' }}
          >
            Partner with Winnbell and give your customers a reason to keep coming back.
            Every visit becomes an exciting moment, and you get the footfall.
          </Typography>

          <Stack spacing={1.5} sx={{ mb: 5, textAlign: 'left', maxWidth: 360, mx: 'auto' }}>
            {[
              'Zero cost to join. Free for partners',
              'Drive repeat visits and word-of-mouth',
              'Get listed on the Winnbell partner map',
              'Simple dashboard to manage your location',
            ].map((point) => (
              <Stack key={point} direction='row' spacing={1.5} alignItems='center'>
                <CheckCircle sx={{ fontSize: 20, opacity: 0.9, flexShrink: 0 }} />
                <Typography variant='body2' sx={{ opacity: 0.9, fontWeight: 500 }}>
                  {point}
                </Typography>
              </Stack>
            ))}
          </Stack>

          <Button
            variant='contained'
            size='large'
            endIcon={<ArrowForward />}
            onClick={() => navigate('/register/Business')}
            sx={{
              bgcolor: 'white',
              color: BRAND_NAVY,
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '1rem',
              borderRadius: 2.5,
              px: 4,
              py: 1.5,
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.92)' },
            }}
          >
            Become a partner
          </Button>
        </Container>
      </Box>

      {/* ── Footer ── */}
      <Box
        component='footer'
        sx={{
          py: 3, px: { xs: 3, md: 6 },
          bgcolor: 'white',
          borderTop: `1px solid ${BORDER_LIGHT}`,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Typography fontWeight={800} fontSize='1rem'>
          <span style={{ color: TEXT_HEADING }}>Winn</span>
          <span style={{ color: PRIMARY_MAIN }}>bell</span>
        </Typography>
        <Stack direction='row' spacing={2.5}>
          {[
            { label: 'Terms', path: '/terms' },
            { label: 'Privacy', path: '/privacy' },
          ].map(({ label, path }) => (
            <Typography
              key={label}
              component='a'
              onClick={() => navigate(path)}
              variant='caption'
              sx={{ color: TEXT_SECONDARY, cursor: 'pointer', textDecoration: 'none', fontWeight: 500, '&:hover': { color: PRIMARY_MAIN } }}
            >
              {label}
            </Typography>
          ))}
        </Stack>
        <Typography variant='caption' color={TEXT_SECONDARY}>
          © {new Date().getFullYear()} Winnbell
        </Typography>
      </Box>

    </Box>
  );
};

export default LandingPage;

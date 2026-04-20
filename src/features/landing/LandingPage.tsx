import {
  Box, Typography, Button, Stack, Container,
  Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import {
  ConfirmationNumber, Storefront, EmojiEvents,
  CheckCircle, ArrowForward, ExpandMore,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  PRIMARY_MAIN, TEXT_SECONDARY, TEXT_HEADING,
  GRADIENT_HERO, ALPHA_WHITE_15, ALPHA_WHITE_30,
} from '../../shared/colors';


const STEPS = [
  {
    num: '01',
    title: 'Visit a partner',
    body: 'Find a Winnbell partner near you — a cafe, shop, or restaurant — and make a purchase.',
  },
  {
    num: '02',
    title: 'Submit your receipt',
    body: 'Scan the QR code or enter your receipt details to earn a free ticket for the current prize draw.',
  },
  {
    num: '03',
    title: 'Win prizes',
    body: 'At the end of each draw period, one winner is selected at random from all eligible entries.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Is it free for consumers?',
    a: 'Yes, completely. Sign up, submit your receipts, and enter draws for free.',
  },
  {
    q: 'How are winners chosen?',
    a: 'Winners are selected randomly from all eligible tickets in the draw pool. Every ticket has an equal chance.',
  },
  {
    q: 'How do businesses benefit?',
    a: 'Partner businesses see increased repeat visits as customers return to earn more entries.',
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>

      {/* ── Navbar ── */}
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
        <Stack direction='row' spacing={1}>
          <Button
            variant='text'
            onClick={() => navigate('/login')}
            sx={{ color: TEXT_HEADING, fontWeight: 600 }}
          >
            Log in
          </Button>
          <Button
            variant='contained'
            onClick={() => navigate('/register')}
            sx={{ fontWeight: 700, borderRadius: 2, px: 2.5, boxShadow: 'none' }}
          >
            Get started
          </Button>
        </Stack>
      </Box>

      {/* ── Hero ── */}
      <Box
        sx={{
          background: GRADIENT_HERO,
          pt: { xs: 8, md: 12 },
          pb: { xs: 10, md: 16 },
          px: { xs: 2.5, md: 0 },
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative orbs */}
        <Box sx={{ position: 'absolute', top: '-20%', right: '-5%', width: 400, height: 400, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 300, height: 300, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)', filter: 'blur(50px)', pointerEvents: 'none' }} />

        <Container maxWidth='md' sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Box
            sx={{
              display: 'inline-block',
              borderRadius: 99, px: 1.5, py: 0.5,
              fontSize: '0.65rem', fontWeight: 700,
              letterSpacing: '0.15em', textTransform: 'uppercase',
              bgcolor: ALPHA_WHITE_15,
              color: 'white',
              mb: 3,
            }}
          >
            Win real prizes
          </Box>

          <Typography
            variant='h1'
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2.6rem', sm: '3.5rem', md: '4.5rem' },
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: 'white',
              mb: 3,
            }}
          >
            Every purchase.{' '}
            <Box component='span' sx={{ opacity: 0.8 }}>
              A chance to win.
            </Box>
          </Typography>

          <Typography
            sx={{
              color: 'rgba(255,255,255,0.75)',
              fontSize: { xs: '1rem', md: '1.15rem' },
              lineHeight: 1.7,
              mb: 5,
              maxWidth: 480,
              mx: 'auto',
              fontWeight: 400,
            }}
          >
            Shop at local businesses, submit your receipt, and collect free tickets
            for the monthly prize draw. No catch, no cost.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent='center' alignItems='center'>
            <Button
              variant='contained'
              size='large'
              onClick={() => navigate('/register')}
              sx={{
                bgcolor: 'white',
                color: PRIMARY_MAIN,
                fontWeight: 700,
                fontSize: '1rem',
                borderRadius: 2.5,
                px: 4,
                py: 1.6,
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.92)', boxShadow: '0 12px 32px rgba(0,0,0,0.25)' },
              }}
            >
              Start collecting tickets
            </Button>
            <Button
              variant='text'
              endIcon={<ArrowForward sx={{ fontSize: '1rem !important' }} />}
              onClick={() => navigate('/login')}
              sx={{
                color: 'white',
                fontWeight: 600,
                fontSize: '0.95rem',
                opacity: 0.85,
                '&:hover': { bgcolor: 'transparent', opacity: 1 },
              }}
            >
              Sign in
            </Button>
          </Stack>
        </Container>
      </Box>


      {/* ── How It Works ── */}
      <Box sx={{ py: { xs: 8, md: 12 }, px: { xs: 2.5, md: 0 }, bgcolor: 'background.default' }}>
        <Container maxWidth='lg'>
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Box sx={{ display: 'inline-block', borderRadius: 99, px: 1.5, py: 0.5, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', bgcolor: 'rgba(25,93,230,0.08)', color: PRIMARY_MAIN, mb: 2 }}>
              How it works
            </Box>
            <Typography variant='h2' sx={{ fontWeight: 900, color: TEXT_HEADING, fontSize: { xs: '2rem', md: '2.8rem' }, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Three steps to winning
            </Typography>
          </Box>

          {/* Desktop */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4, position: 'relative', alignItems: 'flex-start', justifyContent: 'center' }}>
            <Box sx={{ position: 'absolute', top: 32, left: '15%', right: '15%', height: 0, borderTop: '2px dashed rgba(25,93,230,0.2)', zIndex: 0 }} />
            {STEPS.map((step, i) => (
              <Box key={step.num} sx={{ flex: 1, maxWidth: 280, textAlign: 'center', position: 'relative', zIndex: 1, px: 2, mt: i === 1 ? 5 : 0 }}>
                <Box sx={{ width: 64, height: 64, borderRadius: 2, bgcolor: PRIMARY_MAIN, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.4rem', mx: 'auto', mb: 2.5, boxShadow: '0 8px 24px rgba(25,93,230,0.3)' }}>
                  {step.num}
                </Box>
                <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3 }}>
                  <Typography variant='h6' sx={{ fontWeight: 800, color: TEXT_HEADING, mb: 1, fontSize: '1.05rem' }}>{step.title}</Typography>
                  <Typography variant='body2' sx={{ color: TEXT_SECONDARY, lineHeight: 1.7 }}>{step.body}</Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Mobile */}
          <Stack spacing={3} sx={{ display: { xs: 'flex', md: 'none' } }}>
            {STEPS.map((step) => (
              <Stack key={step.num} direction='row' spacing={2.5} alignItems='flex-start'>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: PRIMARY_MAIN, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem', flexShrink: 0, boxShadow: '0 6px 18px rgba(25,93,230,0.3)' }}>
                    {step.num}
                  </Box>
                  <Box sx={{ width: 2, flex: 1, bgcolor: 'rgba(25,93,230,0.12)', mt: 1, minHeight: 20 }} />
                </Box>
                <Box sx={{ flex: 1, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 2.5, mb: 1 }}>
                  <Typography variant='h6' sx={{ fontWeight: 800, color: TEXT_HEADING, mb: 0.5, fontSize: '1rem' }}>{step.title}</Typography>
                  <Typography variant='body2' sx={{ color: TEXT_SECONDARY, lineHeight: 1.65 }}>{step.body}</Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* ── Testimonial ── */}
      <Box sx={{ py: { xs: 6, md: 10 }, px: { xs: 2.5, md: 0 }, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth='md'>
          <Box sx={{ maxWidth: 560, mx: 'auto' }}>
            <Box sx={{ display: 'inline-block', borderRadius: 99, px: 1.5, py: 0.5, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', bgcolor: 'rgba(25,93,230,0.08)', color: PRIMARY_MAIN, mb: 3 }}>
              What partners say
            </Box>
            <Box sx={{ borderLeft: '4px solid', borderColor: 'primary.main', pl: { xs: 2.5, md: 4 }, py: 1 }}>
              <Typography sx={{ fontStyle: 'italic', color: TEXT_HEADING, fontSize: { xs: '1.1rem', md: '1.3rem' }, lineHeight: 1.7, fontWeight: 400, mb: 2.5, letterSpacing: '-0.01em' }}>
                Since adding Winnbell, our repeat customer visits are up 28%.
                The setup took less than a day — and we haven't paid a cent.
              </Typography>
              <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.85rem', fontWeight: 600 }}>
                Sarah K.
                <Box component='span' sx={{ mx: 1, opacity: 0.3 }}>|</Box>
                Coffee Shop Owner, Dublin
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ── For Businesses ── */}
      <Box
        sx={{
          background: GRADIENT_HERO,
          py: { xs: 8, md: 12 },
          px: { xs: 2.5, md: 0 },
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', top: '-20%', right: '-5%', width: 350, height: 350, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <Container maxWidth='md' sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 5, md: 8 }} alignItems={{ md: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'inline-block', borderRadius: 99, px: 1.5, py: 0.5, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', bgcolor: ALPHA_WHITE_15, color: 'white', mb: 2 }}>
                For businesses
              </Box>
              <Typography variant='h2' sx={{ fontWeight: 900, fontSize: { xs: '2rem', md: '2.8rem' }, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#fff', mb: 2.5 }}>
                Turn customers into loyal regulars
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem', lineHeight: 1.7, mb: 4, maxWidth: 420 }}>
                Partner with Winnbell and give your customers a reason to keep coming back.
                Every visit becomes an exciting moment, and you get the footfall.
              </Typography>
              <Button
                variant='contained'
                size='large'
                endIcon={<ArrowForward />}
                onClick={() => navigate('/register/Business')}
                sx={{
                  bgcolor: 'white',
                  color: PRIMARY_MAIN,
                  fontWeight: 800,
                  fontSize: '1rem',
                  borderRadius: 2.5,
                  px: 4,
                  py: 1.6,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.92)', boxShadow: '0 12px 32px rgba(0,0,0,0.25)' },
                }}
              >
                Become a partner
              </Button>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Stack spacing={2}>
                {[
                  { icon: <Storefront sx={{ fontSize: 22, color: 'white' }} />, title: 'Zero cost to join', desc: 'Free for all partners. No subscription, no hidden fees.' },
                  { icon: <EmojiEvents sx={{ fontSize: 22, color: 'white' }} />, title: 'Drive repeat visits', desc: 'Customers come back to earn more entries and win prizes.' },
                  { icon: <CheckCircle sx={{ fontSize: 22, color: 'white' }} />, title: 'Simple dashboard', desc: 'Manage your location, track engagement, all in one place.' },
                ].map((item) => (
                  <Box
                    key={item.title}
                    sx={{
                      bgcolor: ALPHA_WHITE_15,
                      border: `1px solid ${ALPHA_WHITE_30}`,
                      borderRadius: 3,
                      p: 2.5,
                      display: 'flex',
                      gap: 2,
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', mb: 0.25 }}>{item.title}</Typography>
                      <Typography variant='body2' sx={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>{item.desc}</Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* ── FAQ ── */}
      <Box sx={{ py: { xs: 6, md: 10 }, px: { xs: 2.5, md: 0 }, bgcolor: 'background.default' }}>
        <Container maxWidth='sm'>
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Box sx={{ display: 'inline-block', borderRadius: 99, px: 1.5, py: 0.5, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', bgcolor: 'rgba(25,93,230,0.08)', color: PRIMARY_MAIN, mb: 2 }}>
              FAQ
            </Box>
            <Typography variant='h3' sx={{ fontWeight: 900, color: TEXT_HEADING, fontSize: { xs: '1.8rem', md: '2.2rem' }, letterSpacing: '-0.03em' }}>
              Common questions
            </Typography>
          </Box>
          <Stack spacing={1.5}>
            {FAQ_ITEMS.map((item, i) => (
              <Accordion
                key={i}
                elevation={0}
                disableGutters
                sx={{
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '12px !important',
                  '&:before': { display: 'none' },
                  overflow: 'hidden',
                }}
              >
                <AccordionSummary expandIcon={<ExpandMore />} sx={{ minHeight: 56, px: 2.5, '& .MuiAccordionSummary-content': { my: 1.5 } }}>
                  <Typography fontWeight={700} color={TEXT_HEADING} fontSize='0.95rem'>{item.q}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, pb: 2.5, px: 2.5 }}>
                  <Typography variant='body2' color={TEXT_SECONDARY} lineHeight={1.7}>{item.a}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* ── Final CTA ── */}
      <Box sx={{ py: { xs: 8, md: 10 }, px: { xs: 2.5, md: 0 }, bgcolor: 'background.paper', textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth='sm'>
          <ConfirmationNumber sx={{ fontSize: 48, color: PRIMARY_MAIN, opacity: 0.8, mb: 2 }} />
          <Typography variant='h3' sx={{ fontWeight: 900, color: TEXT_HEADING, fontSize: { xs: '1.8rem', md: '2.4rem' }, letterSpacing: '-0.03em', lineHeight: 1.1, mb: 2 }}>
            Ready to start winning?
          </Typography>
          <Typography sx={{ color: TEXT_SECONDARY, fontSize: '1.05rem', lineHeight: 1.65, mb: 4, maxWidth: 380, mx: 'auto' }}>
            Join thousands of people who turn everyday shopping into prizes.
          </Typography>
          <Button
            variant='contained'
            size='large'
            endIcon={<ArrowForward />}
            onClick={() => navigate('/register')}
            sx={{ fontWeight: 700, fontSize: '1.05rem', borderRadius: 2.5, px: 5, py: 1.6, boxShadow: '0 8px 24px rgba(25,93,230,0.3)', '&:hover': { boxShadow: '0 12px 32px rgba(25,93,230,0.4)' } }}
          >
            Create free account
          </Button>
        </Container>
      </Box>

      {/* ── Footer ── */}
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
            <Typography key={label} component='a' onClick={() => navigate(path)} variant='caption' sx={{ color: TEXT_SECONDARY, cursor: 'pointer', textDecoration: 'none', fontWeight: 500, '&:hover': { color: PRIMARY_MAIN } }}>
              {label}
            </Typography>
          ))}
        </Stack>
        <Typography variant='caption' color={TEXT_SECONDARY}>
          &copy; {new Date().getFullYear()} Winnbell
        </Typography>
      </Box>

    </Box>
  );
};

export default LandingPage;

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
    body: 'Scan the QR code or enter your receipt details to earn a free entry for the current campaign.',
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
    a: 'Winners are selected randomly from all eligible entries in the campaign pool. Every entry has an equal chance.',
  },
  {
    q: 'How do businesses benefit?',
    a: 'Partner businesses pay a subscription to be featured in the Winnbell campaign. In return, customers visit your location to earn entries — driving repeat foot traffic and sales throughout the campaign period.',
  },
  {
    q: 'How does the business subscription work?',
    a: 'Businesses subscribe monthly to participate in Winnbell campaigns. There are no long-term commitments — you can cancel at any time. Pricing depends on the number of locations.',
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
        <Stack direction='row' spacing={1} alignItems='center'>
          <Button
            variant='text'
            onClick={() => document.getElementById('for-businesses')?.scrollIntoView({ behavior: 'smooth' })}
            sx={{ color: TEXT_HEADING, fontWeight: 600, fontSize: '0.9rem', display: { xs: 'none', sm: 'inline-flex' } }}
          >
            For Businesses
          </Button>
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
            Shop at local businesses, submit your receipt, and collect free entries
            for the monthly campaign. No catch, no cost.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent='center' alignItems='center' sx={{ mb: 4 }}>
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
              Start collecting entries
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

          <Button
            variant='text'
            endIcon={<ArrowForward sx={{ fontSize: '0.9rem !important' }} />}
            onClick={() => document.getElementById('for-businesses')?.scrollIntoView({ behavior: 'smooth' })}
            sx={{
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 500,
              fontSize: '0.85rem',
              opacity: 0.9,
              '&:hover': { bgcolor: 'transparent', opacity: 1, color: 'white' },
              textTransform: 'none',
            }}
          >
            Are you a business owner?
          </Button>
        </Container>
      </Box>

      {/* ── Two-Audience Split ── */}
      <Box sx={{ py: { xs: 8, md: 10 }, px: { xs: 2.5, md: 0 }, bgcolor: 'background.default' }}>
        <Container maxWidth='lg'>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 3, md: 4 } }}>
            {/* For Shoppers Card */}
            <Box
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                p: { xs: 3, md: 4 },
                textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': { boxShadow: '0 12px 32px rgba(25,93,230,0.1)' },
              }}
            >
              <ConfirmationNumber sx={{ fontSize: 40, color: PRIMARY_MAIN, mb: 2.5 }} />
              <Typography variant='h5' sx={{ fontWeight: 800, color: TEXT_HEADING, mb: 1.5, fontSize: '1.3rem' }}>
                I shop at local businesses
              </Typography>
              <Stack spacing={1.5} sx={{ mb: 3.5, textAlign: 'left' }}>
                <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: PRIMARY_MAIN, flexShrink: 0 }} />
                  Earn free entries with every purchase
                </Typography>
                <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: PRIMARY_MAIN, flexShrink: 0 }} />
                  Win real prizes monthly
                </Typography>
                <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: PRIMARY_MAIN, flexShrink: 0 }} />
                  Completely free to join
                </Typography>
              </Stack>
              <Button
                variant='contained'
                fullWidth
                onClick={() => navigate('/register')}
                sx={{ fontWeight: 700, borderRadius: 2, py: 1.4 }}
              >
                Start now
              </Button>
            </Box>

            {/* For Businesses Card */}
            <Box
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 3,
                border: '2px solid',
                borderColor: '#6366F1',
                p: { xs: 3, md: 4 },
                textAlign: 'center',
                transition: 'all 0.3s ease',
                position: 'relative',
                '&:hover': { boxShadow: '0 12px 32px rgba(99,102,241,0.2)' },
                background: 'linear-gradient(135deg, rgba(99,102,241,0.03) 0%, rgba(99,102,241,0.01) 100%)',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -12,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bgcolor: '#6366F1',
                  color: 'white',
                  px: 2,
                  py: 0.5,
                  borderRadius: 99,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                For you
              </Box>
              <Storefront sx={{ fontSize: 40, color: '#6366F1', mb: 2.5 }} />
              <Typography variant='h5' sx={{ fontWeight: 800, color: TEXT_HEADING, mb: 1.5, fontSize: '1.3rem' }}>
                I own a business
              </Typography>
              <Stack spacing={1.5} sx={{ mb: 3.5, textAlign: 'left' }}>
                <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#6366F1', flexShrink: 0 }} />
                  Attract and keep customers
                </Typography>
                <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#6366F1', flexShrink: 0 }} />
                  Simple subscription, no long-term contract
                </Typography>
                <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#6366F1', flexShrink: 0 }} />
                  Easy dashboard, minimal effort
                </Typography>
              </Stack>
              <Button
                variant='contained'
                fullWidth
                onClick={() => navigate('/register/Business')}
                sx={{ fontWeight: 700, borderRadius: 2, py: 1.4, bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5' } }}
              >
                Partner with us
              </Button>
            </Box>
          </Box>
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
                Winnbell gives us a reason to bring customers back every month. The dashboard is easy to use and the results speak for themselves.
              </Typography>
              <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.85rem', fontWeight: 600 }}>
                Alex M.
                <Box component='span' sx={{ mx: 1, opacity: 0.3 }}>|</Box>
                Restaurant Owner, Dublin
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ── For Businesses ── */}
      <Box
        id='for-businesses'
        sx={{
          bgcolor: '#F8F9FF',
          py: { xs: 10, md: 14 },
          px: { xs: 2.5, md: 0 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth='lg'>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 10 } }}>
            <Typography variant='h2' sx={{ fontWeight: 900, color: TEXT_HEADING, fontSize: { xs: '2.2rem', md: '3rem' }, letterSpacing: '-0.03em', lineHeight: 1.1, mb: 2.5 }}>
              Grow your business with Winnbell
            </Typography>
            <Typography sx={{ color: TEXT_SECONDARY, fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, maxWidth: 520, mx: 'auto' }}>
              A subscription-based campaign that brings customers through your door — month after month.
            </Typography>
          </Box>

          {/* Three Value Props */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: { xs: 3, md: 4 }, mb: { xs: 8, md: 10 } }}>
            {[
              { icon: <CheckCircle sx={{ fontSize: 32, color: PRIMARY_MAIN }} />, title: 'Campaign marketing that works', desc: 'Your business joins the monthly Winnbell campaign. Customers visit you to earn entries — giving them a real reason to return.' },
              { icon: <EmojiEvents sx={{ fontSize: 32, color: PRIMARY_MAIN }} />, title: 'Drive repeat customers', desc: 'Instead of one-time visits, customers come back throughout the campaign. More visits means more sales and stronger loyalty.' },
              { icon: <Storefront sx={{ fontSize: 32, color: PRIMARY_MAIN }} />, title: 'Simple dashboard', desc: 'Set up your business profile in minutes. Manage locations, track campaign entries, and see results — all in one place.' },
            ].map((item, i) => (
              <Box
                key={i}
                sx={{
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  p: { xs: 2.5, md: 3 },
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': { boxShadow: '0 8px 24px rgba(25,93,230,0.1)' },
                }}
              >
                <Box sx={{ mb: 2 }}>{item.icon}</Box>
                <Typography sx={{ fontWeight: 800, color: TEXT_HEADING, mb: 1, fontSize: '1.1rem' }}>
                  {item.title}
                </Typography>
                <Typography variant='body2' sx={{ color: TEXT_SECONDARY, lineHeight: 1.65 }}>
                  {item.desc}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Stats Row */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' },
              gap: { xs: 3, md: 4 },
              mb: { xs: 8, md: 10 },
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              p: { xs: 3, md: 4 },
            }}
          >
            {[
              { stat: 'Monthly', label: 'Campaign cycle' },
              { stat: '< 1 day', label: 'To get started' },
              { stat: '100%', label: 'Local focus' },
            ].map((item, i) => (
              <Box key={i} sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.8rem', md: '2.2rem' }, color: PRIMARY_MAIN, mb: 0.5, letterSpacing: '-0.03em' }}>
                  {item.stat}
                </Typography>
                <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.9rem', fontWeight: 500 }}>
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Primary CTA */}
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant='contained'
              size='large'
              onClick={() => navigate('/register/Business')}
              sx={{
                fontWeight: 800,
                fontSize: '1.05rem',
                borderRadius: 2.5,
                px: 5,
                py: 1.8,
                boxShadow: '0 8px 24px rgba(25,93,230,0.3)',
                mb: 2,
                minWidth: 200,
                '&:hover': { boxShadow: '0 12px 32px rgba(25,93,230,0.4)' },
              }}
            >
              Become a partner
            </Button>
            <Typography sx={{ display: 'block', color: TEXT_SECONDARY, fontSize: '0.9rem', fontWeight: 500 }}>
              Simple monthly subscription. Cancel anytime.
            </Typography>
          </Box>
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
          <Typography sx={{ color: TEXT_SECONDARY, fontSize: '1.05rem', lineHeight: 1.65, mb: 5, maxWidth: 380, mx: 'auto' }}>
            Join thousands of people who turn everyday shopping into prizes.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent='center' alignItems='center'>
            <Button
              variant='contained'
              size='large'
              endIcon={<ArrowForward />}
              onClick={() => navigate('/register')}
              sx={{ fontWeight: 700, fontSize: '1.05rem', borderRadius: 2.5, px: 5, py: 1.6, boxShadow: '0 8px 24px rgba(25,93,230,0.3)', '&:hover': { boxShadow: '0 12px 32px rgba(25,93,230,0.4)' } }}
            >
              Create free account
            </Button>
            <Button
              variant='outlined'
              size='large'
              endIcon={<ArrowForward />}
              onClick={() => document.getElementById('for-businesses')?.scrollIntoView({ behavior: 'smooth' })}
              sx={{ fontWeight: 700, fontSize: '1.05rem', borderRadius: 2.5, px: 5, py: 1.6, borderColor: PRIMARY_MAIN, color: PRIMARY_MAIN, '&:hover': { borderColor: PRIMARY_MAIN, bgcolor: 'rgba(25,93,230,0.05)' } }}
            >
              Partner with us
            </Button>
          </Stack>
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

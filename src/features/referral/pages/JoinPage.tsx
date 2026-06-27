import { useEffect } from 'react';
import { Box, Typography, Button, Stack, Container } from '@mui/material';
import { ArrowForward, PersonAddOutlined, ReceiptLongOutlined, EmojiEventsOutlined } from '@mui/icons-material';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppSelector } from '../../../store/hook';
import { selectIsAuthenticated } from '../../../store/selectors/authSelectors';
import { useReferralCode } from '../hooks/useReferralCode';
import { GRADIENT_HERO, PRIMARY_MAIN, ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_30 } from '../../../shared/colors';

const JoinPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Capture the referral code to localStorage so it survives the Supabase signup redirect
  useEffect(() => {
    if (ref) {
      localStorage.setItem('pendingReferralCode', ref);
    }
  }, [ref]);

  // Resolve the referral code to get the referrer's name for social proof
  const { data: referralData } = useReferralCode(ref);
  const referrerName = referralData?.referrerName;

  // Already signed in? Go to the main app
  if (isAuthenticated) {
    return <Navigate to="/scan" replace />;
  }

  // No referral code? Go to the main landing page
  if (!ref) {
    return <Navigate to="/" replace />;
  }

  // Build the personalized headline
  const headline = referrerName
    ? `${referrerName} invited you to Winnbell`
    : 'You are invited to Winnbell';

  const steps = [
    {
      icon: <PersonAddOutlined />,
      title: 'Join for free',
      text: 'Create an account in seconds, no payment required.',
    },
    {
      icon: <ReceiptLongOutlined />,
      title: 'Earn your free entry',
      text: 'Get a free bonus entry just for joining.',
    },
    {
      icon: <EmojiEventsOutlined />,
      title: 'Enter the monthly draw',
      text: "Compete for cash prizes every month. Play risk-free.",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        background: GRADIENT_HERO,
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflowY: 'auto',
      }}
    >
      {/* Decorative orbs */}
      <Box
        sx={{
          position: 'absolute',
          top: '-18%',
          right: '-8%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.05)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-12%',
          left: '-8%',
          width: 320,
          height: 320,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.04)',
          filter: 'blur(55px)',
          pointerEvents: 'none',
        }}
      />

      {/* Brand */}
      <Box sx={{ px: { xs: 2.5, md: 6 }, py: { xs: 2.5, md: 3 }, position: 'relative', zIndex: 1 }}>
        <Box component="img" src="/winnbell_app_name_white.svg" alt="Winnbell" sx={{ height: { xs: 34, md: 38 }, width: 'auto' }} />
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: { xs: 'flex-start', md: 'center' },
          px: 2.5,
          py: { xs: 1, md: 3 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Container maxWidth="xs" disableGutters sx={{ textAlign: 'center' }}>
          {/* Referrer tag */}
          {referrerName && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Box
                sx={{
                  display: 'inline-block',
                  borderRadius: 99,
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  bgcolor: ALPHA_WHITE_15,
                  color: 'white',
                  mb: 2,
                }}
              >
                Invited by {referrerName}
              </Box>
            </motion.div>
          )}

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Typography
              variant="h1"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '2.2rem', md: '2.7rem' },
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                color: 'white',
                mb: 1.5,
              }}
            >
              {headline}
            </Typography>
          </motion.div>

          {/* Subheading */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
          >
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                lineHeight: 1.6,
                mb: 3,
                fontWeight: 400,
              }}
            >
              You are one step from entering this month's draw. Here is how it works.
            </Typography>
          </motion.div>

          {/* How it works card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.26 }}
          >
            <Box
              sx={{
                bgcolor: ALPHA_WHITE_15,
                border: `1px solid ${ALPHA_WHITE_20}`,
                borderRadius: 4,
                p: { xs: 2.5, md: 3 },
                mb: 3.5,
                backdropFilter: 'blur(10px)',
                textAlign: 'left',
              }}
            >
              <Stack spacing={2.25}>
                {steps.map((step, i) => (
                  <Stack key={i} direction="row" spacing={2} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        flexShrink: 0,
                        borderRadius: 2.5,
                        bgcolor: ALPHA_WHITE_20,
                        border: `1px solid ${ALPHA_WHITE_30}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '& svg': { fontSize: 22, color: 'white' },
                      }}
                    >
                      {step.icon}
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.3 }}>
                        {step.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.83rem', lineHeight: 1.5, color: 'rgba(255,255,255,0.78)' }}>
                        {step.text}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.34 }}
          >
            <Stack spacing={1.25}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/register')}
                sx={{
                  bgcolor: 'white',
                  color: PRIMARY_MAIN,
                  fontWeight: 800,
                  fontSize: '1rem',
                  py: 1.5,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.92)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
                  },
                }}
              >
                Create your free account
              </Button>
            </Stack>
          </motion.div>

          {/* Bottom link */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.5 }}>
            <Button
              variant="text"
              onClick={() => navigate('/')}
              sx={{
                mt: 1.5,
                textTransform: 'none',
                color: 'rgba(255,255,255,0.8)',
                fontWeight: 600,
                fontSize: '0.85rem',
                '&:hover': { bgcolor: 'transparent', color: 'white' },
              }}
            >
              What is Winnbell.
            </Button>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default JoinPage;

import { useState, useEffect } from 'react';
import {
  Box, Button, Typography, Container, Stack, Alert, CircularProgress, Paper,
  IconButton, useMediaQuery, useTheme, TextField,
} from '@mui/material';
import { MarkEmailRead, ArrowBackIosNew, ArrowForward, ConfirmationNumber, Storefront, EmojiEvents, CardGiftcard } from '@mui/icons-material';
import { supabase } from '../../../shared/lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
  BG_PAGE, BORDER_LIGHT, SHADOW_PRIMARY_SOFT,
  GRADIENT_HERO, ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_30,
} from '../../../shared/colors';

// ─── Brand Panel ─────────────────────────────────────────────────────────────

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

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));


  // Read email that RegisterPage stored before navigating here
  const pendingEmail = localStorage.getItem('pendingEmail') || '';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Guard: no pendingEmail means user navigated here directly or session expired
  useEffect(() => {
    if (!pendingEmail) {
      navigate('/register', { replace: true, state: { message: 'Your session expired. Please start again.' } });
    }
  }, []);

  // Resend cooldown countdown
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerify = async () => {
    if (code.length < 6 || !pendingEmail) return;
    setLoading(true);
    setError('');

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: pendingEmail,
        token: code,
        type: 'signup',
      });

      if (verifyError) {
        const msg = verifyError.message || '';
        if (msg.toLowerCase().includes('already confirmed') || msg.toLowerCase().includes('already registered')) {
          setError('This email is already verified. Please sign in instead.');
        } else {
          setError(msg || 'Invalid or expired code. Check your email and try again.');
        }
        return;
      }

      // Clear pending items — useSupabaseSync will pick up the session
      // and set pendingRole / pendingInviteToken from localStorage before clearing them
      localStorage.removeItem('pendingEmail');
    } catch {
      setError('Verification failed. Check your code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !pendingEmail) return;
    setError('');
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: pendingEmail,
      });
      if (resendError) {
        setError(resendError.message || 'Failed to resend code.');
        return;
      }
      setCode('');
      setResendCooldown(30);
    } catch {
      setError('Failed to resend code.');
    }
  };

  // ─── Form content (shared between mobile & desktop) ──────────────────────

  const FormContent = () => (
    <Stack sx={{ zoom: { xs: 0.85, md: 0.85 } }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 6, md: 5 }, textAlign: isDesktop ? 'left' : 'center' }}>
        {!isDesktop && (
          <Paper elevation={4} sx={{ width: 80, height: 80, bgcolor: 'primary.main', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, mx: 'auto' }}>
            <MarkEmailRead sx={{ color: 'white', fontSize: 40 }} />
          </Paper>
        )}
        <Typography variant='h4' sx={{ fontWeight: 700, mb: 1 }}>Verify your email</Typography>
        <Typography variant='body1' color='text.secondary'>
          Enter the 6-digit code we sent to{pendingEmail ? ` ${pendingEmail}` : ' your email address'}.
        </Typography>
      </Box>

      {error && <Alert severity='error' sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <Stack spacing={3}>
        <TextField
          label='Verification code'
          placeholder='Enter 6-digit code'
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
          inputMode='numeric'
          autoFocus
          fullWidth
          inputProps={{ maxLength: 6, style: { letterSpacing: '0.3em', fontSize: '1.25rem' } }}
        />

        {/* Submit Button */}
        <Button
          variant='contained'
          size='large'
          onClick={handleVerify}
          disabled={loading || code.length < 6}
          endIcon={!loading && <ArrowForward />}
          sx={{
            py: 2,
            fontWeight: 700,
            boxShadow: SHADOW_PRIMARY_SOFT,
          }}
        >
          {loading ? <CircularProgress size={24} color='inherit' /> : 'Confirm & Continue'}
        </Button>

        {/* Resend Link */}
        <Box sx={{ textAlign: 'center', pt: 1 }}>
          <Typography variant='body2' color='text.secondary'>
            Didn't receive a code?{' '}
            <Typography
              component='span'
              variant='body2'
              sx={{
                color: resendCooldown > 0 ? 'text.secondary' : 'primary.main',
                fontWeight: 700,
                cursor: resendCooldown > 0 ? 'default' : 'pointer',
              }}
              onClick={handleResend}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend'}
            </Typography>
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );

  // ─── Desktop layout ──────────────────────────────────────────────────────────

  if (isDesktop) {
    return (
      <Box sx={{ display: 'flex', height: '100dvh', overflow: 'hidden' }}>
        <BrandPanel />

        {/* Right: form panel */}
        <Box
          sx={{
            width: '50%',
            overflowY: 'auto',
            bgcolor: BG_PAGE,
            display: 'flex',
            flexDirection: 'column',
            px: 7,
            py: 5,
          }}
        >
          <Box sx={{ mb: 4 }}>
            <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'white', border: `1px solid ${BORDER_LIGHT}` }}>
              <ArrowBackIosNew fontSize='small' />
            </IconButton>
          </Box>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 400 }}>
            {FormContent()}
          </Box>
        </Box>
      </Box>
    );
  }

  // ─── Mobile layout ────────────────────────────────────────────────────────

  return (
    <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: BG_PAGE, overflowY: 'auto' }}>
      <Box sx={{ p: 2 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'action.hover' }}>
          <ArrowBackIosNew fontSize='small' />
        </IconButton>
      </Box>
      <Container maxWidth='xs' sx={{ flex: 1, display: 'flex', flexDirection: 'column', pt: 4, pb: 4 }}>
        {FormContent()}
      </Container>
    </Box>
  );
};

export default VerifyEmailPage;

import { useState, useEffect } from 'react';
import {
  Box, Button, Typography, Container, Stack, Alert, CircularProgress, Paper,
  IconButton, useMediaQuery, useTheme, TextField,
} from '@mui/material';
import { MarkEmailRead, ArrowBackIosNew, ArrowForward } from '@mui/icons-material';
import AuthBrandPanel from '../components/AuthBrandPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../shared/lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
  BG_PAGE, BORDER_LIGHT, SHADOW_PRIMARY_SOFT,
} from '../../../shared/colors';
import {
  staggerContainer, popIn, riseIn,
} from '../../../shared/motion';

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
  }, [pendingEmail, navigate]);

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
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <Stack sx={{ zoom: { xs: 0.85, md: 0.85 } }}>
        {/* Header */}
        <motion.div variants={riseIn}>
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
        </motion.div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div variants={popIn} key="error" exit={{ opacity: 0, y: -10, transition: { duration: 0.18 } }}>
              <Alert severity='error' sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <Stack spacing={3}>
          <motion.div variants={popIn}>
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
          </motion.div>

          {/* Submit Button */}
          <motion.div variants={popIn}>
            <Button
              fullWidth
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
          </motion.div>

          {/* Resend Link */}
          <motion.div variants={popIn}>
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
          </motion.div>
        </Stack>
      </Stack>
    </motion.div>
  );

  // ─── Desktop layout ──────────────────────────────────────────────────────────

  if (isDesktop) {
    return (
      <Box sx={{ display: 'flex', height: 'var(--dvh100, 100dvh)', overflow: 'hidden' }}>
        <AuthBrandPanel />

        {/* Right: form panel */}
        <Box
          sx={{
            flex: 1,
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
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 400, width: '100%', mx: 'auto' }}>
            {FormContent()}
          </Box>
        </Box>
      </Box>
    );
  }

  // ─── Mobile layout ────────────────────────────────────────────────────────

  return (
    <Box sx={{ height: 'var(--dvh100, 100dvh)', display: 'flex', flexDirection: 'column', bgcolor: BG_PAGE, overflowY: 'auto' }}>
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

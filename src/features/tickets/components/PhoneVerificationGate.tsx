import { useState, useEffect } from 'react';
import {
  Box, Button, Typography, Paper, Stack, Alert, TextField, CircularProgress,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneAndroid, ArrowForward, Check } from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../../shared/api/client';
import {
  PRIMARY_MAIN, GRADIENT_HERO, ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_30,
  BORDER_LIGHT, BG_DEFAULT, TEXT_PRIMARY, TEXT_SECONDARY, SHADOW_ELEVATED,
} from '../../../shared/colors';
import { ConfirmationNumber } from '@mui/icons-material';

interface Props {
  onVerified: () => void;
  pendingCode?: string | null;
}

type Step = 'phone' | 'otp';

const PhoneVerificationGate = ({ onVerified, pendingCode }: Props) => {
  const isPromo = !!pendingCode?.startsWith('PROMO');
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const sendOtpMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const res = await api.post('/phone/send-otp', { phoneNumber });
      return res.data;
    },
    onSuccess: () => {
      setError('');
      setStep('otp');
      setCode('');
      setResendCooldown(60);
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      const message = err?.response?.data?.message;
      if (status === 400) {
        setError('Invalid phone number format.');
      } else if (status === 429) {
        setError('Too many requests. Please wait before trying again.');
      } else {
        setError(message || 'Failed to send code. Please try again.');
      }
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (verifyCode: string) => {
      const res = await api.post('/phone/verify-otp', { code: verifyCode });
      return res.data;
    },
    onSuccess: () => {
      setError('');
      onVerified();
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message;
      setError(message || 'Invalid or expired code. Please try again.');
    },
  });

  const handleSendCode = () => {
    if (!phone.trim()) { setError('Please enter your phone number.'); return; }
    setError('');
    sendOtpMutation.mutate(phone);
  };

  const handleVerifyCode = () => {
    if (code.length < 6) { setError('Please enter a 6-digit code.'); return; }
    setError('');
    verifyOtpMutation.mutate(code);
  };

  const handleResend = () => {
    if (resendCooldown > 0 || !phone) return;
    setError('');
    sendOtpMutation.mutate(phone);
  };

  const isLoadingStep1 = sendOtpMutation.isPending;
  const isLoadingStep2 = verifyOtpMutation.isPending;

  const formContent = (
    <AnimatePresence mode='wait'>
      {step === 'phone' ? (
        <motion.div
          key='phone-form'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Stack spacing={3}>
            <Box>
              <Typography variant='h6' sx={{ fontWeight: 700, mb: 1, color: TEXT_PRIMARY }}>
                Enter your phone number
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                We'll send a 6-digit code to verify it's you.
              </Typography>
            </Box>

            {error && (
              <Alert severity='error' sx={{ borderRadius: 2 }}>{error}</Alert>
            )}

            <TextField
              label='Phone number'
              placeholder='+1 (555) 000-0000'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
              inputMode='tel'
              autoFocus
              fullWidth
              helperText='US number or international with country code (e.g. +972...)'
            />

            <Button
              variant='contained'
              size='large'
              onClick={handleSendCode}
              disabled={isLoadingStep1 || !phone.trim()}
              endIcon={!isLoadingStep1 && <ArrowForward />}
              sx={{
                py: 1.5,
                fontWeight: 700,
                backgroundColor: PRIMARY_MAIN,
                '&:hover': { backgroundColor: PRIMARY_MAIN, opacity: 0.9 },
              }}
            >
              {isLoadingStep1 ? <CircularProgress size={24} color='inherit' /> : 'Send Code'}
            </Button>

            <Typography variant='caption' sx={{ color: TEXT_SECONDARY, textAlign: 'center', lineHeight: 1.5 }}>
              By tapping Send Code, you agree to receive one SMS verification message. Msg & data rates may apply. Reply STOP to opt out.
            </Typography>
          </Stack>
        </motion.div>
      ) : (
        <motion.div
          key='otp-form'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Stack spacing={3}>
            <Box>
              <Typography variant='h6' sx={{ fontWeight: 700, mb: 1, color: TEXT_PRIMARY }}>
                Enter verification code
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Code sent to {phone}
              </Typography>
            </Box>

            {error && (
              <Alert severity='error' sx={{ borderRadius: 2 }}>{error}</Alert>
            )}

            <TextField
              label='6-digit code'
              placeholder='000000'
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode()}
              inputMode='numeric'
              autoFocus
              fullWidth
              slotProps={{
                htmlInput: {
                  maxLength: 6,
                  style: { letterSpacing: '0.3em', fontSize: '1.25rem' },
                },
              }}
            />

            <Button
              variant='contained'
              size='large'
              onClick={handleVerifyCode}
              disabled={isLoadingStep2 || code.length < 6}
              endIcon={!isLoadingStep2 && <ArrowForward />}
              sx={{
                py: 1.5,
                fontWeight: 700,
                backgroundColor: PRIMARY_MAIN,
                '&:hover': { backgroundColor: PRIMARY_MAIN, opacity: 0.9 },
              }}
            >
              {isLoadingStep2 ? <CircularProgress size={24} color='inherit' /> : 'Verify'}
            </Button>

            <Box sx={{ textAlign: 'center', pt: 1 }}>
              <Typography variant='body2' color='text.secondary'>
                Didn't receive a code?{' '}
                <Typography
                  component='span'
                  variant='body2'
                  onClick={handleResend}
                  sx={{
                    color: resendCooldown > 0 ? TEXT_SECONDARY : PRIMARY_MAIN,
                    fontWeight: 700,
                    cursor: resendCooldown > 0 ? 'default' : 'pointer',
                    '&:hover': { opacity: resendCooldown > 0 ? 1 : 0.8 },
                  }}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend'}
                </Typography>
              </Typography>
            </Box>
          </Stack>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* ── Mobile layout (hidden on md+) ─────────────────────────────── */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column' }}>
        {/* Hero Section */}
        <Box
          sx={{
            background: GRADIENT_HERO,
            color: 'white',
            pt: 4,
            pb: 9,
            px: 3,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: { xs: 0, sm: '0 0 32px 32px' },
          }}
        >
          {/* Decorative orbs */}
          <Box sx={{
            position: 'absolute', top: -80, right: -80,
            width: 280, height: 280, borderRadius: '50%',
            bgcolor: ALPHA_WHITE_15, filter: 'blur(60px)',
          }} />
          <Box sx={{
            position: 'absolute', bottom: -60, left: -60,
            width: 220, height: 220, borderRadius: '50%',
            bgcolor: ALPHA_WHITE_15, filter: 'blur(50px)',
          }} />

          {/* Icon */}
          <Box sx={{
            width: 80, height: 80, borderRadius: 3,
            bgcolor: ALPHA_WHITE_15, border: `1px solid ${ALPHA_WHITE_30}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 3, position: 'relative', zIndex: 1,
          }}>
            <PhoneAndroid sx={{ fontSize: 40, color: 'white' }} />
          </Box>

          {/* Title and subtitle */}
          <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <Typography variant='h4' sx={{ fontWeight: 700, mb: 1 }}>
              {isPromo ? 'One Step to Claim Your Entry' : 'Verify Your Phone'}
            </Typography>
            <Typography variant='body1' sx={{ opacity: 0.9, lineHeight: 1.6, maxWidth: 320, mx: 'auto' }}>
              {isPromo
                ? 'Verify your phone once and your promo entry activates automatically. You only need to do this once.'
                : 'To collect entries and join draws, we confirm you are a real person. You can still browse the map and explore businesses without verifying.'}
            </Typography>
            {isPromo && pendingCode && (
              <Box sx={{
                display: 'inline-flex', alignItems: 'center', gap: 1,
                mt: 2.5, px: 2, py: 0.75, borderRadius: 2,
                bgcolor: ALPHA_WHITE_15, border: `1px solid ${ALPHA_WHITE_30}`,
              }}>
                <ConfirmationNumber sx={{ fontSize: 16, color: 'white' }} />
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 900, letterSpacing: 2, fontSize: '0.95rem' }}>
                  {pendingCode}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Form Card - overlaps hero */}
        <Box sx={{
          px: 2, mt: -6, mb: 4, flex: 1,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          position: 'relative', zIndex: 2,
        }}>
          <Paper elevation={0} sx={{
            width: '100%', maxWidth: 400, p: 4, borderRadius: 3,
            border: `1px solid ${BORDER_LIGHT}`,
          }}>
            {formContent}
          </Paper>
        </Box>
      </Box>

      {/* ── Desktop layout (hidden on xs/sm) ──────────────────────────── */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        px: 4,
        py: 6,
        bgcolor: BG_DEFAULT,
      }}>
        <Box sx={{
          width: '100%',
          maxWidth: 880,
          display: 'flex',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: SHADOW_ELEVATED,
        }}>
          {/* Left: gradient hero panel */}
          <Box sx={{
            background: GRADIENT_HERO,
            color: 'white',
            width: '48%',
            flexShrink: 0,
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Decorative orbs */}
            <Box sx={{
              position: 'absolute', top: -80, right: -80,
              width: 280, height: 280, borderRadius: '50%',
              bgcolor: ALPHA_WHITE_15, filter: 'blur(60px)',
            }} />
            <Box sx={{
              position: 'absolute', bottom: -60, left: -60,
              width: 220, height: 220, borderRadius: '50%',
              bgcolor: ALPHA_WHITE_15, filter: 'blur(50px)',
            }} />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              {/* Icon */}
              <Box sx={{
                width: 72, height: 72, borderRadius: 3,
                bgcolor: ALPHA_WHITE_15, border: `1px solid ${ALPHA_WHITE_30}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mb: 3,
              }}>
                <PhoneAndroid sx={{ fontSize: 36, color: 'white' }} />
              </Box>

              <Typography variant='h4' sx={{ fontWeight: 700, mb: 2 }}>
                {isPromo ? 'One Step to Claim Your Entry' : 'Verify Your Phone'}
              </Typography>

              {isPromo && pendingCode && (
                <Box sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 1,
                  mb: 3, px: 2, py: 0.75, borderRadius: 2,
                  bgcolor: ALPHA_WHITE_15, border: `1px solid ${ALPHA_WHITE_30}`,
                }}>
                  <ConfirmationNumber sx={{ fontSize: 16, color: 'white' }} />
                  <Typography sx={{ fontFamily: 'monospace', fontWeight: 900, letterSpacing: 2, fontSize: '0.95rem' }}>
                    {pendingCode}
                  </Typography>
                </Box>
              )}

              <Typography variant='body1' sx={{ opacity: 0.9, lineHeight: 1.8, mb: 4 }}>
                {isPromo
                  ? 'Verify your phone once and your promo entry activates automatically. This is a one-time step to confirm you are a real person.'
                  : 'To collect entries at participating businesses and join draws, we verify you are a real person. You can still browse the map and explore all businesses freely without verifying.'}
              </Typography>

              <Stack spacing={2}>
                {(isPromo ? [
                  'Your promo entry activates automatically after verification',
                  'One-time only, no recurring messages',
                  'One account per real person',
                ] : [
                  'Collect entries at participating businesses',
                  'Browse the map freely, no verification needed',
                  'One account per real person',
                ]).map((text) => (
                  <Box key={text} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                      width: 22, height: 22, borderRadius: '50%',
                      bgcolor: ALPHA_WHITE_20,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Check sx={{ fontSize: 13, color: 'white' }} />
                    </Box>
                    <Typography variant='body2' sx={{ opacity: 0.95 }}>
                      {text}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>

          {/* Right: form */}
          <Box sx={{
            flex: 1,
            p: 6,
            bgcolor: BG_DEFAULT,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            {formContent}
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

export default PhoneVerificationGate;

import { useState, useEffect } from 'react';
import { isAxiosError } from 'axios';
import {
  Box, Button, Typography, Stack, Alert, TextField, CircularProgress,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowForward } from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../../shared/api/client';
import {
  PRIMARY_MAIN, TEXT_PRIMARY, TEXT_SECONDARY,
} from '../../../shared/colors';
import { apiErrorMessage } from '../../../shared/utils/apiError';
// A sent code stays valid for 10 minutes. If the sheet is closed (accidentally or not) while
// one is live, reopening RESUMES at the code step with the same number and remaining cooldown
// instead of asking for the phone again - which would fire another SMS. The server enforces
// the same 60s spacing, so this is UX; the SMS budget is protected either way.
import { readOtpSession, writeOtpSession, clearOtpSession, RESEND_COOLDOWN_S } from '../lib/phoneOtpSession';

interface Props {
  onVerified: (referralBonusGranted: boolean) => void;
}

type Step = 'phone' | 'otp';

// Format 10 raw digits as "(555) 123-4567"
const formatPhoneDisplay = (digits: string): string => {
  if (digits.length === 0) return '';
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

// Validate US phone: 10 digits, area code (digit 1) 2-9, exchange (digit 4) 2-9
const isValidUSPhone = (digits: string): boolean => {
  if (digits.length !== 10) return false;
  const areaCode = parseInt(digits[0], 10);
  const exchange = parseInt(digits[3], 10);
  return areaCode >= 2 && areaCode <= 9 && exchange >= 2 && exchange <= 9;
};

const PhoneVerifyForm = ({ onVerified }: Props) => {
  // Lazy initializers: resume an in-flight verification from sessionStorage on mount.
  const [initialSession] = useState(readOtpSession);
  const [step, setStep] = useState<Step>(initialSession ? 'otp' : 'phone');
  const [rawPhone, setRawPhone] = useState(initialSession?.phone ?? ''); // 10 digits only
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(() =>
    initialSession ? Math.max(0, RESEND_COOLDOWN_S - Math.floor((Date.now() - initialSession.sentAt) / 1000)) : 0,
  );

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
      setResendCooldown(RESEND_COOLDOWN_S);
      // Remember the in-flight verification so a closed-and-reopened sheet resumes here.
      writeOtpSession({ phone: rawPhone, sentAt: Date.now() });
    },
    onError: (err: unknown) => {
      const status = isAxiosError(err) ? err.response?.status : undefined;
      const message = apiErrorMessage(err, '');
      // Self-heal a stale client state: the server says this phone is already verified, so
      // treat it as success and let the pending entry action resume instead of dead-ending.
      if (status === 400 && /already verified/i.test(message)) {
        clearOtpSession();
        onVerified(false);
        return;
      }
      if (status === 400) {
        setError('Invalid phone number format.');
      } else if (status === 429) {
        // Surface the server's message (send spacing vs hourly cap say different things).
        setError(apiErrorMessage(err, 'Too many requests. Please wait before trying again.'));
      } else {
        setError(apiErrorMessage(err, 'Failed to send code. Please try again.'));
      }
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (verifyCode: string) => {
      const res = await api.post('/phone/verify-otp', { code: verifyCode });
      return res.data;
    },
    onSuccess: (data) => {
      setError('');
      clearOtpSession();
      onVerified(data?.referralBonusGranted ?? false);
    },
    onError: (err: unknown) => {
      const message = apiErrorMessage(err, 'Invalid or expired code. Please try again.');
      // A dead code (expired / cleaned up / killed after too many failed attempts) must not
      // be resumed on the next open - clear the session and unlock Resend so the user can
      // request a fresh code instead of being stuck on a code the server already deleted.
      if (/expired|no verification code|too many failed/i.test(message)) {
        clearOtpSession();
        setResendCooldown(0);
      }
      setError(message);
    },
  });

  const handleSendCode = () => {
    if (!rawPhone.trim()) { setError('Please enter your phone number.'); return; }
    if (!isValidUSPhone(rawPhone)) { setError('Enter a valid 10-digit US mobile number.'); return; }
    setError('');
    sendOtpMutation.mutate(`+1${rawPhone}`);
  };

  const handleVerifyCode = () => {
    if (code.length < 6) { setError('Please enter a 6-digit code.'); return; }
    setError('');
    verifyOtpMutation.mutate(code);
  };

  const handleResend = () => {
    if (resendCooldown > 0 || !rawPhone) return;
    setError('');
    sendOtpMutation.mutate(`+1${rawPhone}`);
  };

  // Typo'd the number? Go back to the phone step deliberately. The saved resume session is
  // dropped so a later reopen starts fresh; the server's send limits still apply as usual.
  const handleChangeNumber = () => {
    clearOtpSession();
    setStep('phone');
    setCode('');
    setError('');
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
          <Stack spacing={2}>
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
              placeholder='(555) 123-4567'
              value={formatPhoneDisplay(rawPhone)}
              onChange={(e) => {
                // Drop a leading country-code 1 (autofill/paste of "+1..."): a US area code
                // can never start with 1, so this is always safe.
                let cleaned = e.target.value.replace(/\D/g, '');
                if (cleaned.startsWith('1')) cleaned = cleaned.slice(1);
                setRawPhone(cleaned.slice(0, 10));
                if (error) setError('');
              }}
              onPaste={(e) => {
                e.preventDefault();
                let pasted = e.clipboardData.getData('text').replace(/\D/g, '');
                if (pasted.startsWith('1')) pasted = pasted.slice(1);
                setRawPhone(pasted.slice(0, 10));
                if (error) setError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
              inputMode='numeric'
              type='tel'
              autoComplete='tel-national'
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <Box sx={{ pr: 1, color: TEXT_PRIMARY, fontWeight: 600, whiteSpace: 'nowrap' }}>
                      +1
                    </Box>
                  ),
                },
              }}
              helperText='US mobile number only'
            />

            <Typography variant='caption' sx={{ color: TEXT_SECONDARY, lineHeight: 1.5, mt: 0, pb: 1.5 }}>
              By entering your phone number and tapping Send Code, you agree to receive a one-time verification code via SMS from Winnbell at that number, for account verification only. Message frequency: 1 message per request. Message and data rates may apply. Reply STOP to opt out, HELP for help.
              {' '}
              <a href='/privacy' target='_blank' rel='noopener noreferrer' style={{ color: PRIMARY_MAIN }}>Privacy Policy</a>
              {' | '}
              <a href='/terms' target='_blank' rel='noopener noreferrer' style={{ color: PRIMARY_MAIN }}>Terms of Service</a>
            </Typography>

            <Button
              variant='contained'
              size='large'
              onClick={handleSendCode}
              disabled={isLoadingStep1}
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
                Code sent to {formatPhoneDisplay(rawPhone)}
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
              fullWidth
              slotProps={{
                htmlInput: {
                  maxLength: 6,
                  style: { letterSpacing: '0.3em'},
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
              <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                Wrong number?{' '}
                <Typography
                  component='span'
                  variant='body2'
                  onClick={handleChangeNumber}
                  sx={{ color: PRIMARY_MAIN, fontWeight: 700, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                >
                  Change it
                </Typography>
              </Typography>
            </Box>
          </Stack>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return formContent;
};

export default PhoneVerifyForm;

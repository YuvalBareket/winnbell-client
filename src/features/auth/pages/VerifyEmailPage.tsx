import { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Stack, Alert, CircularProgress,
  useMediaQuery, useTheme,
} from '@mui/material';
import AttractButton from '../../../shared/components/AttractButton';
import { ArrowForward, Refresh, LockOutlined } from '@mui/icons-material';
import AuthBrandPanel from '../components/AuthBrandPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../shared/lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
  BG_PAGE, BORDER_LIGHT, PRIMARY_MAIN, ALPHA_PRIMARY_10,
  TEXT_HEADING, TEXT_SECONDARY, TEXT_TERTIARY,
  GRADIENT_HERO, GRADIENT_CTA, ALPHA_WHITE_15, SHADOW_PRIMARY_MEDIUM,
} from '../../../shared/colors';
import {
  staggerContainer, popIn, riseIn,
} from '../../../shared/motion';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

// ─── Six-box code input (per-box states: filled / focused / empty) ───────────
interface CodeBoxesProps {
  code: string;
  setCode: (code: string) => void;
  onComplete?: () => void;
  /** Design differs slightly per breakpoint: box shape, radius, gap, digit size */
  compact?: boolean;
  disabled?: boolean;
}

const CodeBoxes = ({ code, setCode, onComplete, compact = false, disabled = false }: CodeBoxesProps) => {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const focusBox = (index: number) => {
    const clamped = Math.max(0, Math.min(index, CODE_LENGTH - 1));
    inputsRef.current[clamped]?.focus();
  };

  // Writes the code and moves focus to the first empty box (or the last box when full)
  const applyCode = (next: string) => {
    setCode(next);
    if (next.length >= CODE_LENGTH) {
      focusBox(CODE_LENGTH - 1);
      onComplete?.();
    } else {
      focusBox(next.length);
    }
  };

  const handleChange = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) return;
    // Typing OR pasting: splice the digits in from this box forward
    const next = (code.slice(0, index) + digits).slice(0, CODE_LENGTH);
    applyCode(next);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (code.length === 0) return;
      const removeAt = index < code.length ? index : code.length - 1;
      const next = code.slice(0, removeAt) + code.slice(removeAt + 1);
      setCode(next);
      focusBox(removeAt);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusBox(index - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusBox(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (digits) applyCode(digits);
  };

  return (
    <Box sx={{ display: 'flex', gap: compact ? '8px' : '10px', justifyContent: 'space-between' }}>
      {Array.from({ length: CODE_LENGTH }, (_, i) => {
        const digit = code[i] ?? '';
        const filled = digit !== '';
        const focused = focusedIndex === i;
        // Design states: focused = strong navy border; filled = blue border + soft ring;
        // empty = light border.
        const border = focused
          ? `1.8px solid ${TEXT_HEADING}`
          : filled
            ? `1.5px solid ${PRIMARY_MAIN}`
            : `1px solid ${BORDER_LIGHT}`;
        return (
          <Box
            key={i}
            component='input'
            ref={(el: HTMLInputElement | null) => { inputsRef.current[i] = el; }}
            type='text'
            inputMode='numeric'
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            autoFocus={i === 0}
            disabled={disabled}
            value={digit}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(i, e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => { setFocusedIndex(i); e.target.select(); }}
            onBlur={() => setFocusedIndex((prev) => (prev === i ? null : prev))}
            sx={{
              flex: 1,
              minWidth: 0,
              aspectRatio: compact ? '1 / 1.15' : '1 / 1.08',
              bgcolor: 'white',
              border,
              borderRadius: compact ? '12px' : '13px',
              boxShadow: filled && !focused ? `0 0 0 3px ${ALPHA_PRIMARY_10}` : 'none',
              textAlign: 'center',
              fontSize: compact ? '24px' : '26px',
              fontWeight: 800,
              color: TEXT_HEADING,
              fontFamily: 'inherit',
              caretColor: PRIMARY_MAIN,
              outline: 'none',
              p: 0,
              transition: 'border-color 0.12s ease, box-shadow 0.12s ease',
            }}
          />
        );
      })}
    </Box>
  );
};

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
  // The code was just sent by the register step, so the resend timer starts running
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);

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
    if (code.length < CODE_LENGTH || !pendingEmail || loading) return;
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
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      setError('Failed to resend code.');
    }
  };

  // "Wrong address?" restarts registration with a fresh email
  const handleChangeEmail = () => {
    localStorage.removeItem('pendingEmail');
    navigate('/register', { replace: true });
  };

  const cooldownLabel = `${Math.floor(resendCooldown / 60)}:${String(resendCooldown % 60).padStart(2, '0')}`;

  // ─── Shared pieces ─────────────────────────────────────────────────────────

  const errorAlert = (
    <AnimatePresence mode='wait'>
      {error && (
        <motion.div variants={popIn} key='error' exit={{ opacity: 0, y: -10, transition: { duration: 0.18 } }}>
          <Alert severity='error' sx={{ borderRadius: 2 }}>{error}</Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const verifyButton = (
    <AttractButton
      fullWidth
      onClick={handleVerify}
      disabled={loading || code.length < CODE_LENGTH}
      sx={{
        borderRadius: isDesktop ? '13px' : '14px',
        padding: isDesktop ? '15px' : '16px',
        fontSize: '15px',
        fontWeight: 800,
        color: 'white',
        background: GRADIENT_CTA,
        boxShadow: SHADOW_PRIMARY_MEDIUM,
        textTransform: 'none',
        gap: 1,
        '&:hover:not(:disabled)': { background: GRADIENT_CTA, opacity: 0.95 },
        '&:disabled': { opacity: 0.6 },
      }}
    >
      {loading
        ? <CircularProgress size={22} color='inherit' />
        : <>Verify &amp; continue <ArrowForward sx={{ fontSize: 18 }} /></>}
    </AttractButton>
  );

  const resendRow = (
    <Box
      onClick={handleResend}
      sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        fontSize: '13.5px', color: TEXT_TERTIARY, fontWeight: 600,
        cursor: resendCooldown > 0 ? 'default' : 'pointer',
      }}
    >
      <Refresh sx={{ fontSize: 16, color: resendCooldown > 0 ? TEXT_TERTIARY : PRIMARY_MAIN }} />
      {resendCooldown > 0 ? (
        <Typography sx={{ font: 'inherit' }}>
          Resend code in <Box component='span' sx={{ color: TEXT_HEADING, fontWeight: 700 }}>{cooldownLabel}</Box>
        </Typography>
      ) : (
        <Typography sx={{ font: 'inherit', color: PRIMARY_MAIN, fontWeight: 800 }}>Resend code</Typography>
      )}
    </Box>
  );

  const changeEmailRow = (
    <Typography sx={{ textAlign: 'center', fontSize: '13.5px', color: TEXT_TERTIARY, fontWeight: 600 }}>
      Wrong address?{' '}
      <Box
        component='button'
        type='button'
        onClick={handleChangeEmail}
        sx={{ font: 'inherit', background: 'none', border: 0, p: 0, color: PRIMARY_MAIN, fontWeight: 800, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
      >
        Change email
      </Box>
    </Typography>
  );

  // ─── Desktop layout ────────────────────────────────────────────────────────

  if (isDesktop) {
    return (
      <Box sx={{ display: 'flex', height: 'var(--dvh100, 100dvh)', overflow: 'hidden' }}>
        <AuthBrandPanel
          headline={<>Check your<br />inbox.</>}
          tagline="One quick step to secure your account. We've sent a code that expires in 10 minutes."
          bullets={[{ icon: <LockOutlined sx={{ fontSize: 18 }} />, text: 'Keeps your info safe' }]}
        />

        {/* Right: form panel */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            bgcolor: BG_PAGE,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            px: 7,
            py: 6,
          }}
        >
          <motion.div variants={staggerContainer} initial='hidden' animate='visible'>
            <Box sx={{ maxWidth: 400, width: '100%', mx: 'auto' }}>
              <motion.div variants={riseIn}>
                <Typography sx={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', color: TEXT_HEADING }}>
                  Verify your email
                </Typography>
              </motion.div>
              <motion.div variants={riseIn}>
                <Typography sx={{ fontSize: '14.5px', color: TEXT_TERTIARY, fontWeight: 500, mt: '6px', mb: '30px' }}>
                  Enter the 6-digit code we sent to{' '}
                  <Box component='span' sx={{ color: TEXT_HEADING, fontWeight: 700 }}>{pendingEmail || 'your email address'}</Box>.
                </Typography>
              </motion.div>

              <Stack spacing={'20px'}>
                {errorAlert}
                <motion.div variants={popIn}>
                  <CodeBoxes code={code} setCode={setCode} disabled={loading} />
                </motion.div>
                <motion.div variants={popIn}>{verifyButton}</motion.div>
                <motion.div variants={popIn}>{resendRow}</motion.div>
                <motion.div variants={popIn}>{changeEmailRow}</motion.div>
              </Stack>
            </Box>
          </motion.div>
        </Box>
      </Box>
    );
  }

  // ─── Mobile layout ─────────────────────────────────────────────────────────

  return (
    <Box sx={{ minHeight: 'var(--dvh100, 100dvh)', display: 'flex', flexDirection: 'column', bgcolor: BG_PAGE }}>
      {/* Gradient header band, rounded bottom - same language as the profile-setup band */}
      <Box
        sx={{
          background: GRADIENT_HERO,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '0 0 28px 28px',
          px: '26px',
          pt: 'calc(env(safe-area-inset-top, 0px) + 22px)',
          pb: '30px',
          flexShrink: 0,
        }}
      >
        {/* Glow orb */}
        <Box sx={{ position: 'absolute', top: -70, right: -50, width: 200, height: 200, borderRadius: '50%', background: ALPHA_WHITE_15, filter: 'blur(46px)', pointerEvents: 'none' }} />
        <Typography sx={{ position: 'relative', fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Verify your email
        </Typography>
        <Typography sx={{ position: 'relative', fontSize: '13px', color: 'rgba(255,255,255,.8)', fontWeight: 500, mt: '5px' }}>
          Code sent to {pendingEmail || 'your email address'}
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, p: '28px 22px', display: 'flex', flexDirection: 'column' }}>
        <motion.div variants={staggerContainer} initial='hidden' animate='visible'>
          <Stack spacing={'20px'}>
            {errorAlert}
            <motion.div variants={popIn}>
              <Box>
                <Typography sx={{ fontSize: '12px', fontWeight: 700, color: TEXT_SECONDARY, mb: '12px' }}>
                  Enter your 6-digit code
                </Typography>
                <CodeBoxes code={code} setCode={setCode} compact disabled={loading} />
              </Box>
            </motion.div>
            <motion.div variants={popIn}>{verifyButton}</motion.div>
            <motion.div variants={popIn}>{resendRow}</motion.div>
          </Stack>
        </motion.div>
        <Box sx={{ mt: 'auto', pt: 3, pb: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }}>
          {changeEmailRow}
        </Box>
      </Box>
    </Box>
  );
};

export default VerifyEmailPage;

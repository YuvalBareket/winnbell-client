import { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Alert, CircularProgress,
  InputAdornment, IconButton, Stack, useMediaQuery, useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import LoadingScreen from '../../../shared/components/LoadingScreen';
import { Lock, Visibility, VisibilityOff, CheckCircle, ConfirmationNumber } from '@mui/icons-material';
import AuthBrandPanel from '../components/AuthBrandPanel';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../shared/lib/supabase';
import { useRevokeOtherSessions } from '../hooks/useRevokeOtherSessions';
import {
  BG_PAGE, SHADOW_PRIMARY_SOFT, SHADOW_PRIMARY_MEDIUM, ALPHA_PRIMARY_10,
} from '../../../shared/colors';


const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const revokeOtherSessions = useRevokeOtherSessions();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    const timeout = setTimeout(() => {
      if (!ready) navigate('/login?error=session', { replace: true });
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate, ready]);

  const handleSubmit = async () => {
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setLoading(false);
      setError(updateError.message || 'Failed to update password.');
      return;
    }

    await revokeOtherSessions();

    setLoading(false);
    setSuccess(true);
    setTimeout(() => navigate('/login', { replace: true }), 3000);
  };

  if (!ready) {
    return <LoadingScreen />;
  }

  const SuccessContent = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, duration: 0.4, ease: 'easeOut' }}
        >
          <CheckCircle sx={{ fontSize: { xs: 56, md: 64 }, mb: 2, color: 'primary.main' }} />
        </motion.div>
        <Typography variant='h5' fontWeight={800} gutterBottom sx={{ mb: 1 }}>
          Password Updated
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
          Your account is now secure. Redirecting to login...
        </Typography>
      </Box>
    </motion.div>
  );

  const FormContent = () => (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Stack spacing={3}>
        <Box>
          <Typography variant='h5' fontWeight={800} sx={{ mb: 0.5 }}>
            Set New Password
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
            Create a strong password to keep your account secure.
          </Typography>
        </Box>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert
              severity='error'
              sx={{ borderRadius: { xs: 2, md: 2.5 } }}
            >
              {error}
            </Alert>
          </motion.div>
        )}

        <TextField
          fullWidth
          label='New Password'
          type={show ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='Minimum 8 characters'
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: 'background.paper',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bgcolor: 'background.paper',
              },
              '&.Mui-focused': {
                boxShadow: `0 0 0 3px ${ALPHA_PRIMARY_10}`,
              },
            },
            '& .MuiOutlinedInput-input': {
              py: 1.75,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <Lock sx={{ fontSize: 18, color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton
                  size='small'
                  onClick={() => setShow(!show)}
                  edge='end'
                  sx={{
                    width: 44,
                    height: 44,
                    mr: -1,
                  }}
                >
                  {show ? (
                    <VisibilityOff fontSize='small' />
                  ) : (
                    <Visibility fontSize='small' />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label='Confirm Password'
          type={show ? 'text' : 'password'}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder='Repeat your password'
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: 'background.paper',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bgcolor: 'background.paper',
              },
              '&.Mui-focused': {
                boxShadow: `0 0 0 3px ${ALPHA_PRIMARY_10}`,
              },
            },
            '& .MuiOutlinedInput-input': {
              py: 1.75,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <Lock sx={{ fontSize: 18, color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />

        <Button
          fullWidth
          variant='contained'
          size='large'
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            fontWeight: 700,
            py: 1.75,
            borderRadius: 2,
            boxShadow: SHADOW_PRIMARY_SOFT,
            transition: 'all 0.2s ease-in-out',
            '&:hover:not(:disabled)': {
              transform: 'translateY(-2px)',
              boxShadow: SHADOW_PRIMARY_MEDIUM,
            },
            '&:active:not(:disabled)': {
              transform: 'translateY(0)',
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} color='inherit' />
          ) : (
            'Update Password'
          )}
        </Button>

        <Box sx={{ textAlign: 'center', pt: 1 }}>
          <Typography variant='body2' color='text.secondary'>
            Remember your password?{' '}
            <Typography
              component='span'
              onClick={() => navigate('/login')}
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                '&:hover': {
                  opacity: 0.8,
                },
              }}
            >
              Sign in
            </Typography>
          </Typography>
        </Box>
      </Stack>
    </motion.div>
  );

  if (isDesktop) {
    return (
      <Box sx={{ display: 'flex', height: 'var(--dvh100, 100dvh)', overflow: 'hidden' }}>
        <AuthBrandPanel
          headline='You Are One Step Away.'
          tagline='Set a strong password to secure your account and get back to winning real prizes.'
          bullets={[]}
        />
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            bgcolor: BG_PAGE,
            display: 'flex',
            flexDirection: 'column',
            px: 6,
            py: 4,
          }}
        >
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 400, width: '100%', mx: 'auto' }}>
            {success ? SuccessContent() : FormContent()}
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: 'var(--dvh100, 100dvh)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: BG_PAGE,
        p: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ width: '100%', maxWidth: 440 }}
      >
        <Stack spacing={3}>
          {!success && (
            <Box sx={{ textAlign: 'center', mb: 1 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <ConfirmationNumber sx={{ color: 'white', fontSize: 28 }} />
              </Box>
            </Box>
          )}

          {success ? <SuccessContent /> : <FormContent />}
        </Stack>
      </motion.div>
    </Box>
  );
};

export default ResetPasswordPage;

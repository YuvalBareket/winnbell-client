import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, TextField, IconButton, InputAdornment,
  Paper, Container, Divider, Stack, Alert, CircularProgress,
  Checkbox, FormControlLabel, useMediaQuery, useTheme, Snackbar,
} from '@mui/material';
import {
  ArrowBackIosNew, ConfirmationNumber, Mail, Lock, Visibility, VisibilityOff,
  Login, Google, Storefront, EmojiEvents, CardGiftcard,
} from '@mui/icons-material';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { supabase } from '../../../shared/lib/supabase';
import { useSyncStatus } from '../../../shared/context/SyncStatusContext';
import { useAppSelector } from '../../../store/hook';
import { selectIsAuthenticated, selectIsAdmin, selectIsBusiness, selectIsLocationManager } from '../../../store/selectors/authSelectors';
import {
  BG_PAGE, BORDER_LIGHT, SHADOW_PRIMARY_SOFT,
  GRADIENT_HERO, ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_30,
  GOOGLE_BLUE, SHADOW_GOOGLE, SHADOW_NEUTRAL_SOFT,
} from '../../../shared/colors';

// ─── Shared brand panel for desktop ─────────────────────────────────────────

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

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const inviteToken = searchParams.get('token');
  const sessionError = searchParams.get('error') === 'session';
  const accountDeleted = searchParams.get('deleted') === '1';
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [resetState, setResetState] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [toast, setToast] = useState('');

  const { syncError, isLoaded } = useSyncStatus();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);
  const isBusinessAdmin = useAppSelector(selectIsBusiness);
  const isManager = useAppSelector(selectIsLocationManager);

  useEffect(() => {
    if (syncError && loading) {
      setLoading(false);
      setError('Something went wrong signing you in. Please try again.');
    }
  }, [syncError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSocialLogin = async (provider: 'google') => {
    setGoogleLoading(true);
    if (inviteToken) localStorage.setItem('pendingInviteToken', inviteToken);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/sso-callback`,
      },
    });
    if (oauthError) {
      localStorage.removeItem('pendingInviteToken');
      setError(oauthError.message || 'Social login failed');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.email) { setError('Please enter your email address.'); return; }
    if (!formData.password) { setError('Please enter your password.'); return; }
    if (!termsAccepted) { setError('Please accept the terms to continue.'); return; }
    setLoading(true);
    setError('');
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (signInError) {
        setError(signInError.message || 'Invalid email or password');
        setLoading(false);
      } else {
        if (inviteToken) localStorage.setItem('pendingInviteToken', inviteToken);
        if (isAuthenticated) {
          // Redux already has a valid session — useSupabaseSync will early-return because
          // nothing changed server-side. Navigate directly using the role we already know.
          const dest = isAdmin ? '/admin' : (isBusinessAdmin || isManager) ? '/activity' : '/scan';
          navigate(dest, { replace: true });
        }
        // If not yet authenticated: keep loading=true — useSupabaseSync will call /auth/sync
        // on the SIGNED_IN event (first-time login) and navigate when done.
        // Loading resets via the syncError useEffect if sync fails.
      }
    } catch {
      setError('Invalid email or password');
      setLoading(false);
    }
  };

  // ─── Form content (shared between mobile & desktop) ──────────────────────────

  const FormContent = () => (
    <Stack sx={{ zoom: { xs: 0.85, md: 0.75 } }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 2, md: 3 }, textAlign: isDesktop ? 'left' : 'center' }}>
        {!isDesktop && (
          <Paper elevation={4} sx={{ width: 56, height: 56, bgcolor: 'primary.main', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, transform: 'rotate(3deg)', mx: 'auto' }}>
            <ConfirmationNumber sx={{ color: 'white', fontSize: 28 }} />
          </Paper>
        )}
        <Stack direction='row' alignItems='center' gap={3} mb={1} justifyContent={isDesktop ? 'flex-start' : 'center'}>
          {isDesktop && (
            <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'white', border: `1px solid ${BORDER_LIGHT}`, flexShrink: 0 }}>
              <ArrowBackIosNew fontSize='small' />
            </IconButton>
          )}
          <Typography variant='h4' sx={{ fontWeight: 700 }}>Welcome Back</Typography>
        </Stack>
        <Typography variant='body1' color='text.secondary'>Sign in to check your entries</Typography>
      </Box>

      {sessionError && (
        <Alert severity='warning' sx={{ mb: 3, borderRadius: 2 }}>
          Your previous session didn't complete. Please sign in again.
        </Alert>
      )}

      {accountDeleted && (
        <Alert severity='info' sx={{ mb: 3, borderRadius: 2 }}>
          Your account has been deleted. If this was a mistake, please contact support.
        </Alert>
      )}

      {error && <Alert severity='error' sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {resetState === 'sent' && (
        <Alert severity='success' onClose={() => setResetState('idle')} sx={{ mb: 3, borderRadius: 2 }}>
          Reset link sent. Check your inbox and follow the link to set a new password.
        </Alert>
      )}
      {resetState === 'error' && (
        <Alert severity='error' onClose={() => setResetState('idle')} sx={{ mb: 3, borderRadius: 2 }}>
          Could not send reset email. Check the address and try again.
        </Alert>
      )}

      <Stack spacing={1.5}>
        <Box>
          <Typography variant='subtitle2' sx={{ ml: 1, mb: 0.5, fontWeight: 700 }}>Email</Typography>
          <TextField fullWidth name='email' value={formData.email} onChange={handleChange} placeholder='Enter your email'
            InputProps={{
              startAdornment: (<InputAdornment position='start'><Mail sx={{ color: 'text.secondary' }} /></InputAdornment>),
              sx: { borderRadius: 2.5, bgcolor: 'background.paper' },
            }}
          />
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, ml: 1 }}>
            <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>Password</Typography>
            <Typography
              variant='caption'
              sx={{ fontWeight: 700, color: 'primary.main', cursor: 'pointer' }}
              onClick={async () => {
        if (!formData.email) { setError('Enter your email above first, then click Forgot.'); return; }
        setResetState('loading');
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        setResetState(resetError ? 'error' : 'sent');
      }}
            >
              {resetState === 'loading' ? 'Sending...' : 'Forgot?'}
            </Typography>
          </Box>
          <TextField fullWidth name='password' value={formData.password} onChange={handleChange}
            type={showPassword ? 'text' : 'password'} placeholder='Enter your password'
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            InputProps={{
              startAdornment: (<InputAdornment position='start'><Lock sx={{ color: 'text.secondary' }} /></InputAdornment>),
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge='end'>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: { borderRadius: 2.5, bgcolor: 'background.paper' },
            }}
          />
        </Box>

        <Box>
          <Divider sx={{ mb: 2 }}>
            <Typography variant='caption' sx={{ color: 'text.disabled', fontWeight: 700, px: 1 }}>OR</Typography>
          </Divider>
          <Button
            fullWidth
            variant='contained'
            startIcon={googleLoading ? <CircularProgress size={20} color='inherit' /> : <Google />}
            onClick={() => termsAccepted ? handleSocialLogin('google') : setToast('Please approve the terms first')}
            disabled={googleLoading}
            sx={{
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              bgcolor: 'background.paper',
              color: 'text.primary',
              border: `2px solid ${GOOGLE_BLUE}`,
              fontWeight: 700,
              fontSize: '1rem',
              boxShadow: SHADOW_NEUTRAL_SOFT,
              transition: 'all 0.2s ease-in-out',
              opacity: 1,
              '&:hover': {
                bgcolor: 'background.paper',
                boxShadow: SHADOW_GOOGLE,
              },
              '&:disabled': {
                bgcolor: 'background.paper',
                color: 'text.primary',
                border: `2px solid ${GOOGLE_BLUE}`,
                opacity: 1,
              },
            }}>
            {googleLoading ? 'Signing in...' : 'Continue with Google'}
          </Button>
        </Box>

        <FormControlLabel
          control={<Checkbox checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} size='small' />}
          label={
            <Typography variant='caption' color='text.secondary'>
              I agree to the{' '}
              <Typography component='span' variant='caption' onClick={(e) => { e.preventDefault(); navigate('/terms'); }} sx={{ color: 'primary.main', fontWeight: 700, cursor: 'pointer' }}>
                Terms of Service
              </Typography>{' '}and{' '}
              <Typography component='span' variant='caption' onClick={(e) => { e.preventDefault(); navigate('/privacy'); }} sx={{ color: 'primary.main', fontWeight: 700, cursor: 'pointer' }}>
                Privacy Policy
              </Typography>
            </Typography>
          }
        />

        <Button variant='contained' size='large' onClick={handleSubmit} disabled={loading || !termsAccepted}
          endIcon={!loading && <Login />}
          sx={{ py: 1.5, borderRadius: 2, fontSize: '1rem', fontWeight: 700, boxShadow: SHADOW_PRIMARY_SOFT }}>
          {loading ? <CircularProgress size={24} color='inherit' /> : 'Sign In'}
        </Button>
      </Stack>

      <Box sx={{ mt: 'auto', pt: 2, textAlign: 'center' }}>
        <Typography variant='body2' color='text.secondary' fontWeight={500}>
          Don't have an account?{' '}
          <Typography component='span' onClick={() => navigate(inviteToken ? `/register/?token=${inviteToken}` : '/register')}
            sx={{ color: 'primary.main', fontWeight: 700, cursor: 'pointer' }}>
            Create new account
          </Typography>
        </Typography>
      </Box>
    </Stack>
  );

  // ─── Redirect already-authenticated users ───────────────────────────────────

  if (isLoaded && isAuthenticated) {
    const dest = isAdmin ? '/admin' : (isBusinessAdmin || isManager) ? '/activity' : '/scan';
    return <Navigate to={dest} replace />;
  }

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
            px: 6,
            py: 4,
          }}
        >
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 400 }}>
            {FormContent()}
          </Box>
        </Box>
        <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast('')} message={toast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
      </Box>
    );
  }

  // ─── Mobile layout (original) ────────────────────────────────────────────────

  return (
    <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: BG_PAGE, overflowY: 'auto' }}>
      <Box sx={{ p: 2 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'action.hover' }}>
          <ArrowBackIosNew fontSize='small' />
        </IconButton>
      </Box>
      <Container maxWidth='xs' sx={{ flex: 1, display: 'flex', flexDirection: 'column', pt: 0, pb: 4 }}>
        {FormContent()}
      </Container>
      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast('')} message={toast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
};

export default LoginPage;

import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, TextField, IconButton, InputAdornment,
  Container, Divider, Stack, Alert, CircularProgress,
  Checkbox, FormControlLabel, useMediaQuery, useTheme,
} from '@mui/material';
import AttractButton from '../../../shared/components/AttractButton';
import {
  ArrowBackIosNew, ArrowForward, Mail, Lock, Visibility, VisibilityOff,
  Google,
} from '@mui/icons-material';
import AuthBrandPanel from '../components/AuthBrandPanel';
import { useNavigate, useSearchParams, useParams, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../../shared/lib/supabase';
import { useSyncStatus } from '../../../shared/context/SyncStatusContext';
import { useAppSelector } from '../../../store/hook';
import { selectIsAuthenticated, selectIsAdmin, selectIsBusiness, selectIsLocationManager } from '../../../store/selectors/authSelectors';
import {
  BG_PAGE, BORDER_LIGHT, GRADIENT_HERO, GRADIENT_HERO_WARM,
  ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_30, ALPHA_WHITE_70,
  TEXT_TERTIARY, TEXT_HEADING,
} from '../../../shared/colors';
import { authLabelSx, authInputSx, authCtaSx, authGoogleBtnSx } from '../components/authStyles';
import {
  staggerContainer, popIn, riseIn,
} from '../../../shared/motion';

// ─── Main component ──────────────────────────────────────────────────────────

const LoginPage = () => {
  const navigate = useNavigate();
  const { role } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const inviteToken = searchParams.get('token');
  const sessionError = searchParams.get('error') === 'session';
  const accountDeleted = searchParams.get('deleted') === '1';
  // "Add account" mode: reached from the account switcher while already signed in. Signs in a
  // SECOND account and keeps the current one, instead of replacing it. See useSupabaseSync.
  const addMode = searchParams.get('add') === '1';
  // Business variant if role=business or an invite token present
  const isBusinessVariant = role?.toLowerCase() === 'business' || !!inviteToken;
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [resetState, setResetState] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');

  const { syncError, isLoaded, isSignedIn } = useSyncStatus();
  // Just returned from the Google OAuth round-trip (router state set by SSOCallbackPage).
  // Purely derived, no effects: the button shows pending until the sync either signs the
  // user in (the authed redirect below fires) or resolves signed-out / errored (released,
  // so no spinner can ever stick - cancelled at Google, deleted account, region block).
  const cameFromSso = !!(location.state as { ssoReturn?: boolean } | null)?.ssoReturn;
  const googlePending = googleLoading
    || (cameFromSso && !syncError && !error && !accountDeleted && !(isLoaded && !isSignedIn));
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);
  const isBusinessAdmin = useAppSelector(selectIsBusiness);
  const isManager = useAppSelector(selectIsLocationManager);

  // Reflect an async sign-in sync failure (from useSupabaseSync, delivered via context) back
  // on the form: stop the spinner and show an error. This must react to external async state,
  // so the setState here is intentional.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (syncError && loading) {
      setLoading(false);
      setError('Something went wrong signing you in. Please try again.');
    }
  }, [syncError, loading]);

  // Terminal sync failures (deleted account) navigate to /login?deleted=1 WITHOUT setting
  // syncError. The page is already mounted, so only the query param changes and the submit
  // spinner would stay on forever - stop it here. The ?deleted=1 alert explains the failure.
  useEffect(() => {
    if (accountDeleted && loading) setLoading(false);
  }, [accountDeleted, loading]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSocialLogin = async (provider: 'google') => {
    setGoogleLoading(true);
    setError('');
    if (inviteToken) localStorage.setItem('pendingInviteToken', inviteToken);
    // Add-account via OAuth: the flag must be in localStorage BEFORE the redirect so
    // useSupabaseSync appends the new account when the session returns on /sso-callback.
    if (addMode) localStorage.setItem('pendingAddAccount', '1');
    // SSOCallbackPage returns here (instead of flashing the landing page) and this page
    // shows the Google button pending until the sync finishes and the authed redirect fires.
    sessionStorage.setItem('ssoReturnPath', window.location.pathname + window.location.search);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/sso-callback`,
      },
    });
    if (oauthError) {
      localStorage.removeItem('pendingInviteToken');
      localStorage.removeItem('pendingAddAccount');
      sessionStorage.removeItem('ssoReturnPath');
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
    // Must be set BEFORE signInWithPassword: the SIGNED_IN event fires useSupabaseSync
    // synchronously, and it reads pendingInviteToken from localStorage to promote the
    // user to manager. Setting it after sign-in (the old bug) meant the invite was
    // missed and an existing user signing in via an invite link stayed a regular user.
    if (inviteToken) localStorage.setItem('pendingInviteToken', inviteToken);
    // Add-account: flag BEFORE sign-in so useSupabaseSync appends (keeps the current account)
    // instead of replacing it when the SIGNED_IN event fires.
    if (addMode) localStorage.setItem('pendingAddAccount', '1');
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (signInError) {
        localStorage.removeItem('pendingInviteToken');
        localStorage.removeItem('pendingAddAccount');
        setError(signInError.message || 'Invalid email or password');
        setLoading(false);
      } else {
        // In add mode we must let useSupabaseSync run (it performs the addAccount on the
        // SIGNED_IN event), so do NOT take the already-authenticated shortcut below.
        if (isAuthenticated && !addMode) {
          // Redux already has a valid session — useSupabaseSync will early-return because
          // nothing changed server-side. Navigate directly using the role we already know.
          const dest = isAdmin ? '/admin' : (isBusinessAdmin || isManager) ? '/campaign' : '/scan';
          navigate(dest, { replace: true });
        }
        // If not yet authenticated (or adding an account): keep loading=true — useSupabaseSync
        // calls /auth/sync on the SIGNED_IN event and navigates when done.
        // Loading resets via the syncError useEffect if sync fails.
      }
    } catch {
      localStorage.removeItem('pendingInviteToken');
      localStorage.removeItem('pendingAddAccount');
      setError('Invalid email or password');
      setLoading(false);
    }
  };

  // ─── Form content (shared between mobile & desktop) ──────────────────────────

  const FormContent = () => (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      {/* Approved mobile/tablet sizing keeps the zoom; large desktops (lg+) render at 1:1
          where the responsive lg/xl sizes below take over (zoom 0.8 there made the whole
          form look tiny on big monitors). */}
      <Stack sx={{ zoom: { xs: 0.85, md: 0.8, lg: 1 } }}>
        {/* Header - desktop only; on mobile the gradient band above carries the title */}
        {isDesktop && (
          <motion.div variants={riseIn}>
            <Box sx={{ mb: { lg: '30px', xl: '36px' }, textAlign: 'left' }}>
              <Stack direction='row' alignItems='center' gap={2} mb='6px'>
                <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'white', border: `1px solid ${BORDER_LIGHT}`, flexShrink: 0 }}>
                  <ArrowBackIosNew fontSize='small' />
                </IconButton>
                <Typography sx={{ fontSize: { lg: '28px', xl: '32px' }, fontWeight: 800, letterSpacing: '-0.02em', color: TEXT_HEADING }}>{addMode ? 'Add Account' : 'Welcome Back'}</Typography>
              </Stack>
              <Typography sx={{ fontSize: { lg: '14.5px', xl: '15px' }, fontWeight: 500, color: TEXT_TERTIARY }}>{addMode ? 'Sign in to the account you want to add' : 'Sign in to check your entries'}</Typography>
            </Box>
          </motion.div>
        )}

        {sessionError && (
          <motion.div variants={popIn}>
            <Alert severity='warning' sx={{ mb: 3, borderRadius: 2 }}>
              Your previous session didn't complete. Please sign in again.
            </Alert>
          </motion.div>
        )}

        {accountDeleted && (
          <motion.div variants={popIn}>
            <Alert severity='info' sx={{ mb: 3, borderRadius: 2 }}>
              Your account has been deleted. If this was a mistake, please contact support.
            </Alert>
          </motion.div>
        )}

        {error && (
          <motion.div variants={popIn}>
            <Alert severity='error' sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
          </motion.div>
        )}

        {resetState === 'sent' && (
          <motion.div variants={popIn}>
            <Alert severity='success' onClose={() => setResetState('idle')} sx={{ mb: 3, borderRadius: 2 }}>
              Reset link sent. Check your inbox and follow the link to set a new password.
            </Alert>
          </motion.div>
        )}
        {resetState === 'error' && (
          <motion.div variants={popIn}>
            <Alert severity='error' onClose={() => setResetState('idle')} sx={{ mb: 3, borderRadius: 2 }}>
              Could not send reset email. Check the address and try again.
            </Alert>
          </motion.div>
        )}

        <Stack spacing={2.25}>
          <motion.div variants={popIn}>
            <Box>
              <Typography sx={authLabelSx}>Email</Typography>
              <TextField fullWidth name='email' value={formData.email} onChange={handleChange} placeholder='Enter your email'
                sx={authInputSx}
                InputProps={{
                  startAdornment: (<InputAdornment position='start'><Mail sx={{ color: TEXT_TERTIARY, fontSize: 20 }} /></InputAdornment>),
                }}
              />
            </Box>
          </motion.div>

          <motion.div variants={popIn}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '7px' }}>
                <Typography sx={{ ...authLabelSx, mb: 0 }}>Password</Typography>
                <Typography
                  sx={{ fontSize: '12.5px', fontWeight: 700, color: 'primary.main', cursor: 'pointer' }}
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
                sx={authInputSx}
                InputProps={{
                  startAdornment: (<InputAdornment position='start'><Lock sx={{ color: TEXT_TERTIARY, fontSize: 20 }} /></InputAdornment>),
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge='end'>
                        {showPassword ? <VisibilityOff sx={{ fontSize: 20, color: TEXT_TERTIARY }} /> : <Visibility sx={{ fontSize: 20, color: TEXT_TERTIARY }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </motion.div>

          <motion.div variants={popIn}>
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
          </motion.div>

          <motion.div variants={popIn}>
            <AttractButton fullWidth variant='contained' size='large' onClick={handleSubmit} disabled={loading || googlePending}
              endIcon={!loading && <ArrowForward sx={{ fontSize: 18 }} />}
              sx={authCtaSx}>
              {loading ? <CircularProgress size={24} color='inherit' /> : 'Sign In'}
            </AttractButton>
          </motion.div>

          <motion.div variants={popIn}>
            <Box>
              <Divider sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: TEXT_TERTIARY, px: 1 }}>OR</Typography>
              </Divider>
              <Button
                fullWidth
                startIcon={googlePending ? <CircularProgress size={18} color='inherit' /> : <Google sx={{ fontSize: 18 }} />}
                onClick={() => termsAccepted ? handleSocialLogin('google') : setError('Please approve the terms first.')}
                disabled={googlePending || loading}
                sx={authGoogleBtnSx}>
                {googlePending ? 'Signing in...' : 'Continue with Google'}
              </Button>
            </Box>
          </motion.div>
        </Stack>

        <Box sx={{ mt: 'auto', pt: 2.5, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '13.5px', fontWeight: 600, color: TEXT_TERTIARY }}>
            Don't have an account?{' '}
            <Typography component='span' onClick={() => {
              let dest = '/register';
              if (isBusinessVariant && !inviteToken) dest = '/register/business';
              if (inviteToken) dest += `?token=${inviteToken}`;
              if (addMode) dest += `${dest.includes('?') ? '&' : '?'}add=1`;
              navigate(dest);
            }}
              sx={{ fontSize: '13.5px', color: 'primary.main', fontWeight: 800, cursor: 'pointer' }}>
              Create new account
            </Typography>
          </Typography>
        </Box>
      </Stack>
    </motion.div>
  );

  // ─── Redirect already-authenticated users ───────────────────────────────────

  // In add-account mode an authenticated user MUST stay on this page to sign in the second
  // account, so only redirect away when NOT adding.
  if (isLoaded && isAuthenticated && !addMode) {
    const dest = isAdmin ? '/admin' : (isBusinessAdmin || isManager) ? '/campaign' : '/scan';
    return <Navigate to={dest} replace />;
  }

  // ─── Desktop layout ──────────────────────────────────────────────────────────

  if (isDesktop) {
    return (
      <Box sx={{ display: 'flex', height: 'var(--dvh100, 100dvh)', overflow: 'hidden' }}>
        <AuthBrandPanel isBusinessVariant={isBusinessVariant} />

        {/* Right: form panel */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            bgcolor: BG_PAGE,
            display: 'flex',
            flexDirection: 'column',
            px: { lg: 8, xl: 12 },
            py: 6,
            justifyContent: 'center',
          }}
        >
          <Box sx={{ maxWidth: { lg: 420, xl: 480 }, width: '100%', mx: 'auto' }}>
            {FormContent()}
          </Box>
        </Box>
      </Box>
    );
  }

  // ─── Mobile layout ──────────────────────────────────────────────────────────

  return (
    <Box sx={{ height: 'var(--dvh100, 100dvh)', display: 'flex', flexDirection: 'column', bgcolor: BG_PAGE, overflowY: 'auto' }}>
      {/* Gradient header band - mirrors the main layout's AppPageHero: brand row (back arrow +
          app name) then the title block, radial glow orb (filter:blur breaks the band's
          rounded-bottom clipping on Android). */}
      <Box
        sx={{
          background: isBusinessVariant ? GRADIENT_HERO_WARM : GRADIENT_HERO,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '0 0 28px 28px',
          px: 1.5,
          pt: 'calc(env(safe-area-inset-top, 0px) + 10px)',
          pb: 2.5,
          // Never let the flex column squeeze the band on short screens - the page scrolls instead.
          flexShrink: 0,
        }}
      >
        {/* Glow orb */}
        <Box sx={{ position: 'absolute', top: -110, right: -90, width: 320, height: 320, borderRadius: '50%', background: `radial-gradient(circle, ${ALPHA_WHITE_15} 0%, transparent 68%)`, pointerEvents: 'none' }} />

        {/* Brand row: back arrow + app name (+ business chip) */}
        <Stack direction='row' alignItems='center' spacing={1.25} sx={{ position: 'relative' }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              width: 40, height: 40, color: 'white', bgcolor: ALPHA_WHITE_15,
              border: `1px solid ${ALPHA_WHITE_20}`, borderRadius: '10px', flexShrink: 0,
              '&:hover': { bgcolor: ALPHA_WHITE_30 },
            }}
          >
            <ArrowBackIosNew sx={{ fontSize: 18 }} />
          </IconButton>
          <Box component='img' src='/winnbell_app_name_white.svg' alt='Winnbell' sx={{ height: 36, width: 'auto', objectFit: 'contain' }} />
          {isBusinessVariant && (
            <Typography
              component='span'
              sx={{
                fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: ALPHA_WHITE_70, border: `1px solid ${ALPHA_WHITE_30}`, borderRadius: '5px',
                px: 0.75, py: 0.25, lineHeight: 1.4,
              }}
            >
              Business
            </Typography>
          )}
        </Stack>

        {/* Title block */}
        <Box sx={{ position: 'relative', mt: 1.5, px: 1 }}>
          <Typography variant='h5' fontWeight={700} sx={{ letterSpacing: '-0.02em' }}>
            {addMode ? 'Add Account' : 'Welcome Back'}
          </Typography>
          <Typography variant='body2' sx={{ opacity: 0.8, mt: 0.25 }}>
            {addMode ? 'Sign in to the account you want to add' : 'Sign in to check your entries'}
          </Typography>
        </Box>
      </Box>

      {/* Form content */}
      <Container maxWidth='xs' sx={{ flex: 1, display: 'flex', flexDirection: 'column', pt: 3, pb: 4 }}>
        {FormContent()}
      </Container>
    </Box>
  );
};

export default LoginPage;

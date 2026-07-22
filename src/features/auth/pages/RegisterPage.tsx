import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, TextField, IconButton, InputAdornment, Container,
  Stack, Alert, CircularProgress, Divider, Checkbox, FormControlLabel,
  useMediaQuery, useTheme,
} from '@mui/material';
import AttractButton from '../../../shared/components/AttractButton';
import {
  ArrowBackIosNew, ArrowForward, Person, Mail, Lock, Visibility, VisibilityOff,
  Storefront, Google, ConfirmationNumber, EmojiEvents, CardGiftcard,
} from '@mui/icons-material';
import { useNavigate, useParams, useSearchParams, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthBrandPanel from '../components/AuthBrandPanel';
import { api } from '../../../shared/api/client';
import { useSyncStatus } from '../../../shared/context/SyncStatusContext';
import { useAppSelector } from '../../../store/hook';
import { selectIsAuthenticated, selectIsAdmin, selectIsBusiness, selectIsLocationManager as selectIsLocMgr } from '../../../store/selectors/authSelectors';
import { supabase } from '../../../shared/lib/supabase';
import {
  BG_PAGE, TEXT_HEADING, TEXT_TERTIARY, BORDER_LIGHT,
  ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_30, ALPHA_WHITE_70,
  GRADIENT_HERO, GRADIENT_HERO_WARM,
} from '../../../shared/colors';
import { authLabelSx, authInputSx, authCtaSx, authGoogleBtnSx } from '../components/authStyles';
import {
  staggerContainer, popIn, riseIn,
} from '../../../shared/motion';


// ─── Main component ──────────────────────────────────────────────────────────

const RegisterPage = () => {
  const navigate = useNavigate();
  const { role } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const inviteToken = searchParams.get('token');
  // "Add account" mode: reached from the account switcher / add-account login while already
  // signed in. Creates a SECOND account and keeps the current one (see useSupabaseSync).
  const addMode = searchParams.get('add') === '1';
  const roleLower = role?.toLowerCase();
  const isBusinessOwner = roleLower === 'business' && !inviteToken;
  const isLocationManager = inviteToken !== null;
  const isBusinessVariant = isBusinessOwner || isLocationManager;

  const { isLoaded: syncLoaded, isSignedIn, syncError } = useSyncStatus();
  const isAuth = useAppSelector(selectIsAuthenticated);
  const isAdminUser = useAppSelector(selectIsAdmin);
  const isBusinessUser = useAppSelector(selectIsBusiness);
  const isManagerUser = useAppSelector(selectIsLocMgr);

  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(searchParams.get('syncError') ?? '');
  // Just returned from the Google OAuth round-trip (router state set by SSOCallbackPage).
  // Purely derived, no effects: the button shows pending until the sync either signs the
  // user in (the authed redirect below fires) or resolves signed-out / errored (released,
  // so no spinner can ever stick - cancelled at Google, deleted account, region block).
  const cameFromSso = !!(location.state as { ssoReturn?: boolean } | null)?.ssoReturn;
  const googlePending = googleLoading
    || (cameFromSso && !syncError && !error && !(syncLoaded && !isSignedIn));
  const [termsAccepted, setTermsAccepted] = useState(false);
  // Surface the same rules the submit enforces, but on blur so the user gets feedback early.
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const emailError = touched.email && formData.email.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ? 'Enter a valid email address.' : '';
  const passwordError = touched.password && formData.password !== '' && formData.password.length < 8
    ? 'Password must be at least 8 characters.' : '';
  const [regionBlocked, setRegionBlocked] = useState(false);

  useEffect(() => {
    if (searchParams.get('region_blocked') === '1') {
      setRegionBlocked(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- read the URL param once on mount
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSocialSignUp = async (provider: 'google' | 'apple') => {
    setGoogleLoading(true);
    setError('');
    const roleFormatted = role ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase() : 'User';
    localStorage.setItem('pendingRole', roleFormatted);
    if (inviteToken) localStorage.setItem('pendingInviteToken', inviteToken);
    // Add-account via OAuth: flag BEFORE the redirect so useSupabaseSync appends the new
    // account (keeps the current one) when the session returns on /sso-callback.
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
      localStorage.removeItem('pendingRole');
      localStorage.removeItem('pendingInviteToken');
      localStorage.removeItem('pendingAddAccount');
      sessionStorage.removeItem('ssoReturnPath');
      setError(oauthError.message || 'Social login failed');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.fullName) { setError('Please enter your full name.'); return; }
    if (!formData.email) { setError('Please enter your email address.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { setTouched((t) => ({ ...t, email: true })); setError('Enter a valid email address.'); return; }
    if (!formData.password) { setError('Please enter a password.'); return; }
    if (formData.password.length < 8) { setTouched((t) => ({ ...t, password: true })); setError('Password must be at least 8 characters.'); return; }
    if (!termsAccepted) { setError('Please accept the terms to continue.'); return; }
    setLoading(true);
    setError('');
    try {
      const { data: emailCheck } = await api.post('/auth/check-email', { email: formData.email });
      if (emailCheck.exists) {
        setError('An account with this email already exists. Please sign in instead.');
        setLoading(false);
        return;
      }

      const roleFormatted = role ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase() : 'User';
      // Both pendingRole and inviteToken must be set BEFORE signUp in case onAuthStateChange
      // fires during the call. pendingRole acts as a fallback if JWT metadata is unavailable.
      localStorage.setItem('pendingRole', roleFormatted);
      if (inviteToken) localStorage.setItem('pendingInviteToken', inviteToken);
      // Add-account: flag it so that when the new account's session arrives (after the user
      // confirms their email) useSupabaseSync APPENDS it and keeps the current account.
      if (addMode) localStorage.setItem('pendingAddAccount', '1');

      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: roleFormatted,
            invite_token: inviteToken || null,
          },
        },
      });
      if (signUpError) {
        localStorage.removeItem('pendingRole');
        localStorage.removeItem('pendingInviteToken');
        localStorage.removeItem('pendingAddAccount');
        setError(signUpError.message || 'Registration failed');
        return;
      }
      // Store email so VerifyEmailPage can display it
      localStorage.setItem('pendingEmail', formData.email);

      // Navigate to email verification — user must confirm before syncing
      const params = new URLSearchParams({ role: roleFormatted });
      if (inviteToken) params.set('token', inviteToken);
      if (addMode) params.set('add', '1');
      navigate(`/verify-email?${params.toString()}`);
    } catch {
      setError('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // const roleIcon = isLocationManager
  //   ? <Storefront sx={{ color: 'white', fontSize: 36 }} />
  //   : isBusinessOwner
  //   ? <Handshake sx={{ color: 'white', fontSize: 36 }} />
  //   : <Person sx={{ color: 'white', fontSize: 36 }} />;

  const roleTitle = addMode ? 'Add Account' : isLocationManager ? 'Manager Onboarding' : isBusinessOwner ? 'Partner Program' : 'Join Winnbell';
  const roleSubtitle = addMode
    ? 'Create a new account to add to this device.'
    : isLocationManager
    ? 'Complete your profile to manage your branch.'
    : isBusinessOwner
    ? 'Register your brand to start issuing entries.'
    : 'Create an account to start winning.';

  // ─── Form content (shared between mobile & desktop) ──────────────────────────

  const FormContent = () => (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      {/* Approved mobile/tablet sizing keeps the zoom; large desktops (lg+) render at 1:1
          where the responsive lg/xl sizes take over (zoom 0.8 there made the whole form
          look tiny on big monitors). */}
      <Stack sx={{ zoom: { xs: 0.85, md: 0.8, lg: 1 } }}>
        {/* Header - desktop only; on mobile the gradient band above carries the title */}
        {isDesktop && (
          <motion.div variants={riseIn}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: { lg: '24px', xl: '30px' } }}>
              <Stack direction='row' alignItems='center' gap={2} mb='6px'>
                <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'white', border: `1px solid ${BORDER_LIGHT}`, flexShrink: 0 }}>
                  <ArrowBackIosNew fontSize='small' />
                </IconButton>
                <Typography sx={{ fontSize: { lg: '28px', xl: '32px' }, fontWeight: 800, letterSpacing: '-0.02em', color: TEXT_HEADING, textAlign: 'left' }}>
                  {roleTitle}
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: { lg: '14.5px', xl: '15px' }, fontWeight: 500, color: TEXT_TERTIARY, textAlign: 'left' }}>
                {roleSubtitle}
              </Typography>
            </Box>
          </motion.div>
        )}

        {regionBlocked && (
          <motion.div variants={popIn}>
            <Alert severity='error' sx={{ borderRadius: 2 }}>
              Winnbell is not available in your region yet. We're expanding soon!
            </Alert>
          </motion.div>
        )}

        {typeof (location.state as { message?: unknown } | null)?.message === 'string' && (
          <motion.div variants={popIn}>
            <Alert severity='warning' sx={{ mb: 2, borderRadius: 2 }}>{(location.state as { message: string }).message}</Alert>
          </motion.div>
        )}

        {error && (
          <motion.div variants={popIn}>
            <Alert severity='error' sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
          </motion.div>
        )}

        <Stack spacing={1.75}>
          <motion.div variants={popIn}>
            <Box>
              <Typography sx={authLabelSx}>Full Name</Typography>
              <TextField fullWidth name='fullName' value={formData.fullName} onChange={handleChange} placeholder='Enter your name'
                sx={authInputSx}
                InputProps={{
                  startAdornment: (<InputAdornment position='start'><Person sx={{ color: TEXT_TERTIARY, fontSize: 20 }} /></InputAdornment>),
                }}
              />
            </Box>
          </motion.div>

          <motion.div variants={popIn}>
            <Box>
              <Typography sx={authLabelSx}>Email</Typography>
              <TextField fullWidth name='email' value={formData.email} onChange={handleChange} placeholder='Enter your email'
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                error={!!emailError} helperText={emailError}
                sx={authInputSx}
                InputProps={{
                  startAdornment: (<InputAdornment position='start'><Mail sx={{ color: TEXT_TERTIARY, fontSize: 20 }} /></InputAdornment>),
                }}
              />
            </Box>
          </motion.div>

          <motion.div variants={popIn}>
            <Box>
              <Typography sx={authLabelSx}>Password</Typography>
              <TextField fullWidth name='password' value={formData.password} onChange={handleChange}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                error={!!passwordError} helperText={passwordError}
                type={showPassword ? 'text' : 'password'} placeholder='••••••••'
                sx={authInputSx}
                InputProps={{
                  startAdornment: (<InputAdornment position='start'><Lock sx={{ color: TEXT_TERTIARY, fontSize: 20 }} /></InputAdornment>),
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={() => setShowPassword(!showPassword)} size='small'>
                        {showPassword ? <VisibilityOff sx={{ fontSize: 20, color: TEXT_TERTIARY }} /> : <Visibility sx={{ fontSize: 20, color: TEXT_TERTIARY }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </motion.div>

          <motion.div variants={popIn}>
            <Stack spacing={1}>
              <FormControlLabel
                sx={{ alignItems: 'flex-start', py: 1, '& .MuiCheckbox-root': { pt: 0 } }}
                control={<Checkbox checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} size='small' />}
                label={
                  isBusinessOwner ? (
                    <Typography variant='caption' color='text.secondary' sx={{ lineHeight: 1.5 }}>
                      I certify that I am authorized to bind the Participating Business identified above. I have read and agree to the{' '}
                      <Typography component='span' variant='caption' onClick={(e) => { e.preventDefault(); navigate('/business-agreement'); }} sx={{ color: 'primary.main', fontWeight: 700, cursor: 'pointer' }}>
                        Winnbell Participating Business Agreement
                      </Typography>
                      , including the{' '}
                      <Typography component='span' variant='caption' onClick={(e) => { e.preventDefault(); navigate('/privacy'); }} sx={{ color: 'primary.main', fontWeight: 700, cursor: 'pointer' }}>
                        Privacy Policy
                      </Typography>
                      ,{' '}
                      <Typography component='span' variant='caption' onClick={(e) => { e.preventDefault(); navigate('/business-guidelines'); }} sx={{ color: 'primary.main', fontWeight: 700, cursor: 'pointer' }}>
                        Business Participation Guidelines
                      </Typography>
                      , Cancellation & Refund Policy, and any Campaign Terms incorporated therein. I understand that checking this box and clicking "Create Account" constitutes my electronic signature and binds the Participating Business to these terms.
                    </Typography>
                  ) : (
                    <Typography variant='caption' color='text.secondary'>
                      I agree to the{' '}
                      <Typography component='span' variant='caption' onClick={(e) => { e.preventDefault(); navigate('/terms'); }} sx={{ color: 'primary.main', fontWeight: 700, cursor: 'pointer' }}>
                        Terms of Service
                      </Typography>{' '}and{' '}
                      <Typography component='span' variant='caption' onClick={(e) => { e.preventDefault(); navigate('/privacy'); }} sx={{ color: 'primary.main', fontWeight: 700, cursor: 'pointer' }}>
                        Privacy Policy
                      </Typography>
                      , and I confirm that I am a legal U.S. resident.
                    </Typography>
                  )
                }
              />

            </Stack>
          </motion.div>

          <motion.div variants={popIn}>
            <AttractButton fullWidth variant='contained' size='large' onClick={handleSubmit} disabled={loading || googlePending} disableElevation
              endIcon={!loading && <ArrowForward sx={{ fontSize: 18 }} />}
              sx={authCtaSx}
            >
              {loading ? <CircularProgress size={24} color='inherit' /> : 'Create Account'}
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
                onClick={() => termsAccepted ? handleSocialSignUp('google') : setError('Please approve the terms first.')}
                disabled={googlePending || loading}
                sx={authGoogleBtnSx}>
                {googlePending ? 'Signing up...' : 'Continue with Google'}
              </Button>
            </Box>
          </motion.div>

          <Box sx={{ pt: 1, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '13.5px', fontWeight: 600, color: TEXT_TERTIARY }}>
              Already have an account?{' '}
              <Typography component='span' onClick={() => {
                let dest = '/login';
                if (isBusinessVariant && !inviteToken) dest = '/login/business';
                if (inviteToken) dest += `?token=${inviteToken}`;
                if (addMode) dest += `${dest.includes('?') ? '&' : '?'}add=1`;
                navigate(dest);
              }}
                sx={{ fontSize: '13.5px', color: 'primary.main', fontWeight: 800, cursor: 'pointer' }}>
                Sign In
              </Typography>
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </motion.div>
  );

  // ─── Redirect already-authenticated users ───────────────────────────────────

  // In add-account mode an authenticated user MUST stay to create the second account, so only
  // redirect away when NOT adding.
  if (syncLoaded && isAuth && !addMode) {
    const dest = isAdminUser ? '/admin' : (isBusinessUser || isManagerUser) ? '/campaign' : '/scan';
    return <Navigate to={dest} replace />;
  }

  // ─── Desktop layout ──────────────────────────────────────────────────────────

  if (isDesktop) {
    const desktopHeadline = isBusinessOwner
      ? <>Grow Your<br />Business</>
      : isLocationManager
      ? <>Manage Your<br />Branch</>
      : <>Cash Prizes.<br />Every Month.</>;

    const desktopTagline = isBusinessOwner
      ? 'Partner with Winnbell. Customers can submit receipts at your location to earn campaign entries - bringing them back month after month.'
      : isLocationManager
      ? 'Complete your onboarding to start managing your branch and issuing entries.'
      : 'Join thousands of members supporting local businesses and competing for real monthly prizes. No purchase necessary.';

    const desktopBullets = isBusinessOwner
      ? [
          { icon: <ConfirmationNumber sx={{ fontSize: 18 }} />, text: 'Customers can earn entries instantly' },
          { icon: <EmojiEvents sx={{ fontSize: 18 }} />, text: 'Run monthly campaigns effortlessly' },
          { icon: <Storefront sx={{ fontSize: 18 }} />, text: 'Grow foot traffic and customer loyalty' },
        ]
      : isLocationManager
      ? [
          { icon: <ConfirmationNumber sx={{ fontSize: 18 }} />, text: 'See your customer analytics' },
          { icon: <Storefront sx={{ fontSize: 18 }} />, text: 'Manage your branch operations' },
          { icon: <EmojiEvents sx={{ fontSize: 18 }} />, text: 'Track performance and engagement' },
        ]
      : [
          { icon: <Storefront sx={{ fontSize: 18 }} />, text: 'Earn entries at local businesses' },
          { icon: <EmojiEvents sx={{ fontSize: 18 }} />, text: 'Claim your weekly entry - no purchase needed' },
          { icon: <CardGiftcard sx={{ fontSize: 18 }} />, text: 'Compete for real cash prizes every month' },
        ];

    return (
      <Box sx={{ display: 'flex', height: 'var(--dvh100, 100dvh)', overflow: 'hidden' }}>
        <AuthBrandPanel headline={desktopHeadline} tagline={desktopTagline} bullets={desktopBullets} isBusinessVariant={isBusinessVariant} />

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
            {addMode ? 'Add Account' : isLocationManager ? 'Manager Onboarding' : isBusinessOwner ? 'Partner Program' : 'Join Winnbell'}
          </Typography>
          <Typography variant='body2' sx={{ opacity: 0.8, mt: 0.25 }}>
            {addMode
              ? 'Create a new account to add to this device.'
              : isLocationManager
              ? 'Complete your profile to manage your branch.'
              : isBusinessOwner
              ? 'Register your brand to start issuing entries.'
              : 'Create an account to start winning.'}
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

export default RegisterPage;

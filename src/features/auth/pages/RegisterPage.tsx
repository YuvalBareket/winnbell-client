import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, TextField, IconButton, InputAdornment, Container,
  Stack, Alert, CircularProgress, Divider, Checkbox, FormControlLabel,
  useMediaQuery, useTheme, Snackbar,
} from '@mui/material';
import {
  ArrowBackIosNew, Person, Mail, Lock, Visibility, VisibilityOff,
  Storefront, Google, ConfirmationNumber, EmojiEvents, CardGiftcard, Warning,
} from '@mui/icons-material';
import { useNavigate, useParams, useSearchParams, useLocation, Navigate } from 'react-router-dom';
import { api } from '../../../shared/api/client';
import { useSyncStatus } from '../../../shared/context/SyncStatusContext';
import { useAppSelector } from '../../../store/hook';
import { selectIsAuthenticated, selectIsAdmin, selectIsBusiness, selectIsLocationManager as selectIsLocMgr } from '../../../store/selectors/authSelectors';
import { supabase } from '../../../shared/lib/supabase';
import {
  BG_PAGE, TEXT_HEADING, ROLE_MANAGER_BG, ROLE_MANAGER_HOVER, BORDER_LIGHT,
  SHADOW_PRIMARY_SOFT, GRADIENT_HERO,
  ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_30, ALPHA_PRIMARY_20,
  GOOGLE_BLUE, SHADOW_GOOGLE, SHADOW_NEUTRAL_SOFT,
} from '../../../shared/colors';

// ─── Shared brand panel for desktop ─────────────────────────────────────────

const BrandPanel = ({ isBusinessOwner, isLocationManager }: { isBusinessOwner: boolean; isLocationManager: boolean }) => {
  const bullets = isBusinessOwner
    ? [
        { icon: <ConfirmationNumber sx={{ fontSize: 18 }} />, text: 'Issue entries to your customers instantly' },
        { icon: <EmojiEvents sx={{ fontSize: 18 }} />, text: 'Run monthly campaigns effortlessly' },
        { icon: <Storefront sx={{ fontSize: 18 }} />, text: 'Grow foot traffic and customer loyalty' },
      ]
    : isLocationManager
    ? [
        { icon: <ConfirmationNumber sx={{ fontSize: 18 }} />, text: 'Scan and validate customer entries' },
        { icon: <Storefront sx={{ fontSize: 18 }} />, text: 'Manage your branch operations' },
        { icon: <EmojiEvents sx={{ fontSize: 18 }} />, text: 'Track performance and engagement' },
      ]
    : [
        { icon: <Storefront sx={{ fontSize: 18 }} />, text: 'Earn entries at local partner businesses' },
        { icon: <EmojiEvents sx={{ fontSize: 18 }} />, text: 'Claim your free weekly entry - no purchase needed' },
        { icon: <CardGiftcard sx={{ fontSize: 18 }} />, text: 'Compete for real cash prizes every month' },
      ];

  const headline = isBusinessOwner
    ? 'Grow Your\nBusiness'
    : isLocationManager
    ? 'Manage Your\nBranch'
    : 'Real Prizes.\nEvery Month.';

  const tagline = isBusinessOwner
    ? 'Partner with Winnbell. Customers can submit receipts at your location to earn campaign entries - bringing them back month after month.'
    : isLocationManager
    ? 'Complete your onboarding to start managing your branch and issuing entries.'
    : 'Join thousands of members supporting local businesses and competing for real monthly prizes. No purchase necessary.';

  return (
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
      <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', bgcolor: ALPHA_PRIMARY_20, filter: 'blur(50px)' }} />

      {/* Logo */}
      <Stack direction='row' alignItems='center' spacing={1.5} mb={5}>
        <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: ALPHA_WHITE_20, border: `1px solid ${ALPHA_WHITE_30}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ConfirmationNumber sx={{ fontSize: 24 }} />
        </Box>
        <Typography variant='h5' fontWeight={900} letterSpacing={-0.5}>Winnbell</Typography>
      </Stack>

      {/* Headline */}
      <Typography variant='h3' fontWeight={900} lineHeight={1.15} mb={2} sx={{ whiteSpace: 'pre-line' }}>
        {headline}
      </Typography>
      <Typography variant='body1' sx={{ opacity: 0.8, mb: 5, lineHeight: 1.7, maxWidth: 340 }}>
        {tagline}
      </Typography>

      {/* Feature bullets */}
      <Stack spacing={2.5}>
        {bullets.map((item, i) => (
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
};

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

  const { isLoaded: syncLoaded } = useSyncStatus();
  const isAuth = useAppSelector(selectIsAuthenticated);
  const isAdminUser = useAppSelector(selectIsAdmin);
  const isBusinessUser = useAppSelector(selectIsBusiness);
  const isManagerUser = useAppSelector(selectIsLocMgr);

  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(searchParams.get('syncError') ?? '');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);
  const [regionBlocked, setRegionBlocked] = useState(false);
  const [toast, setToast] = useState('');

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
    const roleFormatted = role ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase() : 'User';
    localStorage.setItem('pendingRole', roleFormatted);
    if (inviteToken) localStorage.setItem('pendingInviteToken', inviteToken);
    // Add-account via OAuth: flag BEFORE the redirect so useSupabaseSync appends the new
    // account (keeps the current one) when the session returns on /sso-callback.
    if (addMode) localStorage.setItem('pendingAddAccount', '1');
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
      setError(oauthError.message || 'Social login failed');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.fullName) { setError('Please enter your full name.'); return; }
    if (!formData.email) { setError('Please enter your email address.'); return; }
    if (!formData.password) { setError('Please enter a password.'); return; }
    if (!ageVerified || !termsAccepted) { setError('Please confirm your eligibility and accept the terms.'); return; }
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
    <Stack sx={{ zoom: { xs: 0.85, md: 0.75 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isDesktop ? 'flex-start' : 'center', mb: 2 }}>
     
        <Stack direction='row' alignItems='center' gap={3} mb={1}>
          {isDesktop && (
            <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'white', border: `1px solid ${BORDER_LIGHT}`, flexShrink: 0 }}>
              <ArrowBackIosNew fontSize='small' />
            </IconButton>
          )}
          <Typography variant='h4' sx={{ fontWeight: 800, color: TEXT_HEADING, textAlign: isDesktop ? 'left' : 'center' }}>
            {roleTitle}
          </Typography>
        </Stack>
        <Typography variant='body2' color='text.secondary' sx={{ textAlign: isDesktop ? 'left' : 'center', px: isDesktop ? 0 : 2 }}>
          {roleSubtitle}
        </Typography>
      </Box>

      {regionBlocked && (
        <Alert severity='error' sx={{ borderRadius: 2 }}>
          Winnbell is not available in your region yet. We're expanding soon!
        </Alert>
      )}

      {location.state?.message && (
        <Alert severity='warning' sx={{ mb: 2, borderRadius: 2 }}>{location.state.message}</Alert>
      )}

      {error && <Alert severity='error' sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <Stack spacing={2}>
        <Box>
          <Typography variant='subtitle2' sx={{ ml: 1, mb: 0.5, fontWeight: 700 }}>Full Name</Typography>
          <TextField fullWidth name='fullName' value={formData.fullName} onChange={handleChange} placeholder='Enter your name'
            InputProps={{
              startAdornment: (<InputAdornment position='start'><Person sx={{ color: 'text.secondary' }} /></InputAdornment>),
              sx: { bgcolor: 'background.paper' },
            }}
          />
        </Box>

        <Box>
          <Typography variant='subtitle2' sx={{ ml: 1, mb: 0.5, fontWeight: 700 }}>Email</Typography>
          <TextField fullWidth name='email' value={formData.email} onChange={handleChange} placeholder='Enter your email'
            InputProps={{
              startAdornment: (<InputAdornment position='start'><Mail sx={{ color: 'text.secondary' }} /></InputAdornment>),
              sx: { bgcolor: 'background.paper' },
            }}
          />
        </Box>

        <Box>
          <Typography variant='subtitle2' sx={{ ml: 1, mb: 0.5, fontWeight: 700 }}>Password</Typography>
          <TextField fullWidth name='password' value={formData.password} onChange={handleChange}
            type={showPassword ? 'text' : 'password'} placeholder='••••••••'
            InputProps={{
              startAdornment: (<InputAdornment position='start'><Lock sx={{ color: 'text.secondary' }} /></InputAdornment>),
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton onClick={() => setShowPassword(!showPassword)} size='small'>
                    {showPassword ? <VisibilityOff fontSize='small' /> : <Visibility fontSize='small' />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: { bgcolor: 'background.paper' },
            }}
          />
        </Box>

        <Box>
          <Divider sx={{ mb: 2 }}>
            <Typography variant='caption' sx={{ color: 'text.disabled', fontWeight: 700 }}>OR</Typography>
          </Divider>
          <Button
            fullWidth
            variant='contained'
            startIcon={googleLoading ? <CircularProgress size={20} color='inherit' /> : <Google />}
            onClick={() => (termsAccepted && ageVerified) ? handleSocialSignUp('google') : setToast('Please approve the terms first')}
            disabled={googleLoading}
            sx={{
              py: 1.5,
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
            {googleLoading ? 'Signing up...' : 'Continue with Google'}
          </Button>
        </Box>

        <Stack spacing={1}>
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

          <FormControlLabel
            control={<Checkbox checked={ageVerified} onChange={(e) => setAgeVerified(e.target.checked)} size='small' />}
            label={<Typography variant='caption' color='text.secondary'>I confirm that I am 18 years of age or older and a legal U.S. resident.</Typography>}
          />

          <Box sx={{ pt: 0.5 }}>
            <Typography variant='caption' sx={{ lineHeight: 1.5, color: 'warning.main', display: 'block' }}>
              <Warning sx={{ fontSize: 14, verticalAlign: 'text-bottom', mr: 0.5 }} />
              <strong>Legal notice:</strong> Falsely declaring your age or residency is a criminal offence. If a prize winner is found to be under 18 or not a legal U.S. resident, their winnings will be immediately cancelled.
            </Typography>
          </Box>
        </Stack>

        <Button variant='contained' size='large' onClick={handleSubmit} disabled={loading || !termsAccepted || !ageVerified} disableElevation
          sx={{
            py: 1.5, fontSize: '1rem', fontWeight: 700,
            bgcolor: isLocationManager ? ROLE_MANAGER_BG : 'primary.main',
            boxShadow: SHADOW_PRIMARY_SOFT,
            '&:hover': { bgcolor: isLocationManager ? ROLE_MANAGER_HOVER : 'primary.dark' },
          }}
        >
          {loading ? <CircularProgress size={24} color='inherit' /> : 'Create Account'}
        </Button>

      </Stack>

      <Box sx={{ pt: 1, textAlign: 'center' }}>
        <Typography variant='body2' color='text.secondary' fontWeight={600}>
          Already have an account?{' '}
          <Typography component='span' onClick={() => navigate(addMode ? '/login?add=1' : inviteToken ? `/login/?token=${inviteToken}` : '/login')}
            sx={{ color: 'primary.main', fontWeight: 800, cursor: 'pointer' }}>
            Sign In
          </Typography>
        </Typography>
      </Box>
    </Stack>
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
    return (
      <Box sx={{ display: 'flex', height: '100dvh', overflow: 'hidden' }}>
        <BrandPanel isBusinessOwner={isBusinessOwner} isLocationManager={isLocationManager} />

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
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 420 }}>
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
      <Box sx={{ px: 1.5, pt: 1, pb: 0}}>
        <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'white', border: '1px solid #E2E8F0' }}>
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

export default RegisterPage;

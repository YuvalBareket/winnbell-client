import React, { useState } from 'react';
import {
  Box, Button, Typography, TextField, IconButton, InputAdornment,
  Paper, Container, Divider, Stack, Alert, CircularProgress,
  Checkbox, FormControlLabel, useMediaQuery, useTheme,
} from '@mui/material';
import {
  ArrowBackIosNew, ConfirmationNumber, Mail, Lock, Visibility, VisibilityOff,
  Login, Google, Apple, MarkEmailRead, Storefront, EmojiEvents, CardGiftcard,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSignIn } from '@clerk/clerk-react';
import {
  BG_PAGE, BORDER_LIGHT, NEUTRAL_SOCIAL_TEXT, SHADOW_PRIMARY_SOFT,
  GRADIENT_HERO, ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_30,
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
      Win More,<br />Every Day
    </Typography>
    <Typography variant='body1' sx={{ opacity: 0.8, mb: 5, lineHeight: 1.7, maxWidth: 340 }}>
      Join thousands of members earning tickets at local partner businesses and winning amazing weekly prizes.
    </Typography>

    {/* Feature bullets */}
    <Stack spacing={2.5}>
      {[
        { icon: <Storefront sx={{ fontSize: 18 }} />, text: 'Earn tickets at local partner shops' },
        { icon: <EmojiEvents sx={{ fontSize: 18 }} />, text: 'Enter weekly prize draws automatically' },
        { icon: <CardGiftcard sx={{ fontSize: 18 }} />, text: 'Win amazing prizes every week' },
      ].map((item, i) => (
        <Stack key={i} direction='row' alignItems='center' spacing={1.5}>
          <Box sx={{ width: 34, height: 34, borderRadius: 1.5, bgcolor: ALPHA_WHITE_15, border: `1px solid ${ALPHA_WHITE_20}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
  const { isLoaded, signIn, setActive } = useSignIn();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const inviteToken = searchParams.get('token');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [needs2FA, setNeeds2FA] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSocialLogin = async (provider: 'oauth_google' | 'oauth_apple') => {
    if (!isLoaded) return;
    if (inviteToken) sessionStorage.setItem('pendingInviteToken', inviteToken);
    try {
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/scan',
      });
    } catch (err: any) {
      sessionStorage.removeItem('pendingInviteToken');
      setError(err.errors[0]?.message || 'Social login failed');
    }
  };

  const handleSubmit = async () => {
    if (!isLoaded || !formData.email || !formData.password || !termsAccepted) return;
    setLoading(true);
    setError('');
    try {
      const result = await signIn.create({ identifier: formData.email, password: formData.password });
      if (result.status === 'complete') {
        if (inviteToken) sessionStorage.setItem('pendingInviteToken', inviteToken);
        await setActive({ session: result.createdSessionId });
        navigate('/scan');
      } else if (result.status === 'needs_second_factor') {
        await signIn.prepareSecondFactor({ strategy: 'email_code' });
        setNeeds2FA(true);
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!isLoaded || !mfaCode) return;
    setLoading(true);
    setError('');
    try {
      const result = await signIn.attemptSecondFactor({ strategy: 'email_code', code: mfaCode });
      if (result.status === 'complete') {
        if (inviteToken) sessionStorage.setItem('pendingInviteToken', inviteToken);
        await setActive({ session: result.createdSessionId });
        navigate('/scan');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  // ─── 2FA step ───────────────────────────────────────────────────────────────

  if (needs2FA) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', bgcolor: BG_PAGE }}>
        <Container maxWidth='xs'>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Paper elevation={4} sx={{ width: 80, height: 80, bgcolor: 'primary.main', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <MarkEmailRead sx={{ color: 'white', fontSize: 40 }} />
            </Paper>
            <Typography variant='h4' sx={{ fontWeight: 700, mb: 1 }}>Check your email</Typography>
            <Typography variant='body1' color='text.secondary' textAlign='center'>
              We sent a verification code to {formData.email}
            </Typography>
          </Box>
          {error && <Alert severity='error' sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}
          <Stack spacing={3}>
            <TextField
              fullWidth
              label='Verification code'
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              placeholder='Enter 6-digit code'
              inputProps={{ maxLength: 6 }}
              InputProps={{ sx: { '& input': { textAlign: 'center', fontSize: { xs: '1.5rem', md: '1.25rem' }, letterSpacing: '0.5em' } } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'background.paper' } }}
            />
            <Button variant='contained' size='large' onClick={handleVerify2FA} disabled={loading || mfaCode.length < 6} sx={{ py: 2, borderRadius: 3, fontWeight: 700 }}>
              {loading ? <CircularProgress size={24} color='inherit' /> : 'Verify & Sign In'}
            </Button>
            <Button variant='text' onClick={() => { setNeeds2FA(false); setMfaCode(''); setError(''); }}>Back</Button>
          </Stack>
        </Container>
      </Box>
    );
  }

  // ─── Form content (shared between mobile & desktop) ──────────────────────────

  const FormContent = () => (
    <Stack sx={{          zoom: { xs: 1, md: 0.8 },
}}>
      {/* Header */}
      <Box sx={{ mb: { xs: 6, md: 4 }, textAlign: isDesktop ? 'left' : 'center' }}>
        {!isDesktop && (
          <Paper elevation={4} sx={{ width: 80, height: 80, bgcolor: 'primary.main', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, transform: 'rotate(3deg)', mx: 'auto' }}>
            <ConfirmationNumber sx={{ color: 'white', fontSize: 40 }} />
          </Paper>
        )}
        <Typography variant='h4' sx={{ fontWeight: 700, mb: 1 }}>Welcome Back</Typography>
        <Typography variant='body1' color='text.secondary'>Sign in to check your tickets</Typography>
      </Box>

      {error && <Alert severity='error' sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

      <Stack spacing={3}>
        <Box>
          <Typography variant='subtitle2' sx={{ ml: 1, mb: 1, fontWeight: 700 }}>Email</Typography>
          <TextField fullWidth name='email' value={formData.email} onChange={handleChange} placeholder='Enter your email'
            InputProps={{
              startAdornment: (<InputAdornment position='start'><Mail sx={{ color: 'text.secondary' }} /></InputAdornment>),
              sx: { borderRadius: 3, bgcolor: 'background.paper' },
            }}
          />
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, ml: 1 }}>
            <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>Password</Typography>
            <Typography variant='caption' sx={{ fontWeight: 700, color: 'primary.main', cursor: 'pointer' }}>Forgot?</Typography>
          </Box>
          <TextField fullWidth name='password' value={formData.password} onChange={handleChange}
            type={showPassword ? 'text' : 'password'} placeholder='Enter your password'
            InputProps={{
              startAdornment: (<InputAdornment position='start'><Lock sx={{ color: 'text.secondary' }} /></InputAdornment>),
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge='end'>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: { borderRadius: 3, bgcolor: 'background.paper' },
            }}
          />
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
          sx={{ py: 2, borderRadius: 3, fontSize: '1rem', fontWeight: 700, boxShadow: SHADOW_PRIMARY_SOFT }}>
          {loading ? <CircularProgress size={24} color='inherit' /> : 'Sign In'}
        </Button>
      </Stack>

      <Box sx={{ mt: 4 }}>
        <Divider sx={{ mb: 4 }}>
          <Typography variant='caption' sx={{ color: 'text.disabled', fontWeight: 700, px: 1 }}>OR</Typography>
        </Divider>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button fullWidth variant='outlined' startIcon={<Google />} onClick={() => handleSocialLogin('oauth_google')} disabled={!termsAccepted}
            sx={{ py: 1.5, borderRadius: 3, borderColor: 'divider', color: 'text.primary', textTransform: 'none' }}>
            Google
          </Button>
          <Button fullWidth variant='outlined' startIcon={<Apple />} onClick={() => handleSocialLogin('oauth_apple')} disabled={!termsAccepted}
            sx={{ py: 1.5, borderRadius: 3, borderColor: 'divider', color: 'text.primary', textTransform: 'none' }}>
            Apple
          </Button>
        </Stack>
      </Box>

      <Box sx={{ mt: 'auto', pt: 4, textAlign: 'center' }}>
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

  // ─── Desktop layout ──────────────────────────────────────────────────────────

  if (isDesktop) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
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
            <FormContent />
          </Box>
        </Box>
      </Box>
    );
  }

  // ─── Mobile layout (original) ────────────────────────────────────────────────

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: BG_PAGE }}>
      <Box sx={{ p: 2 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'action.hover' }}>
          <ArrowBackIosNew fontSize='small' />
        </IconButton>
      </Box>
      <Container maxWidth='xs' sx={{ flex: 1, display: 'flex', flexDirection: 'column', pt: 4 }}>
        <FormContent />
      </Container>
    </Box>
  );
};

export default LoginPage;

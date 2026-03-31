import React, { useState } from 'react';
import {
  Box, Button, Typography, TextField, IconButton, InputAdornment, Paper, Container,
  Stack, Alert, CircularProgress, Divider, Checkbox, FormControlLabel,
  useMediaQuery, useTheme,
} from '@mui/material';
import {
  ArrowBackIosNew, Person, Mail, Lock, Visibility, VisibilityOff, Handshake,
  Storefront, Google, Apple, ConfirmationNumber, EmojiEvents, CardGiftcard, Warning,
} from '@mui/icons-material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useSignUp } from '@clerk/clerk-react';
import {
  BG_PAGE, TEXT_HEADING, ROLE_MANAGER_BG, ROLE_MANAGER_HOVER, BORDER_LIGHT,
  NEUTRAL_SOCIAL_TEXT, SHADOW_PRIMARY_SOFT, GRADIENT_HERO,
  ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_30,
} from '../../../shared/colors';

// ─── Shared brand panel for desktop ─────────────────────────────────────────

const BrandPanel = ({ isBusinessOwner, isLocationManager }: { isBusinessOwner: boolean; isLocationManager: boolean }) => {
  const bullets = isBusinessOwner
    ? [
        { icon: <ConfirmationNumber sx={{ fontSize: 18 }} />, text: 'Issue tickets to your customers instantly' },
        { icon: <EmojiEvents sx={{ fontSize: 18 }} />, text: 'Run monthly prize draws effortlessly' },
        { icon: <Storefront sx={{ fontSize: 18 }} />, text: 'Grow foot traffic and customer loyalty' },
      ]
    : isLocationManager
    ? [
        { icon: <ConfirmationNumber sx={{ fontSize: 18 }} />, text: 'Scan and validate customer tickets' },
        { icon: <Storefront sx={{ fontSize: 18 }} />, text: 'Manage your branch operations' },
        { icon: <EmojiEvents sx={{ fontSize: 18 }} />, text: 'Track performance and engagement' },
      ]
    : [
        { icon: <Storefront sx={{ fontSize: 18 }} />, text: 'Earn tickets at local partner shops' },
        { icon: <EmojiEvents sx={{ fontSize: 18 }} />, text: 'Enter monthly prize draws automatically' },
        { icon: <CardGiftcard sx={{ fontSize: 18 }} />, text: 'Win amazing prizes every month' },
      ];

  const headline = isBusinessOwner
    ? 'Grow Your\nBusiness'
    : isLocationManager
    ? 'Manage Your\nBranch'
    : 'Win More,\nEvery Day';

  const tagline = isBusinessOwner
    ? 'Partner with Winnbell and turn every purchase into a chance for your customers to win.'
    : isLocationManager
    ? 'Complete your onboarding to start managing your branch and issuing tickets.'
    : 'Join thousands of members earning tickets at local partner businesses and entering monthly prize draws.';

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
      <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', bgcolor: 'rgba(66,165,245,0.2)', filter: 'blur(50px)' }} />

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
            <Box sx={{ width: 34, height: 34, borderRadius: 1.5, bgcolor: ALPHA_WHITE_15, border: `1px solid ${ALPHA_WHITE_20}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
  const { isLoaded, signUp } = useSignUp();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const inviteToken = searchParams.get('token');
  const roleLower = role?.toLowerCase();
  const isBusinessOwner = roleLower === 'business' && !inviteToken;
  const isLocationManager = inviteToken !== null;

  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSocialSignUp = async (provider: 'oauth_google' | 'oauth_apple') => {
    if (!isLoaded) return;
    const roleFormatted = role ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase() : 'User';
    sessionStorage.setItem('pendingRole', roleFormatted);
    if (inviteToken) sessionStorage.setItem('pendingInviteToken', inviteToken);
    try {
      await signUp.authenticateWithRedirect({ strategy: provider, redirectUrl: '/sso-callback', redirectUrlComplete: '/' });
    } catch (err: any) {
      sessionStorage.removeItem('pendingRole');
      sessionStorage.removeItem('pendingInviteToken');
      setError(err.errors[0]?.message || 'Social login failed');
    }
  };

  const handleSubmit = async () => {
    if (!isLoaded || !formData.fullName || !formData.email || !formData.password || !termsAccepted || !ageVerified) return;
    setLoading(true);
    setError('');
    try {
      await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
        firstName: formData.fullName.split(' ')[0],
        lastName: formData.fullName.split(' ').slice(1).join(' '),
        unsafeMetadata: {
          role: role ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase() : 'User',
          inviteToken: inviteToken || null,
        },
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      const roleFormatted = role ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase() : 'User';
      const params = new URLSearchParams({ role: roleFormatted });
      if (inviteToken) params.set('token', inviteToken);
      navigate(`/verify-email?${params.toString()}`);
    } catch (err: any) {
      setError(err.errors[0]?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const roleIcon = isLocationManager
    ? <Storefront sx={{ color: 'white', fontSize: 36 }} />
    : isBusinessOwner
    ? <Handshake sx={{ color: 'white', fontSize: 36 }} />
    : <Person sx={{ color: 'white', fontSize: 36 }} />;

  const roleTitle = isLocationManager ? 'Manager Onboarding' : isBusinessOwner ? 'Partner Program' : 'Join Winnbell';
  const roleSubtitle = isLocationManager
    ? 'Complete your profile to manage your branch.'
    : isBusinessOwner
    ? 'Register your brand to start issuing tickets.'
    : 'Create an account to start winning.';

  // ─── Form content (shared between mobile & desktop) ──────────────────────────

  const FormContent = () => (
    <Stack sx={{          zoom: { xs: 0.9, md: 0.75 },
}}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isDesktop ? 'flex-start' : 'center', mb: 2 }}>
        {!isDesktop && (
          <Paper elevation={0} sx={{
            width: 72, height: 72,
            bgcolor: isLocationManager ? ROLE_MANAGER_BG : isBusinessOwner ? 'primary.main' : 'secondary.main',
            borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2,
            border: '1px solid rgba(0,0,0,0.1)',
          }}>
            {roleIcon}
          </Paper>
        )}
        <Typography variant='h4' sx={{ fontWeight: 800, mb: 1, color: TEXT_HEADING, textAlign: isDesktop ? 'left' : 'center' }}>
          {roleTitle}
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ textAlign: isDesktop ? 'left' : 'center', px: isDesktop ? 0 : 2 }}>
          {roleSubtitle}
        </Typography>
      </Box>

      {error && <Alert severity='error' sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

      <Stack spacing={1.5}>
        <Box>
          <Typography variant='subtitle2' sx={{ ml: 1, mb: 0.5, fontWeight: 700 }}>Full Name</Typography>
          <TextField fullWidth name='fullName' value={formData.fullName} onChange={handleChange} placeholder='Enter your name'
            InputProps={{
              startAdornment: (<InputAdornment position='start'><Person sx={{ color: 'text.secondary' }} /></InputAdornment>),
              sx: { borderRadius: 3, bgcolor: 'background.paper' },
            }}
          />
        </Box>

        <Box>
          <Typography variant='subtitle2' sx={{ ml: 1, mb: 0.5, fontWeight: 700 }}>Email</Typography>
          <TextField fullWidth name='email' value={formData.email} onChange={handleChange} placeholder='Enter your email'
            InputProps={{
              startAdornment: (<InputAdornment position='start'><Mail sx={{ color: 'text.secondary' }} /></InputAdornment>),
              sx: { borderRadius: 3, bgcolor: 'background.paper' },
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
              sx: { borderRadius: 3, bgcolor: 'background.paper' },
            }}
          />
        </Box>

        <Stack spacing={0.5}>
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
            label={<Typography variant='caption' color='text.secondary'>I confirm that I am 18 years of age or older.</Typography>}
          />

          <Box sx={{ bgcolor: 'rgba(237,108,2,0.07)', border: '1px solid', borderColor: 'warning.light', borderRadius: 2, p: 1 }}>
          <Stack direction='row' spacing={1} alignItems='flex-start'>
            <Warning sx={{ fontSize: 14, color: 'warning.main', flexShrink: 0, mt: 0.25 }} />
            <Typography variant='caption' sx={{ lineHeight: 1.6, color: 'text.secondary' }}>
              <strong>Legal notice:</strong> Falsely declaring your age is a criminal offence. If a prize winner is found to be under 18, their winnings will be immediately cancelled.
            </Typography>
          </Stack>
        </Box>
        </Stack>

        <Button variant='contained' size='large' onClick={handleSubmit} disabled={loading || !termsAccepted || !ageVerified} disableElevation
          sx={{
            py: 1.5, borderRadius: 3, fontSize: '1rem', fontWeight: 700,
            bgcolor: isLocationManager ? ROLE_MANAGER_BG : 'primary.main',
            boxShadow: SHADOW_PRIMARY_SOFT,
            '&:hover': { bgcolor: isLocationManager ? ROLE_MANAGER_HOVER : 'primary.dark' },
          }}
        >
          {loading ? <CircularProgress size={24} color='inherit' /> : 'Create Account'}
        </Button>

        <Divider sx={{ my: 0.5 }}>
          <Typography variant='caption' sx={{ color: 'text.disabled', fontWeight: 700 }}>OR</Typography>
        </Divider>

        <Stack direction={'row'} spacing={2}>
          <Button fullWidth variant='outlined' onClick={() => handleSocialSignUp('oauth_google')} startIcon={<Google />} disabled={!termsAccepted || !ageVerified}
            sx={{ borderRadius: 2, py: 1.2, fontWeight: 700, textTransform: 'none', borderColor: BORDER_LIGHT, color: NEUTRAL_SOCIAL_TEXT }}>
            Google
          </Button>
          <Button fullWidth variant='outlined' onClick={() => handleSocialSignUp('oauth_apple')} startIcon={<Apple />} disabled={!termsAccepted || !ageVerified}
            sx={{ borderRadius: 2, py: 1.2, fontWeight: 700, textTransform: 'none', borderColor: BORDER_LIGHT, color: NEUTRAL_SOCIAL_TEXT }}>
            Apple
          </Button>
        </Stack>
      </Stack>

      <Box sx={{ pt: 2, textAlign: 'center' }}>
        <Typography variant='body2' color='text.secondary' fontWeight={600}>
          Already have an account?{' '}
          <Typography component='span' onClick={() => navigate(inviteToken ? `/login/?token=${inviteToken}` : '/login')}
            sx={{ color: 'primary.main', fontWeight: 800, cursor: 'pointer' }}>
            Sign In
          </Typography>
        </Typography>
      </Box>
    </Stack>
  );

  // ─── Desktop layout ──────────────────────────────────────────────────────────

  if (isDesktop) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
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
          <Box sx={{ mb: 3 }}>
            <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'white', border: `1px solid ${BORDER_LIGHT}` }}>
              <ArrowBackIosNew fontSize='small' />
            </IconButton>
          </Box>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 420 }}>
            <FormContent />
          </Box>
        </Box>
      </Box>
    );
  }

  // ─── Mobile layout (original) ────────────────────────────────────────────────

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: BG_PAGE }}>
      <Box sx={{ p: 1.5 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'white', border: '1px solid #E2E8F0' }}>
          <ArrowBackIosNew fontSize='small' />
        </IconButton>
      </Box>
      <Container maxWidth='xs' sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <FormContent />
      </Container>
    </Box>
  );
};

export default RegisterPage;

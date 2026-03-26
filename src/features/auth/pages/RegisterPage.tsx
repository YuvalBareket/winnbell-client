import React, { useState } from 'react';
import {
  Box, Button, Typography, TextField, IconButton, InputAdornment, Paper, Container, Stack, Alert, CircularProgress, Divider, Checkbox, FormControlLabel,
} from '@mui/material';
import {
  ArrowBackIosNew, Person, Mail, Lock, Visibility, VisibilityOff, Handshake, Storefront, VerifiedUser, Google, Apple
} from '@mui/icons-material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useSignUp } from "@clerk/clerk-react"; // Import Clerk Hook

const RegisterPage = () => {
  const navigate = useNavigate();
  const { role } = useParams();
  const [searchParams] = useSearchParams();
  const { isLoaded, signUp } = useSignUp(); // Initialize Clerk

  // Identify context
  const inviteToken = searchParams.get('token');
  const roleLower = role?.toLowerCase();
  const isBusinessOwner = roleLower === 'business' && !inviteToken;
  const isLocationManager = inviteToken !== null;

  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Social Login Handler
  const handleSocialSignUp = async (provider: 'oauth_google' | 'oauth_apple') => {
    if (!isLoaded) return;
    const roleFormatted = role ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase() : 'User';
    // Persist across the OAuth redirect so useClerkSync can pick them up
    sessionStorage.setItem('pendingRole', roleFormatted);
    if (inviteToken) sessionStorage.setItem('pendingInviteToken', inviteToken);
    try {
      await signUp.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      });
    } catch (err: any) {
      sessionStorage.removeItem('pendingRole');
      sessionStorage.removeItem('pendingInviteToken');
      setError(err.errors[0]?.message || 'Social login failed');
    }
  };

  const handleSubmit = async () => {
    if (!isLoaded || !formData.fullName || !formData.email || !formData.password || !termsAccepted) return;
    setLoading(true);
    setError("");

    try {
      await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
        firstName: formData.fullName.split(' ')[0],
        lastName: formData.fullName.split(' ').slice(1).join(' '),
        unsafeMetadata: {
          // Capitalize: "business" → "Business" to match DB roles
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
      setError(err.errors[0]?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAFC' }}>
      <Box sx={{ p: 2 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'white', border: '1px solid #E2E8F0' }}>
          <ArrowBackIosNew fontSize='small' />
        </IconButton>
      </Box>

      <Container maxWidth='xs' sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Paper elevation={0} sx={{
              width: 72, height: 72,
              bgcolor: isLocationManager ? '#0F172A' : isBusinessOwner ? 'primary.main' : 'secondary.main',
              borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2,
              border: '1px solid rgba(0,0,0,0.1)',
            }}>
            {isLocationManager ? <Storefront sx={{ color: 'white', fontSize: 36 }} /> : 
             isBusinessOwner ? <Handshake sx={{ color: 'white', fontSize: 36 }} /> : 
             <Person sx={{ color: 'white', fontSize: 36 }} />}
          </Paper>

          <Typography variant='h4' sx={{ fontWeight: 800, mb: 1, textAlign: 'center', color: '#1E293B' }}>
            {isLocationManager ? 'Manager Onboarding' : isBusinessOwner ? 'Partner Program' : 'Join Winnbell'}
          </Typography>

          <Typography variant='body2' color='text.secondary' sx={{ textAlign: 'center', px: 2 }}>
            {isLocationManager ? 'Complete your profile to manage your branch.' : 
             isBusinessOwner ? 'Register your brand to start issuing tickets.' : 
             'Create an account to start winning.'}
          </Typography>
        </Box>

        {error && <Alert severity='error' sx={{ mb: 3, borderRadius: 1 }}>{error}</Alert>}

        <Stack spacing={2.5}>
          {/* Form Fields - Kept your exact style */}
          <Box>
            <Typography variant='caption' sx={{ ml: 0.5, mb: 0.5, fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
              Full Name
            </Typography>
            <TextField fullWidth name='fullName' value={formData.fullName} onChange={handleChange} placeholder='Enter name'
              InputProps={{
                startAdornment: (<InputAdornment position='start'><Person sx={{ color: 'text.disabled', fontSize: 20 }} /></InputAdornment>),
                sx: { borderRadius: 1, bgcolor: 'white' },
              }}
            />
          </Box>

          <Box>
            <Typography variant='caption' sx={{ ml: 0.5, mb: 0.5, fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Email</Typography>
            <TextField fullWidth name='email' value={formData.email} onChange={handleChange} placeholder='name@winnbell.com'
              InputProps={{
                startAdornment: (<InputAdornment position='start'><Mail sx={{ color: 'text.disabled', fontSize: 20 }} /></InputAdornment>),
                sx: { borderRadius: 1, bgcolor: 'white' },
              }}
            />
          </Box>

          <Box>
            <Typography variant='caption' sx={{ ml: 0.5, mb: 0.5, fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Secure Password</Typography>
            <TextField fullWidth name='password' value={formData.password} onChange={handleChange} type={showPassword ? 'text' : 'password'} placeholder='••••••••'
              InputProps={{
                startAdornment: (<InputAdornment position='start'><Lock sx={{ color: 'text.disabled', fontSize: 20 }} /></InputAdornment>),
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton onClick={() => setShowPassword(!showPassword)} size='small'>
                      {showPassword ? <VisibilityOff fontSize='small' /> : <Visibility fontSize='small' />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { borderRadius: 1, bgcolor: 'white' },
              }}
            />
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                size='small'
              />
            }
            label={
              <Typography variant='caption' color='text.secondary'>
                I agree to the{' '}
                <Typography component='span' variant='caption'
                  onClick={(e) => { e.preventDefault(); navigate('/terms'); }}
                  sx={{ color: 'primary.main', fontWeight: 700, cursor: 'pointer' }}>
                  Terms of Service
                </Typography>{' '}
                and{' '}
                <Typography component='span' variant='caption'
                  onClick={(e) => { e.preventDefault(); navigate('/privacy'); }}
                  sx={{ color: 'primary.main', fontWeight: 700, cursor: 'pointer' }}>
                  Privacy Policy
                </Typography>
              </Typography>
            }
          />

          <Button variant='contained' size='large' onClick={handleSubmit} disabled={loading || !termsAccepted} disableElevation
            sx={{
              py: 1.8, borderRadius: 3, fontSize: '0.95rem', fontWeight: 800, mt: 1,
              bgcolor: isLocationManager ? '#0F172A' : 'primary.main',
              '&:hover': { bgcolor: isLocationManager ? '#1E293B' : 'primary.dark' },
            }}
          >
            {loading ? <CircularProgress size={24} color='inherit' /> : 'Create Account'}
          </Button>

          {/* NEW SECTION: OR + SOCIAL BUTTONS */}
          <Divider sx={{ my: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700 }}>OR</Typography>
          </Divider>

          <Stack direction="row" spacing={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleSocialSignUp("oauth_google")}
              startIcon={<Google />}
              disabled={!termsAccepted}
              sx={{ borderRadius: 2, py: 1.2, fontWeight: 700, textTransform: 'none', borderColor: '#E2E8F0', color: '#444' }}
            >
              Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleSocialSignUp("oauth_apple")}
              startIcon={<Apple />}
              disabled={!termsAccepted}
              sx={{ borderRadius: 2, py: 1.2, fontWeight: 700, textTransform: 'none', borderColor: '#E2E8F0', color: '#444' }}
            >
              Apple
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant='body2' color='text.secondary' fontWeight={600}>
            Already have an account?{' '}
            <Typography component='span' onClick={() => navigate(inviteToken ? `/login/?token=${inviteToken}` : '/login')}
              sx={{ color: 'primary.main', fontWeight: 800, cursor: 'pointer' }}>
              Sign In
            </Typography>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default RegisterPage;
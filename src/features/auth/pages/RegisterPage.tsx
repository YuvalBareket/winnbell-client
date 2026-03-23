import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  Paper,
  Container,
  Stack,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  ArrowBackIosNew,
  Person,
  Mail,
  Lock,
  Visibility,
  VisibilityOff,
  Handshake,
  Storefront,
  VerifiedUser,
} from '@mui/icons-material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useRegister } from '../hooks/useRegister';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { role } = useParams();
  const [searchParams] = useSearchParams();

  // 1. Identify context
  const inviteToken = searchParams.get('token');
  const roleLower = role?.toLowerCase();
  const isBusinessOwner = roleLower === 'business' && !inviteToken;
  const isLocationManager = inviteToken !== null;

  const { mutate: register, isPending, isError, error } = useRegister();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!formData.fullName || !formData.email || !formData.password) return;

    register({
      ...formData,
      // If they have a token, they are a 'Business' role but specifically a Manager
      role: isBusinessOwner || isLocationManager ? 'Business' : 'User',
      inviteToken: inviteToken || undefined, // Pass the token to the backend
    });
  };

  const errorMessage =
    (error as any)?.response?.data?.message || 'Something went wrong.';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#F8FAFC',
      }}
    >
      <Box sx={{ p: 2 }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ bgcolor: 'white', border: '1px solid #E2E8F0' }}
        >
          <ArrowBackIosNew fontSize='small' />
        </IconButton>
      </Box>

      <Container
        maxWidth='xs'
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4,
          }}
        >
          {/* DYNAMIC ICON BOX */}
          <Paper
            elevation={0}
            sx={{
              width: 72,
              height: 72,
              bgcolor: isLocationManager
                ? '#0F172A'
                : isBusinessOwner
                  ? 'primary.main'
                  : 'secondary.main',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              border: '1px solid rgba(0,0,0,0.1)',
            }}
          >
            {isLocationManager ? (
              <Storefront sx={{ color: 'white', fontSize: 36 }} />
            ) : isBusinessOwner ? (
              <Handshake sx={{ color: 'white', fontSize: 36 }} />
            ) : (
              <Person sx={{ color: 'white', fontSize: 36 }} />
            )}
          </Paper>

          <Typography
            variant='h4'
            sx={{
              fontWeight: 800,
              mb: 1,
              textAlign: 'center',
              color: '#1E293B',
            }}
          >
            {isLocationManager
              ? 'Manager Onboarding'
              : isBusinessOwner
                ? 'Partner Program'
                : 'Join Winnbell'}
          </Typography>

          <Typography
            variant='body2'
            color='text.secondary'
            sx={{ textAlign: 'center', px: 2 }}
          >
            {isLocationManager
              ? 'You have been invited to manage a Winnbell branch. Complete your profile to begin.'
              : isBusinessOwner
                ? 'Register your brand to start issuing tickets across your locations.'
                : 'Create an account to start activating tickets and winning.'}
          </Typography>
        </Box>

        {isLocationManager && (
          <Alert
            icon={<VerifiedUser fontSize='small' />}
            severity='info'
            sx={{
              mb: 3,
              borderRadius: 1,
              border: '1px solid #BEE3F8',
              bgcolor: '#EBF8FF',
              color: '#2C5282',
            }}
          >
            Invitation Securely Verified
          </Alert>
        )}

        {isError && (
          <Alert severity='error' sx={{ mb: 3, borderRadius: 1 }}>
            {errorMessage}
          </Alert>
        )}

        <Stack spacing={2.5}>
          <Box>
            <Typography
              variant='caption'
              sx={{
                ml: 0.5,
                mb: 0.5,
                fontWeight: 800,
                color: 'text.secondary',
                textTransform: 'uppercase',
              }}
            >
              {isLocationManager
                ? 'Full Name'
                : isBusinessOwner
                  ? 'Business Name'
                  : 'Full Name'}
            </Typography>
            <TextField
              fullWidth
              name='fullName'
              value={formData.fullName}
              onChange={handleChange}
              placeholder='Enter name'
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Person sx={{ color: 'text.disabled', fontSize: 20 }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 1, bgcolor: 'white' },
              }}
            />
          </Box>

          <Box>
            <Typography
              variant='caption'
              sx={{
                ml: 0.5,
                mb: 0.5,
                fontWeight: 800,
                color: 'text.secondary',
                textTransform: 'uppercase',
              }}
            >
              Email
            </Typography>
            <TextField
              fullWidth
              name='email'
              value={formData.email}
              onChange={handleChange}
              placeholder='name@winnbell.com'
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Mail sx={{ color: 'text.disabled', fontSize: 20 }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 1, bgcolor: 'white' },
              }}
            />
          </Box>

          <Box>
            <Typography
              variant='caption'
              sx={{
                ml: 0.5,
                mb: 0.5,
                fontWeight: 800,
                color: 'text.secondary',
                textTransform: 'uppercase',
              }}
            >
              Secure Password
            </Typography>
            <TextField
              fullWidth
              name='password'
              value={formData.password}
              onChange={handleChange}
              type={showPassword ? 'text' : 'password'}
              placeholder='••••••••'
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Lock sx={{ color: 'text.disabled', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      size='small'
                    >
                      {showPassword ? (
                        <VisibilityOff fontSize='small' />
                      ) : (
                        <Visibility fontSize='small' />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { borderRadius: 1, bgcolor: 'white' },
              }}
            />
          </Box>

          <Button
            variant='contained'
            size='large'
            onClick={handleSubmit}
            disabled={isPending}
            disableElevation
            sx={{
              py: 1.8,
              borderRadius: 3,
              fontSize: '0.95rem',
              fontWeight: 800,
              mt: 1,
              bgcolor: isLocationManager ? '#0F172A' : 'primary.main',
              '&:hover': {
                bgcolor: isLocationManager ? '#1E293B' : 'primary.dark',
              },
            }}
          >
            {isPending ? (
              <CircularProgress size={24} color='inherit' />
            ) : isLocationManager ? (
              'Accept & Join Branch'
            ) : isBusinessOwner ? (
              'Start Partnership'
            ) : (
              'Create Account'
            )}
          </Button>
        </Stack>

        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant='body2' color='text.secondary' fontWeight={600}>
            Already have an account?{' '}
            <Typography
              component='span'
              onClick={() =>{ 
                if(inviteToken){
                  navigate(`/login/?token=${inviteToken}`)
                  return
                }
                navigate('/login')}}
              sx={{ color: 'primary.main', fontWeight: 800, cursor: 'pointer' }}
            >
              Sign In
            </Typography>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default RegisterPage;

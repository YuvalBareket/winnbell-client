import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  Paper,
  Container,
  Divider,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBackIosNew,
  ConfirmationNumber,
  Mail,
  Lock,
  Visibility,
  VisibilityOff,
  Login,
  Google,
  Apple,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin'; // <--- Import Hook

const LoginPage = () => {
  const navigate = useNavigate();
  const { mutate: login, isPending, isError, error } = useLogin(); // <--- Use Hook

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!formData.email || !formData.password) return;
    login(formData);
  };

  const errorMessage =
    (error as any)?.response?.data?.message || 'Invalid email or password';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ bgcolor: 'action.hover' }}
        >
          <ArrowBackIosNew fontSize='small' />
        </IconButton>
      </Box>

      <Container
        maxWidth='xs'
        sx={{ flex: 1, display: 'flex', flexDirection: 'column', pt: 4 }}
      >
        {/* Logo */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 6,
          }}
        >
          <Paper
            elevation={4}
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'primary.main',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              transform: 'rotate(3deg)',
            }}
          >
            <ConfirmationNumber sx={{ color: 'white', fontSize: 40 }} />
          </Paper>
          <Typography variant='h4' sx={{ fontWeight: 700, mb: 1 }}>
            Welcome Back
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Sign in to check your tickets
          </Typography>
        </Box>

        {/* Error Alert */}
        {isError && (
          <Alert severity='error' sx={{ mb: 3, borderRadius: 3 }}>
            {errorMessage}
          </Alert>
        )}

        {/* Form */}
        <Stack spacing={3}>
          <Box>
            <Typography
              variant='subtitle2'
              sx={{ ml: 1, mb: 1, fontWeight: 700 }}
            >
              Email
            </Typography>
            <TextField
              fullWidth
              name='email'
              value={formData.email}
              onChange={handleChange}
              placeholder='Enter your email'
              variant='outlined'
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Mail sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 3, bgcolor: 'background.paper' },
              }}
            />
          </Box>

          <Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 1,
                ml: 1,
              }}
            >
              <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                Password
              </Typography>
              <Typography
                variant='caption'
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  cursor: 'pointer',
                }}
              >
                Forgot?
              </Typography>
            </Box>
            <TextField
              fullWidth
              name='password'
              value={formData.password}
              onChange={handleChange}
              placeholder='Enter your password'
              type={showPassword ? 'text' : 'password'}
              variant='outlined'
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Lock sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge='end'
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { borderRadius: 3, bgcolor: 'background.paper' },
              }}
            />
          </Box>

          <Button
            variant='contained'
            size='large'
            onClick={handleSubmit}
            disabled={isPending}
            endIcon={!isPending && <Login />}
            sx={{
              py: 2,
              borderRadius: 3,
              fontSize: '1rem',
              fontWeight: 700,
              boxShadow: '0 8px 16px rgba(25, 93, 230, 0.2)',
            }}
          >
            {isPending ? (
              <CircularProgress size={24} color='inherit' />
            ) : (
              'Sign In'
            )}
          </Button>
        </Stack>

        {/* Social Login */}
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ mb: 4 }}>
            <Typography
              variant='caption'
              sx={{ color: 'text.disabled', fontWeight: 700, px: 1 }}
            >
              OR
            </Typography>
          </Divider>
          <Stack direction='row' spacing={2}>
            <Button
              fullWidth
              variant='outlined'
              sx={{
                py: 1.5,
                borderRadius: 3,
                borderColor: 'divider',
                color: 'text.primary',
              }}
            >
              <Google />
            </Button>
            <Button
              fullWidth
              variant='outlined'
              sx={{
                py: 1.5,
                borderRadius: 3,
                borderColor: 'divider',
                color: 'text.primary',
              }}
            >
              <Apple />
            </Button>
          </Stack>
        </Box>

        {/* Footer */}
        <Box sx={{ mt: 'auto', py: 4, textAlign: 'center' }}>
          <Typography variant='body2' color='text.secondary' fontWeight={500}>
            Don't have an account?{' '}
            <Typography
              component='span'
              onClick={() => navigate('/register')}
              sx={{ color: 'primary.main', fontWeight: 700, cursor: 'pointer' }}
            >
              Create new account
            </Typography>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;

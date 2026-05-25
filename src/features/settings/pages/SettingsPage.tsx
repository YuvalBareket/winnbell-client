import { useState } from 'react';
import {
  Box, Container, Typography, Stack, Paper, TextField,
  Button, Alert, InputAdornment, IconButton, useMediaQuery, useTheme,
} from '@mui/material';
import { SettingsOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { api } from '../../../shared/api/client';
import {
  BG_PAGE, GRADIENT_HERO, ALPHA_WHITE_15, ALPHA_WHITE_30,
  BORDER_LIGHT, SHADOW_CARD, PRIMARY_MAIN, MOBILE_CONTENT_HEIGHT,
} from '../../../shared/colors';

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

const SettingsPage = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  // Social-only accounts have no password set (provider will be 'google', 'apple', etc.)
  // We detect this from the server response via the change-password endpoint returning SSO_ACCOUNT
  const isSocialOnly = false; // resolved lazily via server error on submit

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { mutate, isPending, error, isSuccess } = useMutation<
    void,
    AxiosError<{ message: string }>,
    ChangePasswordPayload
  >({
    mutationFn: async (payload) => {
      await api.post('/auth/change-password', payload);
    },
    onSuccess: () => {
      setSuccessMessage('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setValidationError('');
    },
    onError: () => {
      setSuccessMessage('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setSuccessMessage('');

    if (newPassword.length < 8) {
      setValidationError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError('New password and confirmation do not match.');
      return;
    }

    mutate({ currentPassword, newPassword });
  };

  const serverMessage = error?.response?.data?.message ?? '';
  const isSocialLoginError = serverMessage === 'Password cannot be changed for social login accounts';

  return (
    <Box sx={{ bgcolor: BG_PAGE, minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: '100dvh' }, pb: 6 }}>
      {/* Hero */}
      <Box
        sx={{
          background: GRADIENT_HERO,
          pt: 3,
          pb: isDesktop ? 9 : 6,
          px: 3,
          color: 'white',
          borderRadius: '0 0 32px 32px',
        }}
      >
        <Container maxWidth='lg'>
          <Stack direction='row' alignItems='center' spacing={2}>
            <Box
              sx={{
                width: 52, height: 52, borderRadius: 2,
                bgcolor: ALPHA_WHITE_15,
                border: `1px solid ${ALPHA_WHITE_30}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <SettingsOutlined sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant='h5' fontWeight={800}>
                Settings
              </Typography>
              <Typography variant='body2' sx={{ opacity: 0.75 }}>
                Manage your account
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth='sm' sx={{ mt: isDesktop ? -5 : -3 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${BORDER_LIGHT}`,
            boxShadow: SHADOW_CARD,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${BORDER_LIGHT}` }}>
            <Typography variant='subtitle1' fontWeight={700}>
              Change Password
            </Typography>
          </Box>

          <Box sx={{ px: 3, py: 3 }}>
            {isSocialOnly ? (
              <Alert severity='info'>
                Your account uses a social login provider. To change your password, manage it through that provider directly.
              </Alert>
            ) : (
              <Box component='form' onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                  <TextField
                    label='Current password'
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    fullWidth
                    size='small'
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            size='small'
                            onClick={() => setShowCurrent((v) => !v)}
                            edge='end'
                          >
                            {showCurrent ? <VisibilityOff fontSize='small' /> : <Visibility fontSize='small' />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    label='New password'
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    fullWidth
                    size='small'
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            size='small'
                            onClick={() => setShowNew((v) => !v)}
                            edge='end'
                          >
                            {showNew ? <VisibilityOff fontSize='small' /> : <Visibility fontSize='small' />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    label='Confirm new password'
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    fullWidth
                    size='small'
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            size='small'
                            onClick={() => setShowConfirm((v) => !v)}
                            edge='end'
                          >
                            {showConfirm ? <VisibilityOff fontSize='small' /> : <Visibility fontSize='small' />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {validationError && (
                    <Alert severity='error'>{validationError}</Alert>
                  )}

                  {isSuccess && successMessage && (
                    <Alert severity='success'>{successMessage}</Alert>
                  )}

                  {error && !isSocialLoginError && (
                    <Alert severity='error'>
                      {serverMessage || 'An error occurred. Please try again.'}
                    </Alert>
                  )}

                  {error && isSocialLoginError && (
                    <Alert severity='info'>
                      Password cannot be changed for social login accounts. Manage your password through your social provider.
                    </Alert>
                  )}

                  <Button
                    type='submit'
                    variant='contained'
                    disabled={isPending}
                    sx={{
                      bgcolor: PRIMARY_MAIN,
                      fontWeight: 700,
                      borderRadius: 2,
                      py: 1.2,
                      '&:hover': { bgcolor: PRIMARY_MAIN, filter: 'brightness(0.92)' },
                    }}
                  >
                    {isPending ? 'Updating...' : 'Update Password'}
                  </Button>
                </Stack>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default SettingsPage;

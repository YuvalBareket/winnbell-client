import { useState, useEffect } from 'react';
import AppHeader from '../../../shared/components/AppHeader';
import AppMenuDrawer from '../../../shared/components/AppMenuDrawer';
import {
  Box, Container, Typography, Stack, Paper, TextField,
  Button, Alert, InputAdornment, IconButton, useMediaQuery, useTheme,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  SettingsOutlined, Visibility, VisibilityOff, LockOutlined,
} from '@mui/icons-material';
import { useAppDispatch } from '../../../store/hook';
import { logout } from '../../../store/slices/authSlice';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { api } from '../../../shared/api/client';
import { supabase } from '../../../shared/lib/supabase';
import {
  GRADIENT_HERO, ALPHA_WHITE_15, ALPHA_WHITE_30,
  BORDER_LIGHT, SHADOW_CARD, SHADOW_CARD_HOVER, PRIMARY_MAIN, MOBILE_CONTENT_HEIGHT,
  TEXT_SECONDARY, TEXT_HEADING, ALPHA_PRIMARY_06,
} from '../../../shared/colors';

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

const SettingsPage = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const dispatch = useAppDispatch();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  // Detect social login upfront from Supabase session to avoid wasted form submission
  const [isSocialOnly, setIsSocialOnly] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const provider = data.session?.user?.app_metadata?.provider;
      if (provider && provider !== 'email') setIsSocialOnly(true);
    });
  }, []);

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
    <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: '100dvh' }, pb: 8, zoom: { xs: 0.9, md: 1 } }}>
      <AppMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Hero Section */}
      <Box
        sx={{
          background: GRADIENT_HERO,
          pt: { xs: 0, md: 3 },
          pb: isDesktop ? 9 : 6,
          color: 'white',
          borderRadius: '0 0 32px 32px',
        }}
      >
        <AppHeader onMenuOpen={() => setMenuOpen(true)} onGradient />
        <Container maxWidth='lg' sx={{ pt: { xs: 1, md: 0 }, px: 3 }}>
          <Stack direction='row' alignItems='center' spacing={2}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: 2,
                  bgcolor: ALPHA_WHITE_15,
                  border: `1px solid ${ALPHA_WHITE_30}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <SettingsOutlined sx={{ color: 'white', fontSize: 32 }} />
              </Box>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Box>
                <Typography variant='h5' fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>
                  Settings
                </Typography>
                <Typography variant='body2' sx={{ opacity: 0.85, mt: 0.25 }}>
                  Manage your account and preferences
                </Typography>
              </Box>
            </motion.div>
          </Stack>
        </Container>
      </Box>

      {/* Main Content Grid */}
      <Container maxWidth='lg' sx={{ mt: isDesktop ? -4 : -2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: isDesktop ? '280px 1fr' : '1fr',
            gap: isDesktop ? 4 : 2,
            alignItems: 'start',
          }}
        >
          {/* Left Sidebar - Desktop only */}
          {isDesktop && (
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: `1px solid ${BORDER_LIGHT}`,
                  boxShadow: SHADOW_CARD,
                  p: 3,
                  position: 'sticky',
                  top: 80,
                }}
              >
                <Stack spacing={2}>
                  <Box>
                    <Typography variant='subtitle2' fontWeight={700} color={TEXT_HEADING} sx={{ mb: 0.5 }}>
                      Account Settings
                    </Typography>
                    <Typography variant='caption' color={TEXT_SECONDARY}>
                      Update your security and preferences
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </motion.div>
          )}

          {/* Right Column - Settings Cards */}
          <Stack spacing={3}>
            {/* Password Section Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: `1px solid ${BORDER_LIGHT}`,
                  boxShadow: SHADOW_CARD,
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    boxShadow: SHADOW_CARD_HOVER,
                  },
                }}
              >
                {/* Section Header with Icon */}
                <Box
                  sx={{
                    px: 3,
                    py: 2.5,
                    borderBottom: `1px solid ${BORDER_LIGHT}`,
                    background: ALPHA_PRIMARY_06,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: PRIMARY_MAIN,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <LockOutlined sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant='subtitle1' fontWeight={700} color={TEXT_HEADING}>
                      Password
                    </Typography>
                    <Typography variant='caption' color={TEXT_SECONDARY}>
                      Keep your account secure
                    </Typography>
                  </Box>
                </Box>

                {/* Section Content */}
                <Box sx={{ px: 3, py: 3 }}>
                  {isSocialOnly ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert
                        severity='info'
                        sx={{
                          borderRadius: 2,
                          border: 'none',
                          bgcolor: 'rgba(25, 118, 210, 0.05)',
                          color: TEXT_HEADING,
                          '& .MuiAlert-icon': {
                            color: PRIMARY_MAIN,
                          },
                        }}
                      >
                        Your account uses a social login provider. To change your password, manage it through that provider directly.
                      </Alert>
                    </motion.div>
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
                          variant='outlined'
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position='end'>
                                <IconButton
                                  size='small'
                                  onClick={() => setShowCurrent((v) => !v)}
                                  edge='end'
                                >
                                  {showCurrent ? (
                                    <VisibilityOff fontSize='small' />
                                  ) : (
                                    <Visibility fontSize='small' />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              transition: 'all 0.2s',
                              '&:hover': {
                                '& fieldset': {
                                  borderColor: PRIMARY_MAIN,
                                },
                              },
                            },
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
                          variant='outlined'
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position='end'>
                                <IconButton
                                  size='small'
                                  onClick={() => setShowNew((v) => !v)}
                                  edge='end'
                                >
                                  {showNew ? (
                                    <VisibilityOff fontSize='small' />
                                  ) : (
                                    <Visibility fontSize='small' />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              transition: 'all 0.2s',
                              '&:hover': {
                                '& fieldset': {
                                  borderColor: PRIMARY_MAIN,
                                },
                              },
                            },
                          }}
                        />
                        <Typography variant='caption' color={TEXT_SECONDARY} sx={{ display: 'block', mt: 0.5 }}>
                          Min. 8 characters
                        </Typography>

                        <TextField
                          label='Confirm new password'
                          type={showConfirm ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          fullWidth
                          size='small'
                          variant='outlined'
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position='end'>
                                <IconButton
                                  size='small'
                                  onClick={() => setShowConfirm((v) => !v)}
                                  edge='end'
                                >
                                  {showConfirm ? (
                                    <VisibilityOff fontSize='small' />
                                  ) : (
                                    <Visibility fontSize='small' />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              transition: 'all 0.2s',
                              '&:hover': {
                                '& fieldset': {
                                  borderColor: PRIMARY_MAIN,
                                },
                              },
                            },
                          }}
                        />

                        {validationError && (
                          <Alert
                            severity='error'
                            sx={{
                              borderRadius: 2,
                              border: 'none',
                              bgcolor: 'rgba(211, 47, 47, 0.05)',
                              color: TEXT_HEADING,
                              '& .MuiAlert-icon': {
                                color: '#d32f2f',
                              },
                            }}
                          >
                            {validationError}
                          </Alert>
                        )}

                        {isSuccess && successMessage && (
                          <Alert
                            severity='success'
                            sx={{
                              borderRadius: 2,
                              border: 'none',
                              bgcolor: 'rgba(46, 125, 50, 0.05)',
                              color: TEXT_HEADING,
                              '& .MuiAlert-icon': {
                                color: '#2e7d32',
                              },
                            }}
                          >
                            {successMessage}
                          </Alert>
                        )}

                        {error && !isSocialLoginError && (
                          <Alert
                            severity='error'
                            sx={{
                              borderRadius: 2,
                              border: 'none',
                              bgcolor: 'rgba(211, 47, 47, 0.05)',
                              color: TEXT_HEADING,
                              '& .MuiAlert-icon': {
                                color: '#d32f2f',
                              },
                            }}
                          >
                            {serverMessage || 'An error occurred. Please try again.'}
                          </Alert>
                        )}

                        {error && isSocialLoginError && (
                          <Alert
                            severity='info'
                            sx={{
                              borderRadius: 2,
                              border: 'none',
                              bgcolor: 'rgba(25, 118, 210, 0.05)',
                              color: TEXT_HEADING,
                              '& .MuiAlert-icon': {
                                color: PRIMARY_MAIN,
                              },
                            }}
                          >
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
                            py: 1.2,
                            textTransform: 'none',
                            fontSize: '0.95rem',
                            transition: 'all 0.3s',
                            '&:hover': {
                              bgcolor: PRIMARY_MAIN,
                              filter: 'brightness(0.92)',
                              boxShadow: `0 4px 12px rgba(2, 146, 183, 0.2)`,
                            },
                            '&:disabled': {
                              bgcolor: PRIMARY_MAIN,
                              opacity: 0.6,
                            },
                          }}
                        >
                          {isPending ? 'Updating...' : 'Update Password'}
                        </Button>
                      </Stack>
                    </Box>
                  )}
                </Box>
              </Paper>
            </motion.div>

            {/* Danger Zone Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'rgba(211, 47, 47, 0.3)',
                  boxShadow: SHADOW_CARD,
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    boxShadow: SHADOW_CARD_HOVER,
                    borderColor: 'rgba(211, 47, 47, 0.5)',
                  },
                }}
              >
                {/* Danger Zone Header */}
                <Box
                  sx={{
                    px: 3,
                    py: 2.5,
                    borderBottom: '1px solid',
                    borderColor: 'rgba(211, 47, 47, 0.2)',
                    background: 'rgba(211, 47, 47, 0.02)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: 'rgba(211, 47, 47, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <SettingsOutlined sx={{ color: '#d32f2f', fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant='subtitle1' fontWeight={700} sx={{ color: '#d32f2f' }}>
                      Danger Zone
                    </Typography>
                    <Typography variant='caption' color={TEXT_SECONDARY}>
                      Irreversible action
                    </Typography>
                  </Box>
                </Box>

                {/* Danger Zone Content */}
                <Box sx={{ px: 3, py: 3 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent='space-between' spacing={2}>
                    <Box>
                      <Typography variant='body2' fontWeight={600} color={TEXT_HEADING}>
                        Delete Account
                      </Typography>
                      <Typography variant='caption' color={TEXT_SECONDARY} sx={{ display: 'block', mt: 0.5 }}>
                        Permanently removes your personal data. Your entries remain for draw integrity.
                      </Typography>
                    </Box>
                    <Button
                      variant='outlined'
                      sx={{
                        color: '#d32f2f',
                        borderColor: '#d32f2f',
                        fontWeight: 700,
                        textTransform: 'none',
                        flexShrink: 0,
                        transition: 'all 0.3s',
                        '&:hover': {
                          bgcolor: 'rgba(211, 47, 47, 0.05)',
                          borderColor: '#d32f2f',
                        },
                      }}
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      Delete Account
                    </Button>
                  </Stack>
                </Box>
              </Paper>
            </motion.div>
          </Stack>
        </Box>
      </Container>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: SHADOW_CARD,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: '1.25rem',
            color: TEXT_HEADING,
          }}
        >
          Delete your account?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: TEXT_SECONDARY, mt: 1 }}>
            Your profile and personal data will be permanently removed. Your existing entries will remain in any active draw under an anonymous name. This cannot be undone.
          </DialogContentText>
          {deleteError && (
            <Alert
              severity='error'
              sx={{
                mt: 2,
                borderRadius: 2,
                border: 'none',
                bgcolor: 'rgba(211, 47, 47, 0.05)',
                color: TEXT_HEADING,
                '& .MuiAlert-icon': {
                  color: '#d32f2f',
                },
              }}
            >
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant='outlined'
            sx={{
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            color='error'
            variant='contained'
            disabled={deleteLoading}
            sx={{
              fontWeight: 700,
              textTransform: 'none',
              transition: 'all 0.3s',
              '&:hover': {
                filter: 'brightness(0.92)',
              },
              '&:disabled': {
                opacity: 0.6,
              },
            }}
            onClick={async () => {
              setDeleteLoading(true);
              setDeleteError('');
              try {
                await api.delete('/auth/account');
                dispatch(logout());
                localStorage.removeItem('wasLoggedIn');
                await supabase.auth.signOut();
              } catch (err: unknown) {
                const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete account. Please try again.';
                setDeleteError(msg);
                setDeleteLoading(false);
              }
            }}
          >
            {deleteLoading ? 'Deleting...' : 'Yes, delete my account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;

import { useState } from 'react';
import AppHeader from '../../../shared/components/AppHeader';
import AppMenuDrawer from '../../../shared/components/AppMenuDrawer';
import {
  Box, Container, Typography, Stack, Paper,
  Button, Alert, useMediaQuery, useTheme,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import { motion } from 'framer-motion';
import { SettingsOutlined } from '@mui/icons-material';
import { useLogout } from '../../../shared/hooks/useLogout';
import { api } from '../../../shared/api/client';
import InviteFriendCard from '../../referral/components/InviteFriendCard';
import {
  GRADIENT_HERO, ALPHA_WHITE_15, ALPHA_WHITE_30,
  BORDER_LIGHT, SHADOW_CARD, SHADOW_CARD_HOVER, MOBILE_CONTENT_HEIGHT,
  TEXT_SECONDARY, TEXT_HEADING,
} from '../../../shared/colors';

const SettingsPage = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const handleLogout = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

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
            // minmax(0, 1fr) (not 1fr) so a wide child like the referral link can't blow the
            // track past the viewport — grid items default to min-width:auto otherwise.
            gridTemplateColumns: isDesktop ? '280px minmax(0, 1fr)' : 'minmax(0, 1fr)',
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
                      Manage your account
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </motion.div>
          )}

          {/* Right Column - Settings Cards */}
          <Stack spacing={3} sx={{ minWidth: 0 }}>
            {/* Invite a Friend Card */}
            <InviteFriendCard />

            {/* Danger Zone Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
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
                await handleLogout();
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

import { useState } from 'react';
import AppPageHero from '../../../shared/components/AppPageHero';
import {
  Box, Container, Typography, Stack, Paper,
  Button, Alert, useMediaQuery, useTheme,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  staggerContainer, popIn, riseIn, pressableCard,
} from '../../../shared/motion';
import { SettingsOutlined } from '@mui/icons-material';
import { useLogout } from '../../../shared/hooks/useLogout';
import { api } from '../../../shared/api/client';
import {
  BORDER_LIGHT, SHADOW_CARD, SHADOW_CARD_HOVER, MOBILE_CONTENT_HEIGHT,
  TEXT_SECONDARY, TEXT_HEADING,
} from '../../../shared/colors';

const SettingsPage = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const handleLogout = useLogout();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  return (
    <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: '100dvh' }, pb: 8, zoom: { xs: 0.9, md: 1 } }}>
      <AppPageHero
        title='Settings'
        subtitle='Manage your account and preferences'
      />

      {/* Main Content Grid */}
      <Container maxWidth='lg' sx={{ mt: { xs: 2, md: 1 } }}>
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
              variants={riseIn}
              initial='hidden'
              animate='visible'
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

          {/* Right Column - Settings Cards. minWidth 0 keeps the minmax(0,1fr) grid track's
              overflow protection intact (grid items default to min-width:auto). */}
          <motion.div
            variants={staggerContainer}
            initial='hidden'
            animate='visible'
            style={{ minWidth: 0 }}
          >
          <Stack spacing={3} sx={{ minWidth: 0 }}>
            {/* Danger Zone Card */}
            <motion.div variants={popIn}>
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
                    <motion.div {...pressableCard} style={{ flexShrink: 0 }}>
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
                    </motion.div>
                  </Stack>
                </Box>
              </Paper>
            </motion.div>
          </Stack>
          </motion.div>
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

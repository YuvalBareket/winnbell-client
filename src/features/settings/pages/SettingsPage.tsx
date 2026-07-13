import { useState } from 'react';
import AppPageHero from '../../../shared/components/AppPageHero';
import {
  Box, Container, Typography, Stack, Paper, Avatar, Chip,
  Button, Alert,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  staggerContainer, popIn, pressableCard,
} from '../../../shared/motion';
import { SettingsOutlined, LogoutOutlined } from '@mui/icons-material';
import { useAppSelector } from '../../../store/hook';
import { selectCurrentUser } from '../../../store/selectors/authSelectors';
import { useLogout } from '../../../shared/hooks/useLogout';
import { api } from '../../../shared/api/client';
import { getUserInitials, getRoleLabel } from '../../../shared/utils/string';
import {
  BORDER_LIGHT, SHADOW_CARD, SHADOW_CARD_HOVER, MOBILE_CONTENT_HEIGHT,
  TEXT_SECONDARY, TEXT_HEADING, TEXT_TERTIARY, GRADIENT_PRIMARY, ALPHA_BLACK_04,
  ERROR_MAIN, ERROR_BORDER_LIGHT, ERROR_BORDER_STRONG, ERROR_BG_SUBTLE, ERROR_BORDER, ERROR_HOVER_BG, ERROR_ICON_BG,
} from '../../../shared/colors';

const SettingsPage = () => {
  const user = useAppSelector(selectCurrentUser);
  const handleLogout = useLogout();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Derive role label and initials
  const roleLabel = getRoleLabel(user?.role === 'Admin', user?.role === 'Business', user?.role === 'Manager');
  const initials = getUserInitials(user?.fullName);

  // Format "Member since" date (e.g. "Member since July 2026")
  const memberSinceDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  return (
    <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: 'var(--dvh100, 100dvh)' }, pb: 8, zoom: { xs: 0.9, md: 1 } }}>
      <AppPageHero
        title='Settings'
        subtitle='Manage your account and preferences'
      />

      {/* Main Content - Single centered column */}
      <Container maxWidth='sm' sx={{ mt: { xs: 2, md: 1 } }}>
        <motion.div
          variants={staggerContainer}
          initial='hidden'
          animate='visible'
        >
          <Stack spacing={3}>
            {/* Account Card - FIRST */}
            <motion.div variants={popIn}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: `1px solid ${BORDER_LIGHT}`,
                  boxShadow: SHADOW_CARD,
                  p: { xs: 2.5, md: 3 },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    boxShadow: SHADOW_CARD_HOVER,
                  },
                }}
              >
                <Stack spacing={2.5}>
                  {/* Avatar + Name + Role */}
                  <Stack direction='row' alignItems='center' spacing={2} sx={{ pb: 1.5, borderBottom: `1px solid ${BORDER_LIGHT}` }}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        background: GRADIENT_PRIMARY,
                        color: 'white',
                        fontWeight: 800,
                        fontSize: 18,
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant='subtitle1' fontWeight={700} color={TEXT_HEADING}>
                        {user?.fullName || 'Account'}
                      </Typography>
                      <Chip
                        label={roleLabel}
                        size='small'
                        sx={{
                          mt: 0.75,
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          bgcolor: ALPHA_BLACK_04,
                          color: TEXT_HEADING,
                          border: `1px solid ${BORDER_LIGHT}`,
                        }}
                      />
                    </Box>
                  </Stack>

                  {/* Email */}
                  <Box>
                    <Typography variant='caption' fontWeight={700} color={TEXT_TERTIARY} sx={{ display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Email
                    </Typography>
                    <Typography variant='body2' color={TEXT_HEADING}>
                      {user?.email}
                    </Typography>
                  </Box>

                  {/* Member Since */}
                  {memberSinceDate && (
                    <Box>
                      <Typography variant='caption' fontWeight={700} color={TEXT_TERTIARY} sx={{ display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Member Since
                      </Typography>
                      <Typography variant='body2' color={TEXT_HEADING}>
                        {memberSinceDate}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Paper>
            </motion.div>

            {/* Session Card */}
            <motion.div variants={popIn}>
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
                <Box sx={{ px: 3, py: 2.5 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent='space-between' spacing={2}>
                    <Box>
                      <Typography variant='body2' fontWeight={600} color={TEXT_HEADING}>
                        Log Out
                      </Typography>
                      <Typography variant='caption' color={TEXT_SECONDARY} sx={{ display: 'block', mt: 0.5 }}>
                        Sign out from this device
                      </Typography>
                    </Box>
                    <motion.div {...pressableCard} style={{ flexShrink: 0 }}>
                      <Button
                        variant='outlined'
                        startIcon={<LogoutOutlined />}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          flexShrink: 0,
                          transition: 'all 0.3s',
                        }}
                        onClick={handleLogout}
                      >
                        Log Out
                      </Button>
                    </motion.div>
                  </Stack>
                </Box>
              </Paper>
            </motion.div>

            {/* Danger Zone Card - LAST */}
            <motion.div variants={popIn}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: `1px solid ${ERROR_BORDER_LIGHT}`,
                  boxShadow: SHADOW_CARD,
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    boxShadow: SHADOW_CARD_HOVER,
                    borderColor: ERROR_BORDER_STRONG,
                  },
                }}
              >
                {/* Danger Zone Header */}
                <Box
                  sx={{
                    px: 3,
                    py: 2.5,
                    borderBottom: `1px solid ${ERROR_BORDER}`,
                    background: ERROR_BG_SUBTLE,
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
                      bgcolor: ERROR_ICON_BG,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <SettingsOutlined sx={{ color: ERROR_MAIN, fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant='subtitle1' fontWeight={700} sx={{ color: ERROR_MAIN }}>
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
                          color: ERROR_MAIN,
                          borderColor: ERROR_MAIN,
                          fontWeight: 700,
                          textTransform: 'none',
                          flexShrink: 0,
                          transition: 'all 0.3s',
                          '&:hover': {
                            bgcolor: ERROR_HOVER_BG,
                            borderColor: ERROR_MAIN,
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
                bgcolor: ERROR_HOVER_BG,
                color: TEXT_HEADING,
                '& .MuiAlert-icon': {
                  color: ERROR_MAIN,
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

import { useState } from 'react';
import {
  Box, Typography, Stack, Paper, Avatar, Button, Alert, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, ListItem,
  useMediaQuery, useTheme, Snackbar,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  staggerContainer, popIn,
} from '../../../shared/motion';
import { ChevronRight, Lock, Person, DateRange, Wc, Logout, DeleteOutline } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../../store/hook';
import { selectCurrentUser } from '../../../store/selectors/authSelectors';
import { completeProfileSetup, updateProfileName } from '../../../store/slices/authSlice';
import { useLogout } from '../../../shared/hooks/useLogout';
import { api } from '../../../shared/api/client';
import { supabase } from '../../../shared/lib/supabase';
import { getUserInitials } from '../../../shared/utils/string';
import AppPageHero from '../../../shared/components/AppPageHero';
import ProfileEditDialog from '../components/ProfileEditDialog';
import {
  BORDER_LIGHT, BORDER_MUTED, BG_SUBTLE, BG_ROW_SUBTLE, BG_SURFACE, PRIMARY_TINT, PRIMARY_MAIN,
  SHADOW_CARD, SHADOW_CARD_HOVER, MOBILE_CONTENT_HEIGHT, SUCCESS_GREEN,
  TEXT_SECONDARY, TEXT_HEADING, TEXT_TERTIARY, GRADIENT_PRIMARY,
  ERROR_MAIN, ERROR_HOVER_BG, ERROR_BG_TINT, ERROR_BORDER_TINT,
} from '../../../shared/colors';

interface SettingsContentProps {
  setEditDialogOpen: (open: boolean) => void;
  resetLoading: boolean;
  resetSuccess: boolean;
  setResetSuccess: (success: boolean) => void;
  handlePasswordReset: () => void;
  setDeleteDialogOpen: (open: boolean) => void;
}

const SettingsContent = ({
  setEditDialogOpen,
  resetLoading,
  resetSuccess,
  setResetSuccess,
  handlePasswordReset,
  setDeleteDialogOpen,
}: SettingsContentProps) => {
  const user = useAppSelector(selectCurrentUser);
  const handleLogout = useLogout();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Derived data
  const initials = getUserInitials(user?.fullName);
  const joinedAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  // Show DOB/Gender only for consumers or when data is present
  const showProfileFields = user?.role === 'User' || user?.dateOfBirth != null || user?.gender != null;

  // Business OWNERS (role Business, no location_id) cannot self-delete - the server blocks it to
  // avoid orphaning business/subscription/campaign data. They must contact support. Location
  // managers (role Business WITH a location_id) and consumers CAN delete (they get anonymized).
  const isBusinessOwner = user?.role === 'Business' && !user?.location_id;

  // Format DOB for display
  const dobDisplay = user?.dateOfBirth
    ? new Date(user.dateOfBirth).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    : 'Not set';

  const genderDisplay = user?.gender || 'Not set';

  // ─── MOBILE LAYOUT ──────────────────────────────────────────────────────

  if (isMobile) {
    return (
      <Box sx={{ minHeight: MOBILE_CONTENT_HEIGHT, pb: 3, display: 'flex', flexDirection: 'column' }}>
        {/* Standard app header (Winnbell brand + notifications + menu drawer + title). */}
        <AppPageHero title='Settings' subtitle='Manage your account and preferences' />

        {/* Content */}
        <Box sx={{ flex: 1, px: 1.125, py: 2.25, overflow: 'auto' }}>
          <motion.div variants={staggerContainer} initial='hidden' animate='visible'>
            <Stack spacing={2.5}>
              {/* User identity card */}
              <motion.div variants={popIn}>
                <Paper
                  elevation={0}
                  sx={{
                    border: `1px solid ${BORDER_LIGHT}`,
                    boxShadow: SHADOW_CARD,
                    borderRadius: 2,
                    p: 2,
                    display: 'flex', alignItems: 'center', gap: 1.5,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 52, height: 52,
                      background: GRADIENT_PRIMARY,
                      color: 'white', fontWeight: 800, fontSize: 18, flexShrink: 0,
                    }}
                  >
                    {initials}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: '16px', fontWeight: 800, color: TEXT_HEADING, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.fullName || 'Account'}
                    </Typography>
                    {joinedAt && (
                      <Typography sx={{ fontSize: '12.5px', color: TEXT_TERTIARY }}>
                        Joined Winnbell at {joinedAt}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </motion.div>

              {/* PROFILE CARD */}
              <motion.div variants={popIn}>
                  <Paper
                    elevation={0}
                    sx={{
                      border: `1px solid ${BORDER_LIGHT}`,
                      boxShadow: SHADOW_CARD,
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    {/* Card header */}
                    <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${BORDER_LIGHT}`, bgcolor: BG_ROW_SUBTLE }}>
                      <Typography sx={{ fontSize: '11px', fontWeight: 800, letterSpacing: 0.08, textTransform: 'uppercase', color: TEXT_TERTIARY }}>
                        Profile
                      </Typography>
                    </Box>

                    {/* Full name row - tap to edit (shown for all roles) */}
                    <ListItem
                      component='button'
                      onClick={() => setEditDialogOpen(true)}
                      sx={{
                        px: 2, py: 2,
                        borderBottom: showProfileFields ? `1px solid ${BG_SUBTLE}` : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', border: 'none', bgcolor: 'transparent', cursor: 'pointer',
                        textAlign: 'left', '&:active': { bgcolor: BG_ROW_SUBTLE },
                      }}
                    >
                      <Stack direction='row' alignItems='center' spacing={1.5}>
                        <Person sx={{ fontSize: 18, color: TEXT_TERTIARY }} />
                        <Typography sx={{ fontSize: '14px', fontWeight: 700, color: TEXT_HEADING }}>
                          Full name
                        </Typography>
                      </Stack>
                      <Stack direction='row' alignItems='center' spacing={0.75}>
                        <Typography sx={{ fontSize: '13.5px', fontWeight: 600, color: TEXT_TERTIARY }}>
                          {user?.fullName}
                        </Typography>
                        <ChevronRight sx={{ fontSize: 16, color: BORDER_MUTED }} />
                      </Stack>
                    </ListItem>

                    {/* Date of birth + Gender - consumers/managers only */}
                    {showProfileFields && (
                    <>
                    <ListItem
                      component='button'
                      onClick={() => setEditDialogOpen(true)}
                      sx={{
                        px: 2, py: 2, borderBottom: `1px solid ${BG_SUBTLE}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                        textAlign: 'left', transition: 'bgcolor 0.15s',
                        '&:active': { bgcolor: BG_ROW_SUBTLE },
                      }}
                    >
                      <Stack direction='row' alignItems='center' spacing={1.5}>
                        <DateRange sx={{ fontSize: 18, color: TEXT_TERTIARY }} />
                        <Box>
                          <Typography sx={{ fontSize: '14px', fontWeight: 700, color: TEXT_HEADING }}>
                            Date of birth
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction='row' alignItems='center' spacing={0.75}>
                        <Typography sx={{ fontSize: '13.5px', fontWeight: 600, color: TEXT_TERTIARY }}>
                          {dobDisplay}
                        </Typography>
                        <ChevronRight sx={{ fontSize: 16, color: BORDER_MUTED }} />
                      </Stack>
                    </ListItem>

                    {/* Gender row */}
                    <ListItem
                      component='button'
                      onClick={() => setEditDialogOpen(true)}
                      sx={{
                        px: 2, py: 2,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                        textAlign: 'left', transition: 'bgcolor 0.15s',
                        '&:active': { bgcolor: BG_ROW_SUBTLE },
                      }}
                    >
                      <Stack direction='row' alignItems='center' spacing={1.5}>
                        <Wc sx={{ fontSize: 18, color: TEXT_TERTIARY }} />
                        <Box>
                          <Typography sx={{ fontSize: '14px', fontWeight: 700, color: TEXT_HEADING }}>
                            Gender
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction='row' alignItems='center' spacing={0.75}>
                        <Typography sx={{ fontSize: '13.5px', fontWeight: 600, color: TEXT_TERTIARY }}>
                          {genderDisplay}
                        </Typography>
                        <ChevronRight sx={{ fontSize: 16, color: BORDER_MUTED }} />
                      </Stack>
                    </ListItem>
                    </>
                    )}
                  </Paper>
                </motion.div>

              {/* SECURITY CARD */}
              <motion.div variants={popIn}>
                <Paper
                  elevation={0}
                  sx={{
                    border: `1px solid ${BORDER_LIGHT}`,
                    boxShadow: SHADOW_CARD,
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  {/* Card header */}
                  <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${BORDER_LIGHT}`, bgcolor: BG_ROW_SUBTLE }}>
                    <Typography sx={{ fontSize: '11px', fontWeight: 800, letterSpacing: 0.08, textTransform: 'uppercase', color: TEXT_TERTIARY }}>
                      Security
                    </Typography>
                  </Box>

                  {/* Change password row */}
                  <ListItem
                    component='button'
                    onClick={handlePasswordReset}
                    disabled={resetLoading}
                    sx={{
                      px: 2, py: 2,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'none', border: 'none', cursor: resetLoading ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit', textAlign: 'left', transition: 'bgcolor 0.15s',
                      opacity: resetLoading ? 0.6 : 1,
                      '&:active': { bgcolor: BG_ROW_SUBTLE },
                    }}
                  >
                    <Stack direction='row' alignItems='center' spacing={1.5}>
                      <Lock sx={{ fontSize: 18, color: TEXT_TERTIARY }} />
                      <Box>
                        <Typography sx={{ fontSize: '14px', fontWeight: 700, color: TEXT_HEADING }}>
                          Change password
                        </Typography>
                      </Box>
                    </Stack>
                    <ChevronRight sx={{ fontSize: 16, color: BORDER_MUTED }} />
                  </ListItem>
                </Paper>
              </motion.div>

              {/* Spacer */}
              <Box sx={{ flex: 1 }} />

              {/* ACTIONS - pinned to bottom */}
              <motion.div variants={popIn}>
                <Stack spacing={1.375}>
                  {/* Log out button */}
                  <Button
                    fullWidth
                    variant='outlined'
                    startIcon={<Logout sx={{ fontSize: 18 }} />}
                    onClick={handleLogout}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 800,
                      fontSize: '14.5px',
                      py: 1.875,
                      borderRadius: 1.75,
                      borderColor: BORDER_LIGHT,
                      color: TEXT_HEADING,
                      '&:hover': { bgcolor: BG_ROW_SUBTLE, borderColor: BORDER_LIGHT },
                    }}
                  >
                    Log out
                  </Button>

                  {/* Delete account - hidden for business owners (server blocks self-delete) */}
                  {isBusinessOwner ? (
                    <Typography sx={{ fontSize: '12.5px', color: TEXT_TERTIARY, textAlign: 'center', px: 2, lineHeight: 1.5 }}>
                      To close your business account, please contact support.
                    </Typography>
                  ) : (
                    <Button
                      fullWidth
                      variant='outlined'
                      startIcon={<DeleteOutline sx={{ fontSize: 18 }} />}
                      onClick={() => setDeleteDialogOpen(true)}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 800,
                        fontSize: '14.5px',
                        py: 1.875,
                        borderRadius: 1.75,
                        borderColor: ERROR_BORDER_TINT,
                        bgcolor: ERROR_BG_TINT,
                        color: ERROR_MAIN,
                        '&:hover': { bgcolor: ERROR_BG_TINT, borderColor: ERROR_BORDER_TINT },
                      }}
                    >
                      Delete account
                    </Button>
                  )}
                </Stack>
              </motion.div>
            </Stack>
          </motion.div>
        </Box>

        {/* Password reset success snackbar */}
        <Snackbar
          open={resetSuccess}
          autoHideDuration={4000}
          onClose={() => setResetSuccess(false)}
          message='Password reset link sent. Check your inbox.'
          sx={{
            '& .MuiSnackbarContent-root': {
              bgcolor: SUCCESS_GREEN,
              fontWeight: 600,
            },
          }}
        />
      </Box>
    );
  }

  // ─── DESKTOP LAYOUT ──────────────────────────────────────────────────────

  return (
    <Box sx={{ minHeight: 'var(--dvh100, 100dvh)', pb: 8 }}>
      {/* Simple header */}
      <Box sx={{ px: 3.25, pt: 1.75, pb: 0.5 }}>
        <Typography sx={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em', color: TEXT_HEADING }}>
          Settings
        </Typography>
        <Typography sx={{ fontSize: '13px', color: TEXT_TERTIARY, fontWeight: 500, mt: 0.25 }}>
          Manage your account details.
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ px: 3.25, py: 3, maxWidth: 1200, mx: 'auto' }}>
        <motion.div variants={staggerContainer} initial='hidden' animate='visible'>
          <Stack spacing={2.75}>
            {/* PROFILE CARD */}
            <motion.div variants={popIn}>
                <Paper
                  elevation={0}
                  sx={{
                    border: `1px solid ${BORDER_LIGHT}`,
                    boxShadow: SHADOW_CARD,
                    borderRadius: 2,
                    p: 3.25,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': { boxShadow: SHADOW_CARD_HOVER },
                  }}
                >
                  {/* Card header with avatar */}
                  <Stack direction='row' alignItems='flex-start' spacing={2} sx={{ mb: 2.5 }}>
                    <Avatar
                      sx={{
                        width: 58, height: 58,
                        background: GRADIENT_PRIMARY,
                        color: 'white',
                        fontWeight: 800,
                        fontSize: 20,
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontSize: '16px', fontWeight: 800, color: TEXT_HEADING }}>
                        Your profile
                      </Typography>
                      <Typography sx={{ fontSize: '12.5px', color: TEXT_TERTIARY, mt: 0.25 }}>
                        The details you gave us at sign-up.
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Fields grid */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.25 }}>
                    {/* Full name - spans both columns, tap to edit */}
                    <Box sx={{ gridColumn: '1 / -1' }}>
                      <Typography sx={{ fontSize: '12.5px', fontWeight: 700, color: TEXT_SECONDARY, mb: 1 }}>
                        Full name
                      </Typography>
                      <Box
                        component='button'
                        onClick={() => setEditDialogOpen(true)}
                        sx={{
                          width: '100%',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          bgcolor: BG_SURFACE, border: `1px solid ${BORDER_LIGHT}`,
                          borderRadius: 1.5, px: 1.875, py: 1.625,
                          cursor: 'pointer', background: 'none', fontFamily: 'inherit',
                          transition: 'all 0.15s',
                          '&:hover': { borderColor: 'primary.main' },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <Person sx={{ fontSize: 18, color: TEXT_TERTIARY }} />
                          <Typography sx={{ fontSize: '14.5px', fontWeight: 600, color: TEXT_HEADING }}>
                            {user?.fullName}
                          </Typography>
                        </Box>
                        <ChevronRight sx={{ fontSize: 16, color: TEXT_TERTIARY }} />
                      </Box>
                    </Box>

                    {/* Date of birth + Gender - consumers/managers only */}
                    {showProfileFields && (
                    <>
                    {/* Date of birth */}
                    <Box>
                      <Typography sx={{ fontSize: '12.5px', fontWeight: 700, color: TEXT_SECONDARY, mb: 1 }}>
                        Date of birth
                      </Typography>
                      <Box
                        component='button'
                        onClick={() => setEditDialogOpen(true)}
                        sx={{
                          width: '100%',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          bgcolor: BG_SURFACE, border: `1px solid ${BORDER_LIGHT}`,
                          borderRadius: 1.5, px: 1.875, py: 1.625,
                          cursor: 'pointer', background: 'none', fontFamily: 'inherit',
                          transition: 'all 0.15s',
                          '&:hover': { borderColor: 'primary.main' },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <DateRange sx={{ fontSize: 18, color: TEXT_TERTIARY }} />
                          <Typography sx={{ fontSize: '14.5px', fontWeight: 600, color: TEXT_HEADING }}>
                            {dobDisplay}
                          </Typography>
                        </Box>
                        <ChevronRight sx={{ fontSize: 16, color: TEXT_TERTIARY }} />
                      </Box>
                    </Box>

                    {/* Gender */}
                    <Box>
                      <Typography sx={{ fontSize: '12.5px', fontWeight: 700, color: TEXT_SECONDARY, mb: 1 }}>
                        Gender
                      </Typography>
                      <Box
                        component='button'
                        onClick={() => setEditDialogOpen(true)}
                        sx={{
                          width: '100%',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          bgcolor: BG_SURFACE, border: `1px solid ${BORDER_LIGHT}`,
                          borderRadius: 1.5, px: 1.875, py: 1.625,
                          cursor: 'pointer', background: 'none', fontFamily: 'inherit',
                          transition: 'all 0.15s',
                          '&:hover': { borderColor: 'primary.main' },
                        }}
                      >
                        <Typography sx={{ fontSize: '14.5px', fontWeight: 600, color: TEXT_HEADING }}>
                          {genderDisplay}
                        </Typography>
                        <ChevronRight sx={{ fontSize: 16, color: TEXT_TERTIARY }} />
                      </Box>
                    </Box>
                    </>
                    )}
                  </Box>
                </Paper>
              </motion.div>

            {/* PASSWORD CARD */}
            <motion.div variants={popIn}>
              <Paper
                elevation={0}
                sx={{
                  border: `1px solid ${BORDER_LIGHT}`,
                  boxShadow: SHADOW_CARD,
                  borderRadius: 2,
                  px: 2.75, py: 2.25,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': { boxShadow: SHADOW_CARD_HOVER },
                }}
              >
                <Stack direction='row' alignItems='center' spacing={1.625}>
                  <Box
                    sx={{
                      width: 40, height: 40, borderRadius: 1.375,
                      bgcolor: PRIMARY_TINT, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', flexShrink: 0,
                    }}
                  >
                    <Lock sx={{ fontSize: 19, color: PRIMARY_MAIN }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '14.5px', fontWeight: 800, color: TEXT_HEADING }}>
                      Password
                    </Typography>
                    <Typography sx={{ fontSize: '12.5px', color: TEXT_TERTIARY, mt: 0.125 }}>
                      We'll email you a secure link to set a new password.
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  variant='outlined'
                  onClick={handlePasswordReset}
                  disabled={resetLoading}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    borderColor: BORDER_LIGHT,
                    color: TEXT_HEADING,
                    '&:hover': { borderColor: BORDER_LIGHT, bgcolor: BG_ROW_SUBTLE },
                  }}
                >
                  {resetLoading ? 'Sending...' : 'Change password'}
                </Button>
              </Paper>
            </motion.div>

            {/* DANGER ZONE - extra separation from the password card above */}
            <motion.div variants={popIn} style={{ marginTop: 44 }}>
              <Stack direction='row' spacing={1.75}>
                {/* Log out button */}
                <Button
                  fullWidth
                  variant='outlined'
                  startIcon={<Logout sx={{ fontSize: 18 }} />}
                  onClick={handleLogout}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 800,
                    fontSize: '14.5px',
                    py: 1.875,
                    borderRadius: 1.625,
                    borderColor: BORDER_LIGHT,
                    color: TEXT_HEADING,
                    '&:hover': { bgcolor: BG_ROW_SUBTLE, borderColor: BORDER_LIGHT },
                  }}
                >
                  Log out
                </Button>

                {/* Delete account - hidden for business owners (server blocks self-delete) */}
                {!isBusinessOwner && (
                  <Button
                    fullWidth
                    variant='outlined'
                    startIcon={<DeleteOutline sx={{ fontSize: 18 }} />}
                    onClick={() => setDeleteDialogOpen(true)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 800,
                      fontSize: '14.5px',
                      py: 1.875,
                      borderRadius: 1.625,
                      borderColor: ERROR_BORDER_TINT,
                      bgcolor: ERROR_BG_TINT,
                      color: ERROR_MAIN,
                      '&:hover': { bgcolor: ERROR_BG_TINT, borderColor: ERROR_BORDER_TINT },
                    }}
                  >
                    Delete account
                  </Button>
                )}
              </Stack>
              {isBusinessOwner && (
                <Typography sx={{ fontSize: '12.5px', color: TEXT_TERTIARY, mt: 1.5 }}>
                  To close your business account, please contact support.
                </Typography>
              )}
            </motion.div>
          </Stack>
        </motion.div>

        {/* Password reset success snackbar */}
        <Snackbar
          open={resetSuccess}
          autoHideDuration={4000}
          onClose={() => setResetSuccess(false)}
          message='Password reset link sent. Check your inbox.'
          sx={{
            '& .MuiSnackbarContent-root': {
              bgcolor: SUCCESS_GREEN,
              fontWeight: 600,
            },
          }}
        />
      </Box>
    </Box>
  );
};

// ─── MAIN EXPORT WITH STATE MANAGEMENT ────────────────────────────────────────

export default function SettingsPage() {
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const handleLogout = useLogout();

  // State management
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Handlers
  const handleProfileSave = async (data: { fullName: string; dateOfBirth: string | null; gender: string | null; state: string | null }) => {
    setEditLoading(true);
    try {
      // Name (all roles) and DOB/gender/state (consumers/managers) go to separate endpoints;
      // only send each when it actually changed. Profile fields run FIRST: they are the ones
      // the server still re-validates (18+/whitelist/allowed states), so if it rejects we bail
      // before touching the name, avoiding a partial save where the name changed but the error
      // implies nothing did.
      if (data.dateOfBirth && data.gender && data.state) {
        await api.post('/auth/profile-setup', {
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          state: data.state,
        });
        dispatch(completeProfileSetup({
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          state: data.state,
        }));
      }
      if (data.fullName && data.fullName !== user?.fullName) {
        await api.post('/auth/update-name', { fullName: data.fullName });
        dispatch(updateProfileName({ fullName: data.fullName }));
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 4000);
    } finally {
      setResetLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await api.delete('/auth/account');
      await handleLogout();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Failed to delete account. Please try again.';
      setDeleteError(msg);
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <SettingsContent
        setEditDialogOpen={setEditDialogOpen}
        resetLoading={resetLoading}
        resetSuccess={resetSuccess}
        setResetSuccess={setResetSuccess}
        handlePasswordReset={handlePasswordReset}
        setDeleteDialogOpen={setDeleteDialogOpen}
      />

      {/* Profile edit dialog */}
      <ProfileEditDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleProfileSave}
        currentFullName={user?.fullName || ''}
        currentDateOfBirth={user?.dateOfBirth || null}
        currentGender={user?.gender || null}
        currentState={user?.state || null}
        showProfileFields={user?.role === 'User' || user?.dateOfBirth != null || user?.gender != null}
        loading={editLoading}
      />

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleteLoading && setDeleteDialogOpen(false)}
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
            Your profile and personal data will be permanently removed. All your entries will be removed and you will not be able to participate in the current campaign. This cannot be undone.
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
            disabled={deleteLoading}
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
            onClick={handleDeleteAccount}
          >
            {deleteLoading ? 'Deleting...' : 'Yes, delete my account'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

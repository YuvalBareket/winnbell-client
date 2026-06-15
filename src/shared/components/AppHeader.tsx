import { useState } from 'react';
import { AppBar, Toolbar, IconButton, Box, Avatar, Stack, Tooltip, CircularProgress } from '@mui/material';
import { NotificationsNoneOutlined, NotificationsActiveOutlined } from '@mui/icons-material';
import { useAppSelector } from '../../store/hook';
import { selectCurrentUser } from '../../store/selectors/authSelectors';
import { GRADIENT_PRIMARY } from '../colors';
import { getUserInitials } from '../utils/string';
import { useNotifications } from '../../features/notifications/useNotifications';
import NotificationPermissionDialog from '../../features/notifications/NotificationPermissionDialog';
import { useInstallPromptTrigger } from '../../features/install/InstallPromptContext';

interface Props {
  onMenuOpen: () => void;
  onGradient?: boolean;
}

const AppHeader = ({ onMenuOpen, onGradient = false }: Props) => {
  const user = useAppSelector(selectCurrentUser);
  const initials = getUserInitials(user?.fullName);
  const { subscribe, unsubscribe, isPending, isSupported, isSubscribed } = useNotifications();
  const [notifDialogOpen, setNotifDialogOpen] = useState(false);
  const { openInstallDialog } = useInstallPromptTrigger();

  return (
    <>
    <AppBar
      position='static'
      elevation={0}
      sx={{
        bgcolor: 'transparent',
        boxShadow: 'none',
        display: { xs: 'flex', md: 'none' },
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 2.5, minHeight: '60px !important' }}>

        {/* Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Stack direction='row' alignItems='center' spacing={-0.3}>
            <Box component='img' src={onGradient?'/winnbell_app_name_white.svg':'/winnbell_app_name.svg'} alt='W' sx={{ height: 38, width: 'auto', objectFit: 'contain' }} />

          </Stack>
        
        </Box>

        {/* Right actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={!isSupported ? 'Install the app to enable notifications' : isSubscribed ? 'Turn off notifications' : 'Enable notifications'}>
              <IconButton
                size='small'
                onClick={() => {
                  if (!isSupported) { openInstallDialog(); return; }
                  if (isSubscribed) { unsubscribe(); } else { setNotifDialogOpen(true); }
                }}
                disabled={isPending}
                sx={{
                  color: onGradient ? 'white' : (isSubscribed ? 'primary.main' : 'text.secondary'),
                  bgcolor: onGradient ? (isSubscribed ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)') : (isSubscribed ? 'primary.main' + '18' : 'rgba(0,0,0,0.04)'),
                  borderRadius: '10px',
                  width: { xs: 40, md: 36 },
                  height: { xs: 40, md: 36 },
                  '&:hover': { bgcolor: onGradient ? 'rgba(255,255,255,0.28)' : (isSubscribed ? 'primary.main' + '28' : 'rgba(0,0,0,0.08)') },
                  '&:active': { transform: 'scale(0.93)', transition: 'transform 150ms ease-out' },
                }}
              >
                {isPending
                  ? <CircularProgress size={18} color='inherit' />
                  : isSubscribed
                    ? <NotificationsActiveOutlined sx={{ fontSize: 20 }} />
                    : <NotificationsNoneOutlined sx={{ fontSize: 20 }} />}
              </IconButton>
            </Tooltip>

          <IconButton
            onClick={onMenuOpen}
            size='small'
            sx={{
              p: 0,
              ml: 0.5,
              '&:hover': { bgcolor: 'transparent' },
              '&:active': { transform: 'scale(0.93)', transition: 'transform 150ms ease-out' },
            }}
          >
            <Avatar
              sx={{
                width: { xs: 40, md: 36 },
                height: { xs: 40, md: 36 },
                background: GRADIENT_PRIMARY,
                color: 'white',
                fontWeight: 800,
                fontSize: 13,
                borderRadius: '12px',
              }}
            >
              {initials}
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>

    <NotificationPermissionDialog
      open={notifDialogOpen}
      onClose={() => setNotifDialogOpen(false)}
      onAllow={() => { subscribe(); setNotifDialogOpen(false); }}
    />
  </>
  );
};

export default AppHeader;
